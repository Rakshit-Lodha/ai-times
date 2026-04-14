import argparse
import json
import os
import tempfile
from datetime import datetime, timedelta

import isodate
import yt_dlp
from googleapiclient.discovery import build
from pydub import AudioSegment
from sarvamai import SarvamAI

from ..clients import require_openai_client, supabase
from ..config import SARVAM_API_KEY, YOUTUBE_API_KEY
from ..utils.hash import stable_hash
from ..utils.json import safe_load_json
from ..utils.retry import retry

DEFAULT_CREATORS = [
    "@Rajiv.Talreja",
    "@ankitravindrajain",
    "@SanjayNuthraYT",
    "@MrVivekBindra",
    "@daminitripathi",
]

TRANSCRIPT_TAGGER_PROMPT = """Classify this short-form YouTube video for a creator content library.

Return strict JSON only:
{
  "primary_topic": "2-4 words",
  "topic_category": "sales & negotiation | business strategy | marketing | paid ads & growth | ecommerce | investing & finance | government schemes & policy | startup ideas & opportunities | personal development | celebrity & pop culture",
  "content_format": "roleplay/skit | talking head | storytelling | interview/podcast clip | tutorial/listicle | devotional/chant | motivational monologue",
  "sub_topics": ["2-4 word tag"],
  "language": "hindi | hinglish | english",
  "suggested_angle": "angle this creator can use",
  "why_relevant": "why it deserves auto-selection"
}
"""


def youtube_client():
    if not YOUTUBE_API_KEY:
        raise KeyError("Missing YOUTUBE_API_KEY")
    return build("youtube", "v3", developerKey=YOUTUBE_API_KEY)


@retry(max_attempts=4)
def find_channel_id(youtube, handle: str) -> str:
    response = youtube.channels().list(forHandle=handle, part="id,snippet").execute()
    if not response.get("items"):
        raise ValueError(f"No YouTube channel found for handle {handle}")
    return response["items"][0]["id"]


@retry(max_attempts=4)
def fetch_recent_videos(youtube, channel_id: str, days: int = 7) -> list[dict]:
    after = (datetime.utcnow() - timedelta(days=days)).isoformat("T") + "Z"
    search = (
        youtube.search()
        .list(channelId=channel_id, publishedAfter=after, type="video", order="date", part="id", maxResults=50)
        .execute()
    )
    video_ids = [item["id"]["videoId"] for item in search.get("items", [])]
    if not video_ids:
        return []
    stats = youtube.videos().list(id=",".join(video_ids), part="snippet,statistics,contentDetails").execute()
    return stats.get("items", [])


def _duration_secs(video: dict) -> float:
    return isodate.parse_duration(video["contentDetails"]["duration"]).total_seconds()


def filter_videos(videos: list[dict], min_views: int = 10_000, max_duration_secs: int = 180) -> list[dict]:
    selected = []
    for video in videos:
        views = int(video.get("statistics", {}).get("viewCount") or 0)
        duration = _duration_secs(video)
        if views >= min_views and duration <= max_duration_secs:
            selected.append(video)
    return selected


