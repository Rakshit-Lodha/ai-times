"""
video_animator.py — For each scene image:
  1. Call Claude Sonnet to write a Kling animation prompt.
  2. Upload the image to fal.ai storage to get a public URL.
  3. Submit to fal-ai/kling-video (image-to-video) and poll until done.
  4. Download the resulting MP4 to out/clips/scene_{id}.mp4

All scenes run in parallel via ThreadPoolExecutor.
"""

import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import anthropic
import fal_client
import requests

from config import ANTHROPIC_API_KEY, CLAUDE_SONNET, OUT_DIR
from prompts import ANIMATION_PROMPT_SYSTEM

_claude = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

CLIPS_DIR = OUT_DIR / "clips"

# Try v2.1 first; v1.6 as fallback
KLING_MODELS = [
    "fal-ai/kling-video/v2.1/pro/image-to-video",
    "fal-ai/kling-video/v1.6/pro/image-to-video",
]


def _generate_animation_prompt(scene: dict) -> str:
    """Use Claude Sonnet to craft a precise Kling animation prompt."""
    user_msg = (
        f"Scene ID: {scene['id']}\n"
        f"Scene description: {scene['scene_description']}\n"
        f"Animation intent: {scene['animation_intent']}"
    )
    for attempt in range(1, 4):
        try:
            resp = _claude.messages.create(
                model=CLAUDE_SONNET,
                max_tokens=350,
                system=ANIMATION_PROMPT_SYSTEM,
                messages=[{"role": "user", "content": user_msg}],
            )
            return resp.content[0].text.strip()
        except Exception as exc:
            print(f"  [animator] Claude attempt {attempt} for {scene['id']} failed: {exc}")
            if attempt < 3:
                time.sleep(2 ** attempt)
            else:
                raise


def _upload_to_fal(image_path: Path) -> str:
    """Upload image to fal.ai storage; return the public URL."""
    print(f"  [animator] Uploading {image_path.name} to fal storage...")
    url = fal_client.upload_file(str(image_path))
    print(f"  [animator] Uploaded → {url[:80]}...")
    return url


def _animate_with_kling(image_url: str, animation_prompt: str, scene_id: str) -> str:
    """Submit to Kling via fal-client; return video URL. Tries model fallbacks."""
    args = {
        "image_url":    image_url,
        "prompt":       animation_prompt,
        "duration":     "5",
        "aspect_ratio": "9:16",
    }

    last_exc = None
    for model in KLING_MODELS:
        try:
            print(f"  [animator] {scene_id} — submitting to {model}...")

            def _on_update(update):
                status = getattr(update, "status", "")
                logs   = getattr(update, "logs", []) or []
                if logs:
                    for log in logs[-2:]:
                        msg = log.get("message", "") if isinstance(log, dict) else str(log)
                        if msg:
                            print(f"    [{scene_id}] {msg}")
                elif status:
                    print(f"    [{scene_id}] status: {status}")

            result = fal_client.subscribe(
                model,
                arguments=args,
                with_logs=True,
                on_queue_update=_on_update,
            )
            video_url = result["video"]["url"]
            print(f"  [animator] {scene_id} — clip ready: {video_url[:80]}...")
            return video_url

        except Exception as exc:
            last_exc = exc
            print(f"  [animator] {scene_id} model {model} failed: {exc}")
            time.sleep(2)

    raise RuntimeError(
        f"All Kling model attempts failed for {scene_id}"
    ) from last_exc


def _download_clip(video_url: str, dest: Path) -> None:
    """Download an MP4 from URL and save to dest."""
    resp = requests.get(video_url, stream=True, timeout=120)
    resp.raise_for_status()
    with dest.open("wb") as f:
        for chunk in resp.iter_content(chunk_size=8192):
            f.write(chunk)
    print(f"  [animator] Saved {dest.name} ({dest.stat().st_size // 1024} KB)")


def _animate_scene(scene: dict, image_path: Path) -> tuple[str, Path]:
    """Full pipeline for one scene. Returns (scene_id, clip_path)."""
    scene_id = scene["id"]
    dest = CLIPS_DIR / f"scene_{scene_id}.mp4"

    if dest.exists():
        print(f"  [animator] {scene_id} — cached, skipping")
        return scene_id, dest

    print(f"  [animator] {scene_id} — generating animation prompt...")
    anim_prompt = _generate_animation_prompt(scene)
    print(f"  [animator] {scene_id} prompt: {anim_prompt[:120]}...")

    image_url  = _upload_to_fal(image_path)
    video_url  = _animate_with_kling(image_url, anim_prompt, scene_id)
    _download_clip(video_url, dest)

    return scene_id, dest


def animate_clips(storyboard: dict, image_paths: dict[str, Path]) -> dict[str, Path]:
    """
    Animate all scenes in parallel.

    Args:
        storyboard:  Full storyboard dict.
        image_paths: {scene_id: Path} from image_generator.

    Returns:
        {scene_id: Path} of downloaded MP4 clips.
    """
    scenes = storyboard["scenes"]
    print(f"  Animating {len(scenes)} scenes in parallel via Kling...")

    results: dict[str, Path] = {}
    with ThreadPoolExecutor(max_workers=len(scenes)) as pool:
        futures = {
            pool.submit(_animate_scene, scene, image_paths[scene["id"]]): scene["id"]
            for scene in scenes
        }
        for future in as_completed(futures):
            scene_id, path = future.result()
            results[scene_id] = path

    print(f"  All {len(results)} clips ready.")
    return results
