import streamlit as st
from dotenv import load_dotenv
from collections import defaultdict
from supabase import create_client
import json
import os

load_dotenv()

supabase_url = os.environ.get("SUPABASE_URL")
supabase_api_key = os.environ.get("SUPBASE_KEY")
supabase = create_client(supabase_url, supabase_api_key)


st.set_page_config(page_title="The AI Times", layout="wide")

st.markdown("""
<style>
    /* Fix text breaking */
    .stMarkdown {
        word-wrap: break-word;
        overflow-wrap: break-word;
        word-break: break-word;
    }
    
    /* Ensure proper spacing */
    p {
        word-spacing: normal;
        white-space: normal;
    }
</style>
""", unsafe_allow_html=True)

# Get query parameters
query_params = st.query_params
event_id = query_params.get("event_id", None)

# Get all articles
@st.cache_data(ttl=300)
def get_all_articles():
    return supabase.table('articles').select("*").order('created_at', desc=True).execute().data

articles = get_all_articles()

# Group by event
events = defaultdict(list)
for article in articles:
    events[article['event_id']].append(article)


if event_id:
    # Get articles for this event
    event_articles = events.get(event_id, [])
    
    if not event_articles:
        st.error("Article not found")
        if st.button("← Back to Home"):
            st.query_params.clear()
            st.rerun()
        st.stop()
    
    articles_by_model = {a['model'].lower(): a for a in event_articles}
    
    # Back button
    if st.button("← Back to All Stories"):
        st.query_params.clear()
        st.rerun()
    
    st.divider()
    
    # Model toggle (only show available models)
    available_models = list(articles_by_model.keys())
    model_labels = [m.upper() for m in available_models]
    
    selected_model = st.radio(
        "Select Perspective:",
        available_models,
        format_func=lambda x: x.upper(),
        horizontal=True,
        key="model_toggle"
    )
    
    st.divider()
    
    # Get selected article
    article = articles_by_model[selected_model]
    
    # Display article
    st.markdown(f"# {article['headline']}")
    
    # Metadata
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Model", article['model'].upper())
    with col2:
        st.metric("Words", article.get('word_count', 'N/A'))
    with col3:
        st.metric("Published", article['created_at'][:10])
    
    st.divider()
    
    # Content
    st.write(article['content'])
    
    # Sources
    if article.get('sources'):
        st.divider()
        st.markdown("### 📚 Sources")
        try:
            sources = json.loads(article['sources']) if isinstance(article['sources'], str) else article['sources']
            for i, s in enumerate(sources, 1):
                if s.strip():
                    st.markdown(f"{i}. {s}")
        except:
            st.text(article['sources'])

else:
    st.title("The AI Times")
    st.caption("*World's first AI Newspaper. Researched & Written by AI*")
    st.divider()
    
    st.caption(f"📰 {len(events)} News Stories | 📝 {len(articles)} Total Articles")
    st.divider()
    
    # Display each event
    for event_id, event_articles in events.items():
        
        # Get Claude headline (or fallback to OpenAI)
        articles_by_model = {a['model'].lower(): a for a in event_articles}
        
        if 'claude' in articles_by_model:
            display_headline = articles_by_model['claude']['headline']
            source_model = "Claude"
            st.metric("Published", article['created_at'][:10])
        elif 'openai' in articles_by_model:
            display_headline = articles_by_model['openai']['headline']
            source_model = "OpenAI"
            st.metric("Published", article['created_at'][:10])
        else:
            # Fallback to first available
            display_headline = event_articles[0]['headline']
            source_model = event_articles[0]['model'].upper()
            st.metric("Published", article['created_at'][:10])
        
        # Create clickable card
        col1, col2 = st.columns([10, 1])
        
        with col1:
            # Clickable headline
            if st.button(
                display_headline,
                key=f"btn_{event_id}",
                use_container_width=True,
                type="secondary"
            ):
                st.query_params["event_id"] = event_id
                st.rerun()
        
        st.divider()
    
    # Footer
    st.divider()
    st.caption("Made by Rakshit Lodha with ❤️")