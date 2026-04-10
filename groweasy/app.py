import os
import re
import tempfile

import anthropic
import streamlit as st
import yt_dlp
from dotenv import load_dotenv
from pydub import AudioSegment
from sarvamai import SarvamAI

load_dotenv()

# ---------------------------------------------------------------------------
# Clients
# ---------------------------------------------------------------------------
client_sarvam = SarvamAI(api_subscription_key=os.getenv("SARVAM_API_KEY"))
client_anthropic = anthropic.Anthropic(api_key=os.getenv("CLAUDE_API_KEY"))

# ---------------------------------------------------------------------------
# URL validation
# ---------------------------------------------------------------------------
VALID_PATTERNS = [
    r"instagram\.com/reel/",
    r"instagram\.com/p/",
]

YOUTUBE_PATTERNS = [
    r"youtube\.com/",
    r"youtu\.be/",
]

INSTAGRAM_PROFILE_PATTERNS = [
    r"instagram\.com/[^/]+/?$",
]


def validate_url(url: str) -> tuple[bool, str]:
    """Return (is_valid, reason). reason is empty string when valid."""
    url = url.strip()
    if not url:
        return False, "empty"
    for pattern in VALID_PATTERNS:
        if re.search(pattern, url):
            return True, ""
    for pattern in YOUTUBE_PATTERNS:
        if re.search(pattern, url):
            return False, f"YouTube URLs are not supported yet — skipping: {url}"
    for pattern in INSTAGRAM_PROFILE_PATTERNS:
        if re.search(pattern, url):
            return False, f"Instagram profile URLs are not supported, only reels/posts — skipping: {url}"
    return False, f"Unrecognised URL — only Instagram reels and posts are supported. Skipping: {url}"


def parse_urls(raw: str) -> tuple[list[str], list[str]]:
    """Parse raw textarea input. Returns (valid_urls, warnings)."""
    lines = [l.strip() for l in raw.strip().splitlines() if l.strip()]
    valid, warnings = [], []
    for line in lines:
        ok, reason = validate_url(line)
        if ok:
            valid.append(line)
        else:
            if reason != "empty":
                warnings.append(reason)
    return valid, warnings


# ---------------------------------------------------------------------------
# Pipeline functions — ported verbatim from Instagram.ipynb
# ---------------------------------------------------------------------------

def chunk_audio(audio_path: str, chunk_duration_ms: int = 29000) -> list[str]:
    audio = AudioSegment.from_file(audio_path)
    chunks = []
    for i in range(0, len(audio), chunk_duration_ms):
        chunk = audio[i : i + chunk_duration_ms]
        tmp = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
        chunk.export(tmp.name, format="mp3")
        chunks.append(tmp.name)
    return chunks


def transcribe_audio(audio_path: str):
    return client_sarvam.speech_to_text.transcribe(
        file=open(audio_path, "rb"),
        model="saaras:v3",
        mode="transcribe",
    )


def transcribe_long_audio(audio_path: str, status_placeholder=None) -> str:
    chunk_paths = chunk_audio(audio_path)
    transcripts = []
    try:
        total = len(chunk_paths)
        for i, chunk_path in enumerate(chunk_paths):
            if status_placeholder:
                status_placeholder.markdown(
                    f'<div class="status-msg">Transcribing chunk {i + 1} of {total}...</div>',
                    unsafe_allow_html=True,
                )
            result = transcribe_audio(chunk_path)
            transcripts.append(result.transcript)
    finally:
        for p in chunk_paths:
            try:
                os.remove(p)
            except OSError:
                pass
    return " ".join(transcripts)


def download_audio(url: str) -> str:
    tmp = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
    tmp_path = tmp.name
    tmp.close()

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": tmp_path.replace(".mp3", ""),
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
            }
        ],
        "quiet": True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
    return tmp_path


def process_urls(url_list: list[str], status_placeholder=None) -> dict[str, str | None]:
    results = {}
    for url in url_list:
        audio_path = None
        try:
            if status_placeholder:
                status_placeholder.markdown(
                    f'<div class="status-msg">Downloading audio from {url}...</div>',
                    unsafe_allow_html=True,
                )
            audio_path = download_audio(url)
            transcript = transcribe_long_audio(audio_path, status_placeholder)
            results[url] = transcript
        except Exception as e:
            results[url] = None
            st.warning(f"Skipping this one for now — couldn't process: {url}")
        finally:
            if audio_path:
                try:
                    os.remove(audio_path)
                except OSError:
                    pass
    return results


