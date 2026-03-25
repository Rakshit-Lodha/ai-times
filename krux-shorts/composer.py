"""
composer.py — FFmpeg final composition.

Steps:
  1. Loop each 5-second Kling clip to match its scene's duration.
  2. Concatenate all looped scene clips via the concat demuxer.
  3. Mix in the voiceover audio track.
  4. Burn in ASS captions.
  5. Add scene text overlays (drawtext, timed to each segment).
  6. Output out/krux-{date}.mp4 at 1080×1920, crf 18.
"""

import shutil
import subprocess
from pathlib import Path

from config import OUT_DIR, today_ist

TMP_DIR = OUT_DIR / "tmp"


# ── FFmpeg helpers ────────────────────────────────────────────────────────────

_FFMPEG_FALLBACKS = [
    "/opt/homebrew/bin/ffmpeg",
    "/opt/homebrew/Cellar/ffmpeg/8.0.1_4/bin/ffmpeg",
    "/usr/local/bin/ffmpeg",
]

def _ffmpeg() -> str:
    path = shutil.which("ffmpeg")
    if path:
        return path
    for fb in _FFMPEG_FALLBACKS:
        if Path(fb).exists():
            return fb
    raise RuntimeError("ffmpeg not found — install with: brew install ffmpeg")


def _run(cmd: list[str], label: str) -> None:
    joined = " ".join(cmd)
    print(f"  [composer] Running: {joined[:160]}{'...' if len(joined) > 160 else ''}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  [composer] STDERR:\n{result.stderr[-2000:]}")
        raise RuntimeError(f"ffmpeg failed ({label}): exit {result.returncode}")


def _ffprobe_bin() -> str:
    path = shutil.which("ffprobe")
    if path:
        return path
    for fb in _FFMPEG_FALLBACKS:
        probe = fb.replace("ffmpeg", "ffprobe")
        if Path(probe).exists():
            return probe
    return "ffprobe"

