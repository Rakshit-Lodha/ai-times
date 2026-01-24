from dotenv import load_dotenv
import os
from supabase import create_client, Client

load_dotenv()


supabase_url = os.environ.get("SUPABASE_URL")
supabase_api_key = os.environ.get("SUPBASE_KEY")
supabase: Client = create_client(supabase_url, supabase_api_key)


print("\n Testing INSERT...")
test_data = {
    "timestamp": "2026-01-24T10:00:00Z",
    "event_type": "test",
    "event_group_id": "test_123",
    "monitor_id": "test_monitor",
    "news_output": "This is a test",
    "news_date": "2026-01-24",
    "source_urls": ["https://test.com"],
    "full_data": {"test": "data"}
}

try:
    result = supabase.table('webhooks').insert(test_data).execute()
    print(f"✅ SUCCESS! Inserted ID: {result.data[0]['id']}")
except Exception as e:
    print(f"❌ ERROR: {e}")

# Test: Read data
print("\n Testing SELECT...")
try:
    result = supabase.table('webhooks').select("*").limit(3).execute()
    print(f"✅ SUCCESS! Found {len(result.data)} rows")
    for row in result.data:
        print(f"   - ID {row['id']}: {row['news_output'][:50]}...")
except Exception as e:
    print(f"❌ ERROR: {e}")