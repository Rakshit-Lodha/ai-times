#!/usr/bin/env python3
"""
Krux YouTube Shorts Pipeline
=============================
Run: python pipeline.py

Produces: out/krux-YYYY-MM-DD.mp4
No YouTube upload — video file only.
"""

import sys
import time
from pathlib import Path

# Ensure we can import sibling modules when run as a script
sys.path.insert(0, str(Path(__file__).resolve().parent))

# This must come first — sets FAL_KEY env var before fal_client is imported
import config  # noqa: F401

# ── Output dirs ───────────────────────────────────────────────────────────────
for _d in ["out/images", "out/clips", "out/audio", "out/captions", "out/tmp"]:
    (Path(__file__).parent / _d).mkdir(parents=True, exist_ok=True)

# ── Pipeline ──────────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("  KRUX SHORTS PIPELINE")
print("=" * 60)

t_start = time.time()

# ── Step 1: Story selection ───────────────────────────────────────────────────
print("\n📰  STEP 1: Selecting today's best story...")
from story_selector import select_story
story = select_story()
print(f"\n  ✅  Selected: {story['headline']}")
print(f"      ICP Reason:      {story['icp_reason']}")
print(f"      Narrative Angle: {story['narrative_angle']}")
print(f"      Tone:            {story['tone']}")

# ── Step 2: Storyboard ────────────────────────────────────────────────────────
print("\n🎬  STEP 2: Generating storyboard...")
from storyboard import generate_storyboard
storyboard = generate_storyboard(story)
print(f"\n  ✅  Storyboard: {len(storyboard['scenes'])} scenes, ~{storyboard['total_duration']}s")
print(f"      Title: {storyboard['title']}")
for scene in storyboard["scenes"]:
    narr_preview = scene["narration"][:70].replace("\n", " ")
    print(f"      [{scene['id']:16s}] {scene['duration']:2d}s — \"{narr_preview}...\"")

# ── Step 3: Image generation ─────────────────────────────────────────────────
print("\n🖼️   STEP 3: Generating scene images (parallel)...")
from image_generator import generate_images
image_paths = generate_images(storyboard)
print(f"\n  ✅  Generated {len(image_paths)} images")
for sid, p in image_paths.items():
    print(f"      {sid:16s} → {p.name} ({p.stat().st_size // 1024} KB)")

# ── Step 4: Video animation ───────────────────────────────────────────────────
print("\n🎥  STEP 4: Animating images → video clips (parallel)...")
from video_animator import animate_clips
clip_paths = animate_clips(storyboard, image_paths)
print(f"\n  ✅  Generated {len(clip_paths)} video clips")
for sid, p in clip_paths.items():
    print(f"      {sid:16s} → {p.name} ({p.stat().st_size // 1024} KB)")

# ── Step 5: Voiceover ─────────────────────────────────────────────────────────
print("\n🎙️   STEP 5: Generating voiceover...")
from voiceover import generate_voiceover
audio_path = generate_voiceover(storyboard)
print(f"\n  ✅  Voiceover: {audio_path} ({audio_path.stat().st_size // 1024} KB)")

# ── Step 6: Captions ─────────────────────────────────────────────────────────
print("\n📝  STEP 6: Generating captions (Whisper)...")
from captions import generate_captions
caption_path = generate_captions(audio_path, storyboard)
print(f"\n  ✅  Captions: {caption_path}")

# ── Step 7: Compose ───────────────────────────────────────────────────────────
print("\n🎞️   STEP 7: Composing final video (FFmpeg)...")
from composer import compose_video
output_path = compose_video(storyboard, clip_paths, audio_path, caption_path)

elapsed = time.time() - t_start
print(f"\n{'=' * 60}")
print(f"  PIPELINE COMPLETE  ({elapsed:.0f}s total)")
print(f"  Output: {output_path}")
print(f"  Title:  {storyboard['title']}")
print(f"{'=' * 60}\n")
