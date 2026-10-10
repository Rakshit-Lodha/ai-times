import anthropic
from openai import OpenAI

from .config import CLAUDE_API_KEY, OPENAI_API_KEY

claude = anthropic.Anthropic(api_key=CLAUDE_API_KEY)
openai_client = OpenAI(api_key=OPENAI_API_KEY)
