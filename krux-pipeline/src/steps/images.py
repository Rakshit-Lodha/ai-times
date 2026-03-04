import base64
import logging

from ..clients import supabase, claude, openai_client
from ..prompts.image import SYSTEM_PROMPT
from ..utils.retry import retry

logger = logging.getLogger(__name__)


def fetch_articles_without_images() -> list[dict]:
    """Fetch articles from hundred_word_articles where image_url is NULL."""
    result = (
        supabase.table("hundred_word_articles")
        .select("id", "headline", "output", "image_url")
        .is_("image_url", "null")
        .order("created_at", desc=False)
        .execute()
    )
    return result.data


@retry(max_attempts=3, exceptions=(Exception,))
def generate_image_prompt(article: dict) -> str:
    """Use Claude to generate a concise image prompt from the article."""
    response = claude.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=85,
        system=SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": f"Story headline: {article['headline']}\nStory summary: {article['output']}",
        }],
    )
    return response.content[0].text


@retry(max_attempts=3, exceptions=(Exception,))
def generate_image(prompt_text: str) -> bytes:
    """Generate an image using OpenAI and return raw PNG bytes."""
    result = openai_client.images.generate(
        model="gpt-image-1-mini",
        prompt=prompt_text,
        size="1536x1024",
    )
    return base64.b64decode(result.data[0].b64_json)


@retry(max_attempts=3, exceptions=(Exception,))
def upload_to_storage(article_id: int, image_bytes: bytes) -> str:
    """Upload image to Supabase storage and return the public URL."""
    file_name = f"{article_id}.png"

    supabase.storage.from_("article-image").upload(
        file_name,
        image_bytes,
        file_options={"content-type": "image/png", "upsert": "true"},
    )

    return supabase.storage.from_("article-image").get_public_url(file_name)


def update_image_url(article_id: int, public_url: str) -> None:
    """Update the article's image_url in hundred_word_articles."""
    supabase.table("hundred_word_articles").update(
        {"image_url": public_url}
    ).eq("id", article_id).execute()


def run(dry_run: bool = False) -> int:
    """Generate and upload images for all articles missing images. Returns success count."""
    articles = fetch_articles_without_images()
    if not articles:
        logger.info("No articles need images")
        return 0

    logger.info("Generating images for %d articles", len(articles))
    success, failed = 0, 0

    for article in articles:
        try:
            prompt_text = generate_image_prompt(article)
            logger.info("Image prompt for %d: %s", article["id"], prompt_text[:80])

            if dry_run:
                logger.info("[DRY RUN] Would generate and upload image for article %d", article["id"])
                success += 1
                continue

            image_bytes = generate_image(prompt_text)
            public_url = upload_to_storage(article["id"], image_bytes)
            update_image_url(article["id"], public_url)

            success += 1
            logger.info("Image saved for article %d: %s", article["id"], public_url)
        except Exception as e:
            logger.error("Image failed for article %d: %s", article["id"], e, exc_info=True)
            failed += 1

    logger.info("Images: %d succeeded, %d failed", success, failed)
    return success
