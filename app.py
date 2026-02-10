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

# ── Custom CSS for card styling ──
st.markdown("""
<style>
    /* Clean background */
    .stApp {
        background-color: #fafafa;
    }

    /* Card container */
    .card {
        background: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        padding: 28px 28px 16px 28px;
        margin-bottom: 24px;
        transition: box-shadow 0.2s;
    }
    .card:hover {
        box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    }

    /* Headline */
    .card-headline {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0 0 4px 0;
        line-height: 1.35;
    }

    /* Date */
    .card-date {
        font-size: 0.82rem;
        color: #888888;
        margin: 0 0 18px 0;
    }

    /* Body text */
    .card-body {
        font-size: 1.05rem;
        color: #333333;
        line-height: 1.65;
        margin: 0 0 8px 0;
    }

    /* Header area */
    .site-header {
        text-align: center;
        padding: 24px 0 8px 0;
    }
    .site-header h1 {
        font-size: 2rem;
        font-weight: 700;
        margin: 0;
        letter-spacing: -0.5px;
    }
    .site-header p {
        color: #888;
        font-size: 0.95rem;
        margin: 4px 0 0 0;
    }

    /* Hide default streamlit padding on expander */
    .streamlit-expanderHeader {
        font-size: 0.9rem !important;
        font-weight: 500 !important;
        color: #555 !important;
    }

    /* Source links */
    .source-link {
        font-size: 0.88rem;
        color: #555;
        text-decoration: none;
        display: block;
        padding: 4px 0;
    }
    .source-link:hover {
        color: #1a73e8;
    }

    /* Story count badge */
    .story-count {
        text-align: center;
        color: #aaa;
        font-size: 0.85rem;
        margin-bottom: 20px;
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
    """Parse sources from various formats into list of dicts with name/url."""
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


# ── Fetch data ──
@st.cache_data(ttl=300)
def get_all_articles():
    return supabase.table('hundred_word_articles').select("*").order('news_date', desc=True).execute().data

articles = get_all_articles()

# Group by event_id, pick Claude version if available
events = defaultdict(list)
for article in articles:
    events[article['event_id']].append(article)

# For each event, pick the best article (prefer Claude)
display_articles = []
for eid, event_articles in events.items():
    articles_by_model = {a['model_provider'].lower(): a for a in event_articles}
    if 'claude' in articles_by_model:
        display_articles.append(articles_by_model['claude'])
    elif 'openai' in articles_by_model:
        display_articles.append(articles_by_model['openai'])
    else:
        display_articles.append(event_articles[0])

# Sort by news_date descending
display_articles.sort(key=lambda x: x.get('news_date', ''), reverse=True)

# ── Header ──
st.markdown("""
<div class="site-header">
    <h1>Krux</h1>
    <p>Everything about AI — in 100 words</p>
</div>
""", unsafe_allow_html=True)

st.markdown(f'<div class="story-count">📰 {len(display_articles)} stories</div>', unsafe_allow_html=True)

# ── Render cards ──
for article in display_articles:
    headline = article.get('headline', 'Untitled')
    news_date = format_date(article.get('news_date', article.get('created_at', '')))
    content = article.get('output', article.get('content', ''))

    # Card top (headline + date + body) via HTML
    st.markdown(f"""
    <div class="card">
        <p class="card-headline">{headline}</p>
        <p class="card-date">{news_date}</p>
        <p class="card-body">{content}</p>
    </div>
    """, unsafe_allow_html=True)

    # Sources expander (Streamlit native, sits right below card)
    sources = parse_sources(article.get('sources'))
    if sources:
        with st.expander("Sources", expanded=False):
            for s in sources:
                if s["url"]:
                    st.markdown(f"[{s['name']}]({s['url']})")
                else:
                    st.write(s["name"])

# ── Footer ──
st.markdown("---")
st.markdown(
    '<div style="text-align:center; color:#bbb; font-size:0.85rem; padding:8px 0 24px 0;">'
    'Made by Rakshit Lodha with ❤️'
    '</div>',
    unsafe_allow_html=True
)