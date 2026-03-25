"""
image_generator.py — For each storyboard scene:
  1. Call Claude Sonnet to write a cinematic image prompt.
  2. Call OpenAI gpt-image-1 to generate the image.
  3. Save PNG to out/images/scene_{id}.png

All scenes run in parallel via ThreadPoolExecutor.
"""

import base64
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import anthropic
from openai import OpenAI

from config import ANTHROPIC_API_KEY, CLAUDE_SONNET, OPENAI_API_KEY, OUT_DIR
from prompts import IMAGE_PROMPT_SYSTEM

_claude  = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
_openai  = OpenAI(api_key=OPENAI_API_KEY)

IMAGES_DIR = OUT_DIR / "images"


def _generate_image_prompt(scene: dict) -> str:
    """Use Claude Sonnet to craft a detailed image prompt from the scene description."""
    user_msg = (
        f"Scene ID: {scene['id']}\n"
        f"Scene description: {scene['scene_description']}\n"
        f"Animation intent: {scene['animation_intent']}"
    )
    for attempt in range(1, 4):
        try:
            resp = _claude.messages.create(
                model=CLAUDE_SONNET,
                max_tokens=400,
                system=IMAGE_PROMPT_SYSTEM,
                messages=[{"role": "user", "content": user_msg}],
            )
            return resp.content[0].text.strip()
        except Exception as exc:
            print(f"  [image_gen] Claude prompt attempt {attempt} for {scene['id']} failed: {exc}")
            if attempt < 3:
                time.sleep(2 ** attempt)
            else:
                raise


def _generate_and_save(scene: dict) -> tuple[str, Path]:
    """Generate image for one scene. Returns (scene_id, image_path)."""
    scene_id = scene["id"]
    dest = IMAGES_DIR / f"scene_{scene_id}.png"

    if dest.exists():
        print(f"  [image_gen] {scene_id} — cached, skipping")
        return scene_id, dest

    print(f"  [image_gen] {scene_id} — generating image prompt via Claude...")
    image_prompt = _generate_image_prompt(scene)
    print(f"  [image_gen] {scene_id} prompt: {image_prompt[:120]}...")

    print(f"  [image_gen] {scene_id} — calling gpt-image-1...")
    for attempt in range(1, 4):
        try:
            result = _openai.images.generate(
                model="gpt-image-1",
                prompt=image_prompt,
                size="1024x1536",   # portrait (closest to 9:16 that gpt-image-1 supports)
                quality="high",
                n=1,
            )
            img_bytes = base64.b64decode(result.data[0].b64_json)
            dest.write_bytes(img_bytes)
            print(f"  [image_gen] {scene_id} — saved {dest.name} ({len(img_bytes)//1024} KB)")
            return scene_id, dest
        except Exception as exc:
            print(f"  [image_gen] {scene_id} OpenAI attempt {attempt} failed: {exc}")
            if attempt < 3:
                time.sleep(3 ** attempt)
            else:
                raise


def generate_images(storyboard: dict) -> dict[str, Path]:
    """
    Generate images for all scenes in parallel.

    Returns:
        {scene_id: Path} for every scene.
    """
    scenes = storyboard["scenes"]
    print(f"  Generating {len(scenes)} scene images in parallel...")

    results: dict[str, Path] = {}
    with ThreadPoolExecutor(max_workers=len(scenes)) as pool:
        futures = {pool.submit(_generate_and_save, scene): scene["id"] for scene in scenes}
        for future in as_completed(futures):
            scene_id, path = future.result()
            results[scene_id] = path

    print(f"  All {len(results)} images ready.")
    return results
