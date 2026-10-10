# Krux.news

Krux.news is an AI-news product that turns fast-moving source material into short, swipeable stories. The product promise is simple: take important AI updates, synthesize them into roughly 100 words, generate a matching visual, and publish them in a mobile-first feed at https://krux.news/.

This README intentionally covers only `Krux.news` as a whole. It does not document the other experiments and products in this repository.

## What Krux.news Does

Krux.news combines a content pipeline and a web app:

- The pipeline monitors a defined set of AI company feeds, stores incoming items as JSON files in this repo, curates the best stories, researches them with web search, writes structured 100-word summaries, and generates article images.
- The web app reads those published stories from the repo and renders them as a swipe-first feed with deep links, story detail pages, RSS, sitemap support, and basic engagement tracking.

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
- `images`: creates article art with OpenAI image generation and saves it as WebP in `krux-web/public/article-images/`.

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
- Swipe reactions tracked as `story_swipe` events in Google Analytics

The main product entry points are:

- [`krux-web/app/page.tsx`](/Users/Rakshit.Lodha/Desktop/ai-times/krux-web/app/page.tsx)
- [`krux-web/components/SwipeDeck.tsx`](/Users/Rakshit.Lodha/Desktop/ai-times/krux-web/components/SwipeDeck.tsx)
- [`krux-web/app/story/[storySlug]/page.tsx`](/Users/Rakshit.Lodha/Desktop/ai-times/krux-web/app/story/[storySlug]/page.tsx)

## Hosting and Data (all free tier)

Krux.news runs without a paid database or server:

| Piece | Where it runs |
| --- | --- |
| Website (`krux-web`) | Vercel Hobby, root directory `krux-web`, auto-deploys on every push to `main` |
| Daily pipeline (`krux-pipeline`) | Not scheduled. Run it manually if you want new stories |
| Database | JSON files committed to this repo, written by `krux-pipeline/src/store.py` |
| Images | WebP files in `krux-web/public/article-images/`, served by Vercel's CDN |

The site is currently an archive: nothing publishes new stories automatically. Running the pipeline locally and pushing its changes adds stories and redeploys the site.

Tables (one JSON array per file):

- `krux-pipeline/data/webhooks.json`: raw RSS entries captured by the monitor
- `krux-pipeline/data/curation_audit.json`: daily curation summary metadata
- `krux-pipeline/data/curation_selected_items.json`: stories selected for deeper processing
- `krux-pipeline/data/research_assistant.json`: researched story briefs
- `krux-web/data/hundred_word_articles.json`: final published stories shown in the app
- `krux-web/data/learn_stacks.json`, `krux-web/data/learn_stack_cards.json`: KRUX Learn stacks

The site used to run on Supabase and Render. Everything from that Supabase project, including tables that Krux no longer uses (`articles`, `creator_*`), was exported into the repo; see `supabase-export/` for those tables and the original schema.

## Tech Stack

### Web

- Next.js 16
- React 19
- TypeScript
- Framer Motion

### Pipeline

- Python
- Pillow
- Anthropic SDK
- OpenAI SDK
- Feedparser

## Environment Variables

### Pipeline (only if you run it locally)

- `CLAUDE_API_KEY` (required)
- `OPENAI_API_KEY` (required)
- `PARALLEL_API_KEY`, `RESEND_API_KEY`, `ALERT_EMAIL` (optional, for health-check alerts)

### Web (Vercel project settings)

- `NEXT_PUBLIC_SITE_URL` or `SITE_URL` (optional, defaults to `https://krux.news`)

The story feed needs no secrets. The side features (`/api/generate-profile`, `/api/submit-sitemap`, `/groweasy`) read `CLAUDE_API_KEY`, `EXA_API_KEY`, `GSC_SERVICE_ACCOUNT_KEY`, `SUBMIT_SITEMAP_SECRET` and `NEXT_PUBLIC_GROWEASY_URL`.

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

1. Run the pipeline locally (`python -m src` in `krux-pipeline`). It writes new stories into `krux-web/data/` and images into `krux-web/public/article-images/`.
2. Commit and push to `main`. Vercel redeploys `krux-web`.
3. The web app reads `krux-web/data/hundred_word_articles.json` and serves the feed, story pages, RSS, and sitemaps.

## Repo Scope

If you are working on Krux.news, the primary folders are:

- [`krux-web`](/Users/Rakshit.Lodha/Desktop/ai-times/krux-web)
- [`krux-pipeline`](/Users/Rakshit.Lodha/Desktop/ai-times/krux-pipeline)

Everything else in the repository should be treated as out of scope for this README unless it is later folded into the core Krux.news product.
