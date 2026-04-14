import streamlit as st
from datetime import datetime, timezone

from creator_pipeline.clients import supabase
from creator_pipeline.steps.research import run as run_research
from creator_pipeline.steps.script_generator import run as run_script_generation

st.set_page_config(page_title="Creator Content Desk", layout="wide")


@st.cache_data(ttl=120)
def fetch_candidates(statuses: list[str] | None = None):
    query = supabase.table("creator_topic_candidates").select("*").order("score", desc=True).order("created_at", desc=True)
    if statuses:
        query = query.in_("status", statuses)
    return query.execute().data


@st.cache_data(ttl=120)
def fetch_research(topic_id: str):
    return (
        supabase.table("creator_research_briefs")
        .select("*")
        .eq("topic_id", topic_id)
        .order("created_at", desc=True)
        .execute()
        .data
    )


@st.cache_data(ttl=120)
def fetch_scripts(topic_id: str):
    return (
        supabase.table("creator_scripts")
        .select("*")
        .eq("topic_id", topic_id)
        .order("created_at", desc=True)
        .execute()
        .data
    )


def clear_cache():
    st.cache_data.clear()


def update_status(topic_id: str, status: str):
    payload = {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}
    if status in {"selected", "auto_selected"}:
        payload["selected_at"] = datetime.now(timezone.utc).isoformat()
    supabase.table("creator_topic_candidates").update(payload).eq("id", topic_id).execute()
    clear_cache()


def render_sources(sources):
    if not sources:
        return
    with st.expander("Sources"):
        for source in sources:
            if isinstance(source, dict):
                name = source.get("name") or source.get("url") or "Source"
                url = source.get("url")
                st.markdown(f"- [{name}]({url})" if url else f"- {name}")


def candidate_card(item):
    with st.container(border=True):
        st.caption(f"{item.get('category')} | score {item.get('score')} | {item.get('status')}")
        st.subheader(item.get("title"))
        st.write(item.get("summary"))
        if item.get("suggested_angle"):
            st.write(f"Angle: {item['suggested_angle']}")
        if item.get("why_relevant"):
            st.write(f"Why relevant: {item['why_relevant']}")
        render_sources(item.get("source_urls"))

        cols = st.columns(4)
        if cols[0].button("Select", key=f"select-{item['id']}"):
            update_status(item["id"], "selected")
            st.rerun()
        if cols[1].button("Reject", key=f"reject-{item['id']}"):
            update_status(item["id"], "rejected")
            st.rerun()
        if cols[2].button("Save", key=f"save-{item['id']}"):
            update_status(item["id"], "saved")
            st.rerun()
        if cols[3].button("Research", key=f"research-{item['id']}"):
            with st.spinner("Running deep research..."):
                run_research(item["id"])
            clear_cache()
            st.rerun()


st.title("Creator Content Desk")
st.caption("Daily topics, research briefs, and scripts for one creator.")

tab_topics, tab_selected, tab_research, tab_library = st.tabs(
    ["Daily Topics", "Selected Queue", "Research & Script", "Content Library"]
)

with tab_topics:
    st.header("Daily Topics")
    categories = [
        "all",
        "paid ads & growth",
        "government schemes & policy",
        "startup ideas & opportunities",
        "ecommerce",
        "business strategy",
        "sales & negotiation",
        "marketing",
        "investing & finance",
        "personal development",
    ]
    category = st.selectbox("Category", categories)
    candidates = fetch_candidates(["new", "saved", "auto_selected"])
    if category != "all":
        candidates = [c for c in candidates if c.get("category") == category]
    for item in candidates:
        candidate_card(item)

with tab_selected:
    st.header("Selected Queue")
    selected = fetch_candidates(["selected", "auto_selected", "researched"])
    for item in selected:
        candidate_card(item)

with tab_research:
    st.header("Research & Script")
    selected = fetch_candidates(["selected", "auto_selected", "researched", "scripted"])
    topic_options = {f"{item['title']} ({item['status']})": item for item in selected}
    if not topic_options:
        st.info("No selected topics yet.")
    else:
        label = st.selectbox("Topic", list(topic_options.keys()))
        topic = topic_options[label]
        st.subheader(topic["title"])
        st.write(topic.get("summary"))

        cols = st.columns(2)
        if cols[0].button("Run Deep Research"):
            with st.spinner("Running deep research..."):
                run_research(topic["id"])
            clear_cache()
            st.rerun()
        if cols[1].button("Generate Script"):
            with st.spinner("Generating script..."):
                run_script_generation(topic["id"])
            clear_cache()
            st.rerun()

        research_rows = fetch_research(topic["id"])
        if research_rows:
            st.subheader("Latest Research Brief")
            latest = research_rows[0]
            st.markdown(latest["brief"])
            render_sources(latest.get("source_urls"))

        script_rows = fetch_scripts(topic["id"])
        if script_rows:
            st.subheader("Latest Script")
            latest_script = script_rows[0]
            st.write("Hooks")
            for hook in latest_script.get("hook_options") or []:
                st.markdown(f"- {hook}")
            st.text_area("Final script", latest_script.get("final_script", ""), height=320)
            st.text_area("Caption", latest_script.get("caption", ""), height=120)
            if latest_script.get("cta"):
                st.write(f"CTA: {latest_script['cta']}")

with tab_library:
    st.header("Content Library")
    scripted = fetch_candidates(["scripted"])
    for item in scripted:
        with st.container(border=True):
            st.subheader(item["title"])
            st.caption(f"{item.get('category')} | {item.get('created_at')}")
            scripts = fetch_scripts(item["id"])
            if scripts:
                st.write(scripts[0].get("final_script", "")[:1000])