@retry(max_attempts=4)
def download_audio(url: str) -> str:
    tmp = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
    tmp_path = tmp.name
    tmp.close()
    opts = {
        "format": "bestaudio/best",
        "outtmpl": tmp_path.replace(".mp3", ""),
        "postprocessors": [{"key": "FFmpegExtractAudio", "preferredcodec": "mp3"}],
        "quiet": True,
        "no_warnings": True,
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        ydl.download([url])
    return tmp_path.replace(".mp3", "") + ".mp3"


def chunk_audio(audio_path: str, chunk_duration_ms: int = 29_000) -> list[str]:
    audio = AudioSegment.from_file(audio_path)
    chunks = []
    for start in range(0, len(audio), chunk_duration_ms):
        chunk = audio[start : start + chunk_duration_ms]
        tmp = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
        chunk.export(tmp.name, format="mp3")
        chunks.append(tmp.name)
        tmp.close()
    return chunks


@retry(max_attempts=4)
def transcribe_chunk(client: SarvamAI, chunk_path: str) -> str:
    with open(chunk_path, "rb") as f:
        result = client.speech_to_text.transcribe(file=f, model="saaras:v3", mode="transcribe")
    return result.transcript


def transcribe_audio(audio_path: str) -> str:
    if not SARVAM_API_KEY:
        raise KeyError("Missing SARVAM_API_KEY")
    client = SarvamAI(api_subscription_key=SARVAM_API_KEY)
    chunks = chunk_audio(audio_path)
    transcripts = []
    try:
        for chunk_path in chunks:
            transcripts.append(transcribe_chunk(client, chunk_path))
    finally:
        for chunk_path in chunks:
            if os.path.exists(chunk_path):
                os.remove(chunk_path)
    return " ".join(t for t in transcripts if t).strip()


@retry(max_attempts=4)
def tag_transcript(video: dict, transcript: str) -> dict:
    payload = {
        "title": video["snippet"]["title"],
        "views": video.get("statistics", {}).get("viewCount"),
        "duration_secs": _duration_secs(video),
        "transcript": transcript,
    }
    response = require_openai_client().responses.create(
        model="gpt-5-nano",
        instructions=TRANSCRIPT_TAGGER_PROMPT,
        input=json.dumps(payload, ensure_ascii=False, default=str),
    )
    return safe_load_json(response.output_text)


def _performance_score(views: int) -> int:
    if views >= 1_000_000:
        return 100
    if views >= 100_000:
        return 90
    if views >= 40_000:
        return 80
    return 70


def upsert_youtube_candidate(creator: str, video: dict, transcript: str, tags: dict) -> None:
    video_id = video["id"]
    url = f"https://youtube.com/watch?v={video_id}"
    stats = video.get("statistics", {})
    views = int(stats.get("viewCount") or 0)
    title = video["snippet"]["title"]

    candidate_key = stable_hash({"source": "youtube", "video_id": video_id})
    candidate = {
        "candidate_key": candidate_key,
        "raw_webhook_ids": [],
        "source_type": "youtube_creator_video",
        "source_name": creator,
        "title": title,
        "summary": transcript[:600],
        "category": tags.get("topic_category") or "business strategy",
        "suggested_angle": tags.get("suggested_angle", ""),
        "why_relevant": tags.get("why_relevant", "Recent creator video crossed the view threshold."),
        "recommended_format": tags.get("content_format"),
        "language": tags.get("language"),
        "score": _performance_score(views),
        "status": "auto_selected",
        "selection_reason": "Creator reference crossed 10K views in the last 7 days",
        "source_urls": [{"name": "YouTube", "url": url}],
        "metadata": {"creator": creator, "video_id": video_id, "views": views},
    }
    supabase.table("creator_topic_candidates").upsert(candidate, on_conflict="candidate_key").execute()


def run(creators: list[str], days: int = 7, min_views: int = 10_000) -> int:
    youtube = youtube_client()
    processed = 0
    for creator in creators:
        channel_id = find_channel_id(youtube, creator)
        videos = filter_videos(fetch_recent_videos(youtube, channel_id, days=days), min_views=min_views)
        for video in videos:
            url = f"https://youtube.com/watch?v={video['id']}"
            audio_path = None
            try:
                audio_path = download_audio(url)
                transcript = transcribe_audio(audio_path)
                tags = tag_transcript(video, transcript)
                upsert_youtube_candidate(creator, video, transcript, tags)
                processed += 1
            finally:
                if audio_path and os.path.exists(audio_path):
                    os.remove(audio_path)
    return processed


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--creators", nargs="*", default=DEFAULT_CREATORS)
    parser.add_argument("--days", type=int, default=7)
    parser.add_argument("--min-views", type=int, default=10_000)
    args = parser.parse_args()
    print(json.dumps({"processed": run(args.creators, days=args.days, min_views=args.min_views)}))


if __name__ == "__main__":
    main()
