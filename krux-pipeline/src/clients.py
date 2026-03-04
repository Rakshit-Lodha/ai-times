from supabase import create_client
import anthropic
from openai import OpenAI

from .config import SUPABASE_URL, SUPABASE_KEY, CLAUDE_API_KEY, OPENAI_API_KEY

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
claude = anthropic.Anthropic(api_key=CLAUDE_API_KEY)
openai_client = OpenAI(api_key=OPENAI_API_KEY)