def _probe_duration(path: Path) -> float:
    """Return the video duration of a file in seconds via ffprobe."""
    ffprobe = _ffprobe_bin()
    result = subprocess.run(
        [
            ffprobe, "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        capture_output=True, text=True,
    )
    return float(result.stdout.strip() or "5")


# ── Scene clip looping ────────────────────────────────────────────────────────

def _loop_clip_to_duration(clip: Path, target_secs: float, scene_id: str) -> Path:
    """
    Loop `clip` (typically 5 s from Kling) until it reaches `target_secs`.
    Saves to tmp/looped_{scene_id}.mp4. Returns the Path.
    """
    dest = TMP_DIR / f"looped_{scene_id}.mp4"
    if dest.exists():
        return dest

    clip_dur = _probe_duration(clip)
    if clip_dur >= target_secs - 0.1:
        # Already long enough — trim exactly
        cmd = [
            _ffmpeg(), "-y",
            "-i", str(clip),
            "-t", str(target_secs),
            "-c:v", "libx264", "-crf", "18", "-preset", "fast",
            "-an",   # no audio — we add voiceover later
            "-pix_fmt", "yuv420p", "-r", "24",
            str(dest),
        ]
    else:
        # Need to loop: use -stream_loop to repeat, then trim
        loops_needed = int(target_secs / clip_dur) + 2
        cmd = [
            _ffmpeg(), "-y",
            "-stream_loop", str(loops_needed),
            "-i", str(clip),
            "-t", str(target_secs),
            "-c:v", "libx264", "-crf", "18", "-preset", "fast",
            "-an",
            "-pix_fmt", "yuv420p", "-r", "24",
            str(dest),
        ]

    _run(cmd, f"loop_{scene_id}")
    return dest


# ── Text escape ───────────────────────────────────────────────────────────────

def _esc(text: str) -> str:
    """Escape text for safe use in an ffmpeg drawtext filter."""
    return (
        text.replace("\\", "\\\\")
            .replace("'", "\u2019")   # smart apostrophe avoids ffmpeg quoting issues
            .replace(":", "\\:")
            .replace("%", "\\%")
    )


# ── Main composition ──────────────────────────────────────────────────────────

def compose_video(
    storyboard: dict,
    clip_paths: dict[str, Path],
    audio_path: Path,
    caption_path: Path,
) -> Path:
    """
    Compose the final Short MP4.

    Args:
        storyboard:   Full storyboard dict with `scenes`.
        clip_paths:   {scene_id: Path} — Kling clips (5 s each).
        audio_path:   Path to voiceover.mp3.
        caption_path: Path to captions.ass.

    Returns:
        Path to the final out/krux-{date}.mp4
    """
    date_str = today_ist()
    output   = OUT_DIR / f"krux-{date_str}.mp4"
    scenes   = storyboard["scenes"]

    # ── Step 1: Loop each clip to its scene duration ──────────────────────────
    print(f"  [composer] Looping {len(scenes)} clips to target durations...")
    looped: list[Path] = []
    scene_durations: list[float] = []
    for scene in scenes:
        target = float(scene["duration"])
        looped_clip = _loop_clip_to_duration(clip_paths[scene["id"]], target, scene["id"])
        looped.append(looped_clip)
        scene_durations.append(target)
        print(f"    scene '{scene['id']}': {target}s")

    # ── Step 2: Concatenate via concat demuxer ────────────────────────────────
    concat_list = TMP_DIR / "concat.txt"
    concat_list.write_text(
        "\n".join(f"file '{p.resolve()}'" for p in looped),
        encoding="utf-8",
    )
    raw_video = TMP_DIR / "raw_video.mp4"
    cmd = [
        _ffmpeg(), "-y",
        "-f", "concat", "-safe", "0",
        "-i", str(concat_list),
        "-c:v", "libx264", "-crf", "18", "-preset", "fast",
        "-pix_fmt", "yuv420p", "-r", "24",
        str(raw_video),
    ]
    print("  [composer] Concatenating scene clips...")
    _run(cmd, "concat")

    # ── Step 3+4: Add audio + text overlays (pass 1) ─────────────────────────
    # drawtext filters chained together in a single -vf; ass is done separately
    # in pass 2 to avoid FFmpeg 8 filter-parser conflicts with long chains.
    overlay_filters: list[str] = []
    t = 0.0
    for scene, dur in zip(scenes, scene_durations):
        overlay = scene.get("text_overlay", "").strip()
        if overlay:
            overlay_filters.append(
                f"drawtext=text='{_esc(overlay)}'"
                f":fontsize=72:fontcolor=white:bold=1"
                f":x=(w-tw)/2:y=h*0.84-th/2"
                f":box=1:boxcolor=black@0.55:boxborderw=14"
                f":enable='between(t\\,{t:.2f}\\,{t+dur:.2f})'"
            )
        t += dur

    total_dur = sum(scene_durations)
    intermediate = TMP_DIR / f"intermediate_{date_str}.mp4"
    cmd = [
        _ffmpeg(), "-y",
        "-i", str(raw_video),
        "-i", str(audio_path),
    ]
    if overlay_filters:
        cmd += ["-vf", ",".join(overlay_filters)]
    cmd += [
        "-map", "0:v",
        "-map", "1:a",
        "-shortest",
        "-t", str(total_dur + 0.5),
        "-c:v", "libx264", "-crf", "18", "-preset", "fast",
        "-c:a", "aac", "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        str(intermediate),
    ]
    print("  [composer] Pass 1: video + audio + text overlays...")
    _run(cmd, "pass1_overlays")

    # ── Step 5: Burn ASS captions (pass 2) ───────────────────────────────────
    has_captions = caption_path.exists() and caption_path.stat().st_size > 100
    if has_captions:
        print("  [composer] Pass 2: burning ASS captions...")
        ass_path = str(caption_path.resolve())
        cmd2 = [
            _ffmpeg(), "-y",
            "-i", str(intermediate),
            "-vf", f"ass=filename={ass_path}",
            "-c:v", "libx264", "-crf", "18", "-preset", "fast",
            "-c:a", "copy",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            str(output),
        ]
        _run(cmd2, "pass2_captions")
    else:
        print("  [composer] No captions — copying intermediate to output...")
        import shutil as _shutil
        _shutil.copy(str(intermediate), str(output))

    size_mb = output.stat().st_size / (1024 * 1024)
    real_dur = _probe_duration(output)
    print(f"  [composer] Done — {output.name} ({size_mb:.1f} MB, {real_dur:.1f}s)")
    return output
