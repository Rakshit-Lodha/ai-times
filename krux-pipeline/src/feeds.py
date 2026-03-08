from dataclasses import dataclass


@dataclass(frozen=True)
class FeedSource:
    feed_id: str
    name: str
    url: str
    company: str


FEEDS: list[FeedSource] = [
    FeedSource("openai_blog", "OpenAI Blog", "https://openai.com/blog/rss.xml", "OpenAI"),
    FeedSource("anthropic_news", "Anthropic News", "https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic_news.xml", "Anthropic"),
    FeedSource("google_ai_blog", "Google AI Blog", "https://blog.google/technology/ai/rss/", "Google"),
    FeedSource("deepmind_blog", "DeepMind Blog", "https://deepmind.google/blog/rss.xml", "DeepMind"),
    FeedSource("meta_ai_blog", "Meta Engineering (ML)", "https://engineering.fb.com/category/ml-applications/feed/", "Meta"),
    FeedSource("microsoft_ai_blog", "Microsoft AI Blog", "https://blogs.microsoft.com/ai/feed/", "Microsoft"),
    FeedSource("nvidia_ai_blog", "NVIDIA AI Blog", "https://blogs.nvidia.com/blog/category/deep-learning/feed/", "NVIDIA"),
    FeedSource("huggingface_blog", "Hugging Face Blog", "https://huggingface.co/blog/feed.xml", "Hugging Face"),
]
