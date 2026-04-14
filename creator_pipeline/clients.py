from openai import OpenAI
from supabase import create_client

from .config import OPENAI_API_KEY, SUPABASE_KEY, SUPABASE_URL

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None


def require_openai_client() -> OpenAI:
    if openai_client is None:
        raise KeyError("Missing required environment variable: OPENAI_API_KEY")
    return openai_client
