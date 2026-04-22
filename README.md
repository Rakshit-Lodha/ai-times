# Krux.news

Krux.news is an AI-news product that turns fast-moving source material into short, swipeable stories. The product promise is simple: take important AI updates, synthesize them into roughly 100 words, generate a matching visual, and publish them in a mobile-first feed at https://krux.news/.

This README intentionally covers only `Krux.news` as a whole. It does not document the other experiments and products in this repository.

## What Krux.news Does

Krux.news combines a content pipeline and a web app:

- The pipeline monitors a defined set of AI company feeds, stores incoming items in Supabase, curates the best stories, researches them with web search, writes structured 100-word summaries, and generates article images.
- The web app reads those published stories from Supabase and renders them as a swipe-first feed with deep links, story detail pages, RSS, sitemap support, and basic engagement tracking.

At a high level, the product flow is:

1. Ingest raw feed entries.
2. Curate the day’s most relevant stories.
3. Expand each selected story into a research brief.
4. Compress that research into a concise article.
5. Generate and attach an image.
6. Serve the result in the `Krux.news` client.

## Product Architecture

### 1. News Pipeline

The pipeline lives in [`krux-pipeline`](/Users/Rakshit.Lodha/Desktop/ai-times/krux-pipeline).

Its core stages are:

- `rss_monitor`: pulls source entries from AI-related RSS feeds and writes them into the `webhooks` table.
- `content_selector`: sends the raw daily batch to Claude to select the best stories and assign topics.
- `research`: uses OpenAI with `web_search` to turn curated items into richer research notes.
- `summary`: uses Claude tool calls to convert research into structured 100-word articles.
- `images`: creates article art with OpenAI image generation and uploads it to Supabase Storage.

Current feed sources are hard-coded in [`krux-pipeline/src/feeds.py`](/Users/Rakshit.Lodha/Desktop/ai-times/krux-pipeline/src/feeds.py) and include sources such as OpenAI, Anthropic, Google AI, DeepMind, Meta, Microsoft, NVIDIA, and Hugging Face.

### 2. Web App

The web app lives in [`krux-web`](/Users/Rakshit.Lodha/Desktop/ai-times/krux-web).

Key behaviors:

- Homepage feed backed by `hundred_word_articles`
- Mobile swipe deck with topic filters and “today” filtering in IST
- Shareable deep links into a specific story
- Dedicated article pages at `/story/[id-slug]`
- RSS feed at `/feed.xml`
- XML sitemaps for general indexing and Google News
- PWA manifest and app icons
- Swipe reaction tracking through a Supabase RPC

The main product entry points are:

- [`krux-web/app/page.tsx`](/Users/Rakshit.Lodha/Desktop/ai-times/krux-web/app/page.tsx)
- [`krux-web/components/SwipeDeck.tsx`](/Users/Rakshit.Lodha/Desktop/ai-times/krux-web/components/SwipeDeck.tsx)
- [`krux-web/app/story/[storySlug]/page.tsx`](/Users/Rakshit.Lodha/Desktop/ai-times/krux-web/app/story/[storySlug]/page.tsx)

## Data Model

Krux.news depends on Supabase for both storage and serving.

Relevant tables and storage surfaced by the code:

- `webhooks`: raw RSS entries captured by the monitor
- `curation_audit`: daily curation summary metadata
- `curation_selected_items`: stories selected for deeper processing
- `research_assistant`: researched story briefs
- `hundred_word_articles`: final published stories shown in the app
- `article-image`: Supabase Storage bucket for generated story images

The web app also calls a Supabase RPC named `increment_swipe` to record `like` and `skip` reactions.

## Tech Stack

### Web

- Next.js 16
- React 19
- TypeScript
- Framer Motion
- Supabase JS client

### Pipeline

- Python
- Supabase Python client
- Anthropic SDK
- OpenAI SDK
- Feedparser

## Environment Variables

The code currently expects these environment variables:

### Shared / pipeline

- `SUPABASE_URL`
- `SUPBASE_KEY`
- `CLAUDE_API_KEY`
- `OPENAI_API_KEY`

### Web

- `NEXT_SUPABASE_URL`
- `NEXT_SUPBASE_KEY`
- `NEXT_PUBLIC_SITE_URL` or `SITE_URL`

Note: the code uses the spelling `SUPBASE_KEY` and `NEXT_SUPBASE_KEY` without the second `A`. The README keeps that spelling because that is what the current code reads.

## Local Development

### Run the web app

```bash
cd krux-web
npm install
npm run dev
```

The app will start on the default Next.js local server, typically `http://localhost:3000`.

### Run the pipeline

```bash
cd krux-pipeline
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m src --dry-run
```

Useful pipeline options from [`krux-pipeline/src/main.py`](/Users/Rakshit.Lodha/Desktop/ai-times/krux-pipeline/src/main.py):

- `--date YYYY-MM-DD`: process a specific day
- `--dry-run`: execute without database writes
- `--step 0`: RSS monitor only
- `--step 1`: curation only
- `--step 2`: research only
- `--step 3`: summary generation only
- `--step 4`: image generation only

## Publish Flow

The intended end-to-end flow in this repo is:

1. The Python pipeline writes finalized stories into Supabase.
2. The Next.js app reads those stories from `hundred_word_articles`.
3. The web app exposes feed, story pages, RSS, sitemap, and metadata for distribution.

## Repo Scope

If you are working on Krux.news, the primary folders are:

- [`krux-web`](/Users/Rakshit.Lodha/Desktop/ai-times/krux-web)
- [`krux-pipeline`](/Users/Rakshit.Lodha/Desktop/ai-times/krux-pipeline)

Everything else in the repository should be treated as out of scope for this README unless it is later folded into the core Krux.news product.