def analyze_references(urls: list[str], status_placeholder=None) -> str:
    transcripts = process_urls(urls, status_placeholder)
    valid = {u: t for u, t in transcripts.items() if t}

    if len(valid) < 2:
        st.warning(
            f"Only {len(valid)} reference(s) succeeded — analysis may be weak. "
            "Try adding more URLs."
        )

    reference_text = "\n".join(
        f"---\nReference ({url}):\n{transcript}\n"
        for url, transcript in valid.items()
    )

    prompt = f"""You are analyzing short-form video scripts to extract creator style patterns.

Here are {len(valid)} transcripts:

{reference_text}

Extract and return a structured analysis with these sections:

1. HOOK PATTERNS
   - How do they open? (question / bold claim / stat / story?)
   - First sentence examples from the references

2. STRUCTURE
   - How is the middle organized? (list / story arc / contrast / problem-solution?)
   - Average number of points made

3. TONE & LANGUAGE
   - Formal or conversational?
   - Sentence length (short punchy vs longer flowing)
   - Any recurring phrases or patterns

4. CLOSING & CTA
   - How do they end? (soft CTA / hard sell / cliffhanger?)
   - Examples from references

5. PACING
   - Estimated words per segment
   - Total script length pattern

Be specific and pull examples from the actual transcripts."""

    if status_placeholder:
        status_placeholder.markdown(
            '<div class="status-msg">Analyzing patterns with Claude...</div>',
            unsafe_allow_html=True,
        )

    response = client_anthropic.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text


