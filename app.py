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


st.set_page_config(page_title="Krux", layout="wide")



def format_date(date_string):
    try:
        date_obj = datetime.strptime(date_string[:10], '%Y-%m-%d')
        day = date_obj.day
        
        # Add suffix (1st, 2nd, 3rd, 4th, etc.)
        if 10 <= day % 100 <= 20:
            suffix = 'th'
        else:
            suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(day % 10, 'th')
        
        return date_obj.strftime(f'{day}{suffix} %B %Y')
    except:
        return date_string[:10]

# Helper function to create excerpt
def create_excerpt(content, max_length=200):
    """Create a short excerpt from content"""
    # Remove markdown asterisks
    clean_content = content.replace('*', '').strip()
    
    # Get first paragraph or first max_length characters
    paragraphs = clean_content.split('\n\n')
    first_para = paragraphs[0] if paragraphs else clean_content
    
    if len(first_para) <= max_length:
        return first_para + "......"
    else:
        # Cut at last space before max_length
        excerpt = first_para[:max_length]
        last_space = excerpt.rfind(' ')
        if last_space > 0:
            excerpt = excerpt[:last_space]
        return excerpt + "......"


# Get query parameters
query_params = st.query_params
event_id = query_params.get("event_id", None)

# Get all articles
# @st.cache_data(ttl=300)
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
    st.text(article['content'])
    
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
    st.title("Krux")
    st.caption("*The world's first autonomous AI newsroom. Get to the Krux NOW.*")
    st.divider()
    
    st.caption(f"📰 {len(events)} News Stories | 📝 {len(articles)} Total Articles")
    st.divider()
    
    # Display each event as a card
    for event_id, event_articles in events.items():
        
        # Get Claude headline (or fallback to OpenAI)
        articles_by_model = {a['model'].lower(): a for a in event_articles}
        
        if 'claude' in articles_by_model:
            display_article = articles_by_model['claude']
        elif 'openai' in articles_by_model:
            display_article = articles_by_model['openai']
        else:
            display_article = event_articles[0]
        
        # Create clickable card
        # Create article card
        with st.container():
            # Headline
            st.markdown(f"### {display_article['headline']}")
            
            # Date
            formatted_date = format_date(display_article['created_at'])
            st.caption(f"Published On: {formatted_date}")
            
            # Excerpt
            excerpt = create_excerpt(display_article['content'], max_length=200)
            st.write(excerpt)
            
            # Read More button
            if st.button("Read More", key=f"btn_{event_id}", type="secondary"):
                st.query_params["event_id"] = event_id
                st.rerun()
        
        st.divider()
    
    # Footer
    st.caption("Made by Rakshit Lodha with ❤️")