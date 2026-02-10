import streamlit as st
from dotenv import load_dotenv
from collections import defaultdict
from supabase import create_client
import json
import os
from datetime import datetime

load_dotenv()

supabase_url = os.environ.get("SUPABASE_URL")
supabase_api_key = os.environ.get("SUPBASE_KEY")
supabase = create_client(supabase_url, supabase_api_key)

st.set_page_config(page_title="Krux", layout="centered")

# ── Custom CSS ──
st.markdown("""
<style>
    .stApp {
        background-color: #fafafa;
    }

    /* Card */
    .card {
        background: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        padding: 24px 24px 12px 24px;
        margin-bottom: 24px;
        transition: box-shadow 0.2s;
    }
    .card:hover {
        box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    }

    .card-headline {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0 0 4px 0;
        line-height: 1.35;
    }

    .card-date {
        font-size: 0.82rem;
        color: #888888;
        margin: 0 0 18px 0;
    }

    .card-body {
        font-size: 1.05rem;
        color: #333333;
        line-height: 1.65;
        margin: 0 0 16px 0;
    }

    /* Sources dropdown inside card */
    .card details {
        border-top: 1px solid #eee;
        padding-top: 10px;
        margin-top: 8px;
    }
    .card details summary {
        font-size: 0.9rem;
        font-weight: 500;
        color: #666;
        cursor: pointer;
        padding: 4px 0;
    }
    .card details[open] summary {
        margin-bottom: 8px;
    }
    .card details .source-item {
        font-size: 0.85rem;
        color: #555;
        padding: 3px 0;
    }
    .card details .source-item a {
        color: #1a73e8;
        text-decoration: none;
    }
    .card details .source-item a:hover {
        text-decoration: underline;
    }

    .story-count {
        text-align: center;
        color: #aaa;
        font-size: 0.85rem;
        margin-bottom: 12px;
    }

    .footer {
        text-align: center;
        color: #bbb;
        font-size: 0.85rem;
        padding: 8px 0 24px 0;
    }
</style>
""", unsafe_allow_html=True)


def format_date(date_string):
    try:
        date_obj = datetime.strptime(date_string[:10], '%Y-%m-%d')
        day = date_obj.day
        if 10 <= day % 100 <= 20:
            suffix = 'th'
        else:
            suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(day % 10, 'th')
        return date_obj.strftime(f'{day}{suffix} %B %Y')
    except:
        return date_string[:10]


def parse_sources(raw_sources):
    if not raw_sources:
        return []
    try:
        sources = json.loads(raw_sources) if isinstance(raw_sources, str) else raw_sources
    except:
        return [{"name": str(raw_sources), "url": ""}]
    parsed = []
    for s in sources:
        if isinstance(s, dict):
            parsed.append({"name": s.get("name", ""), "url": s.get("url", "")})
        elif isinstance(s, str) and s.strip():
            parsed.append({"name": s.strip(), "url": ""})
    return parsed


def build_sources_html(raw_sources):
    sources = parse_sources(raw_sources)
    if not sources:
        return ""
    items = ""
    for s in sources:
        if s["url"]:
            items += f'<div class="source-item"><a href="{s["url"]}" target="_blank">{s["name"]}</a></div>'
        elif s["name"]:
            items += f'<div class="source-item">{s["name"]}</div>'
    if not items:
        return ""
    return f"<details><summary>Sources</summary>{items}</details>"


# ── Fetch data ──
@st.cache_data(ttl=300)
def get_all_articles():
    return supabase.table('hundred_word_articles').select("*").order('news_date', desc=True).execute().data

articles = get_all_articles()

# Group by event_id, pick Claude version
events = defaultdict(list)
for article in articles:
    events[article['event_id']].append(article)

display_articles = []
for eid, event_articles in events.items():
    articles_by_model = {a['model_provider'].lower(): a for a in event_articles}
    if 'claude' in articles_by_model:
        display_articles.append(articles_by_model['claude'])
    elif 'openai' in articles_by_model:
        display_articles.append(articles_by_model['openai'])
    else:
        display_articles.append(event_articles[0])

display_articles.sort(key=lambda x: x.get('news_date', ''), reverse=True)

# ── Header (native Streamlit — works on mobile) ──
st.markdown("<h1 style='text-align:center; margin-bottom:0;'>Krux</h1>", unsafe_allow_html=True)
st.markdown("<p style='text-align:center; color:#888; margin-top:4px;'>Everything about AI — in 100 words</p>", unsafe_allow_html=True)
st.markdown(f'<div class="story-count">📰 {len(display_articles)} stories</div>', unsafe_allow_html=True)

# ── Render cards (single HTML block per card, sources included) ──
for article in display_articles:
    headline = article.get('headline', 'Untitled')
    news_date = format_date(article.get('news_date', article.get('created_at', '')))
    content = article.get('output', article.get('content', ''))
    sources_html = build_sources_html(article.get('sources'))

    st.markdown(f"""
    <div class="card">
        <p class="card-headline">{headline}</p>
        <p class="card-date">{news_date}</p>
        <p class="card-body">{content}</p>
        {sources_html}
    </div>
    """, unsafe_allow_html=True)

# ── Footer ──
st.markdown("---")
st.markdown('<div class="footer">Made by Rakshit Lodha with ❤️</div>', unsafe_allow_html=True)