def generate_script(topic: str, insight: str, analysis: str) -> str:
    prompt = f"""You are a short-form video script writer.

Here is a style analysis of reference videos from top creators:

{analysis}

Now write a NEW script using this style as a template.

TOPIC: {topic}
CORE INSIGHT: {insight}

Script structure:
1. HOOK (3-5 seconds) — stop the scroll immediately
2. CONTEXT (5 seconds) — why this matters to the viewer
3. CORE CONTENT (3-5 punchy points that deliver the insight)
4. CTA (5 seconds) — what should the viewer do next

Rules:
- Match the tone and pacing from the style analysis
- Total length: 200-250 words (fits ~90 seconds)
- No filler phrases like "In today's video..." or "Don't forget to like"
- Output the script ONLY — no labels, no commentary"""

    response = client_anthropic.messages.create(
        model="claude-opus-4-5",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text


# ---------------------------------------------------------------------------
# Styling
# ---------------------------------------------------------------------------
def inject_css():
    st.html(
        """
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  /* ── Reset & Base ── */
  html, body, [data-testid="stApp"] {
    background-color: #0a0a0a !important;
    color: #ffffff;
    font-family: 'Inter', sans-serif;
  }

  /* ── Hide default Streamlit chrome ── */
  #MainMenu, footer, [data-testid="stToolbar"] { display: none !important; }

  /* ── Main content width ── */
  .block-container { max-width: 760px; padding: 2.5rem 1.5rem 4rem; }

  /* ── Headings ── */
  h1, h2, h3 {
    font-family: 'DM Serif Display', serif;
    color: #ffffff;
    letter-spacing: -0.02em;
  }
  h1 { font-size: 2.2rem; margin-bottom: 0.2rem; }
  h3 { font-size: 1.1rem; color: #aaaaaa; font-weight: 400; margin-top: 0; }

  /* ── Accent pill (step indicator) ── */
  .step-pill {
    display: inline-block;
    background: #e8ff5a;
    color: #0a0a0a;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 99px;
    margin-bottom: 1rem;
  }

  /* ── Cards ── */
  .card {
    background: #111111;
    border: 1px solid #222222;
    border-radius: 12px;
    padding: 1.4rem 1.6rem;
    margin-bottom: 1.2rem;
  }
  .card h4 {
    font-family: 'DM Serif Display', serif;
    font-size: 1rem;
    color: #e8ff5a;
    margin: 0 0 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .card p, .card li { font-size: 0.9rem; color: #cccccc; line-height: 1.6; }

  /* ── Script display card ── */
  .script-card {
    background: #111111;
    border: 1px solid #e8ff5a33;
    border-radius: 12px;
    padding: 1.8rem;
    white-space: pre-wrap;
    font-size: 0.95rem;
    line-height: 1.75;
    color: #f0f0f0;
    font-family: 'Inter', sans-serif;
  }

  /* ── Textarea & inputs ── */
  textarea, input[type="text"] {
    background: #111111 !important;
    border: 1px solid #333333 !important;
    border-radius: 8px !important;
    color: #ffffff !important;
    font-family: 'Inter', sans-serif !important;
  }
  textarea:focus, input[type="text"]:focus {
    border-color: #e8ff5a !important;
    box-shadow: 0 0 0 2px #e8ff5a22 !important;
  }

  /* ── Primary button ── */
  [data-testid="stButton"] > button[kind="primary"],
  [data-testid="stButton"] > button {
    background: #e8ff5a !important;
    color: #0a0a0a !important;
    border: none !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    font-size: 0.9rem !important;
    padding: 0.55rem 1.4rem !important;
    transition: opacity 0.15s;
  }
  [data-testid="stButton"] > button:hover { opacity: 0.85; }

  /* ── Warnings ── */
  [data-testid="stAlert"] {
    background: #1a1400 !important;
    border-left: 3px solid #e8ff5a !important;
    border-radius: 6px !important;
    color: #e8ff5a !important;
  }

  /* ── Status messages ── */
  .status-msg {
    font-size: 0.85rem;
    color: #888888;
    font-style: italic;
    margin: 0.3rem 0;
  }

  /* ── Divider ── */
  hr { border-color: #1e1e1e; }
</style>
"""
    )


# ---------------------------------------------------------------------------
# Session state init
# ---------------------------------------------------------------------------
def init_state():
    defaults = {
        "step": 1,
        "analysis": None,
        "script": None,
        "failed_urls": [],
        "success_count": 0,
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v


def reset_state():
    st.session_state.step = 1
    st.session_state.analysis = None
    st.session_state.script = None
    st.session_state.failed_urls = []
    st.session_state.success_count = 0


# ---------------------------------------------------------------------------
# Step renderers
# ---------------------------------------------------------------------------
def render_step_1():
    st.markdown('<div class="step-pill">Step 1 of 3</div>', unsafe_allow_html=True)
    st.markdown("## GrowEasy Content Pipeline")
    st.markdown("### Paste 5–10 Instagram Reel URLs to analyse their style.")

    st.markdown("<br>", unsafe_allow_html=True)

    raw = st.text_area(
        "Reference URLs (one per line)",
        height=220,
        placeholder="https://www.instagram.com/reel/...\nhttps://www.instagram.com/reel/...",
    )

    if st.button("Analyze References", use_container_width=True):
        valid_urls, warnings = parse_urls(raw)

        for w in warnings:
            st.warning(w)

        if len(valid_urls) < 5:
            st.error(
                f"Please provide at least 5 valid URLs. "
                f"You have {len(valid_urls)} valid so far."
            )
            return

        if len(valid_urls) > 10:
            st.info(f"Using first 10 of {len(valid_urls)} URLs.")
            valid_urls = valid_urls[:10]

        status = st.empty()
        with st.spinner("Running pipeline..."):
            try:
                analysis = analyze_references(valid_urls, status_placeholder=status)
            except Exception as e:
                st.error(f"Pipeline failed: {e}")
                return

        status.empty()
        st.session_state.analysis = analysis
        st.session_state.step = 2
        st.rerun()


def render_step_2():
    st.markdown('<div class="step-pill">Step 2 of 3</div>', unsafe_allow_html=True)
    st.markdown("## Reference Analysis")
    st.markdown("### Here's what the top creators are doing.")

    st.markdown("<br>", unsafe_allow_html=True)

    # Render analysis sections as styled cards
    analysis_text = st.session_state.analysis
    sections = re.split(r"\n(?=\d+\.\s+[A-Z])", analysis_text)
    for section in sections:
        section = section.strip()
        if not section:
            continue
        match = re.match(r"(\d+\.\s+[A-Z &]+)\n?(.*)", section, re.DOTALL)
        if match:
            title = match.group(1).strip()
            body = match.group(2).strip()
        else:
            title = ""
            body = section
        st.markdown(
            f'<div class="card"><h4>{title}</h4><p>{body.replace(chr(10), "<br>")}</p></div>',
            unsafe_allow_html=True,
        )

    st.markdown("---")
    st.markdown("### Now, generate your script")

    topic = st.text_input("Topic", placeholder="e.g. AI tools for founders")
    insight = st.text_area(
        "Your Core Insight",
        height=120,
        placeholder="e.g. Most founders buy AI tools for the feeling of innovation, not for solving a specific workflow problem.",
    )

    if st.button("Generate Script", use_container_width=True):
        if not topic.strip():
            st.error("Please enter a topic.")
            return
        if not insight.strip():
            st.error("Please enter your core insight.")
            return

        with st.spinner("Writing your script..."):
            try:
                script = generate_script(topic, insight, st.session_state.analysis)
            except Exception as e:
                st.error(f"Script generation failed: {e}")
                return

        st.session_state.script = script
        st.session_state.step = 3
        st.rerun()

    st.markdown("<br>", unsafe_allow_html=True)
    if st.button("← Start Over", use_container_width=False):
        reset_state()
        st.rerun()


def render_step_3():
    st.markdown('<div class="step-pill">Step 3 of 3</div>', unsafe_allow_html=True)
    st.markdown("## Your Script")
    st.markdown("### Ready to record. Copy it below.")

    st.markdown("<br>", unsafe_allow_html=True)

    script = st.session_state.script

    # Display with built-in copy button
    st.code(script, language=None)

    st.markdown(
        f"<small style='color:#666'>~{len(script.split())} words</small>",
        unsafe_allow_html=True,
    )

    st.markdown("<br>", unsafe_allow_html=True)
    if st.button("Start Over", use_container_width=True):
        reset_state()
        st.rerun()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="GrowEasy | Content Pipeline",
    page_icon="🌱",
    layout="centered",
    initial_sidebar_state="collapsed",
)

inject_css()
init_state()

step = st.session_state.step
if step == 1:
    render_step_1()
elif step == 2:
    render_step_2()
elif step == 3:
    render_step_3()
