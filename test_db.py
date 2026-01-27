from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.environ.get("SUPABASE_URL")
supabase_api_key = os.environ.get("SUPBASE_KEY")
supabase = create_client(supabase_url, supabase_api_key)

# Get the OpenAI/Anthropic article specifically
result = supabase.table('articles').select("*").ilike('headline', '%AI Giants OpenAI and Anthropic Race Toward Record Valuations as IPO Fever Grips Silicon Valley%').execute()

if result.data:
    article = result.data[0]
    content = article['content']
    
    print("Headline:", article['headline'])
    print("\nFirst 1000 chars:")
    print(content[:1000])
    print("\nNumber of spaces in first 1000 chars:", content[:1000].count(' '))
else:
    print("Article not found")