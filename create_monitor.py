import os
from dotenv import load_dotenv
from httpx import Response
from parallel import Parallel
load_dotenv()
api_key = os.environ.get("PARALLEL_API_KEY")
client = Parallel(api_key=api_key)
webhook_url = "https://ai-times-6utx.onrender.com"

res = client.post(
    "/v1alpha/monitors",
    cast_to=Response,
    body={
        "query": "Give me any news in the news of AI, which can be about: - AI Funding - New model announcements or improvements in the current model - Interesting features added to existing AI companies",
        "cadence": "hourly",
        "webhook": {
            "url": webhook_url,
            "event_types": ["monitor.event.detected"],
        },
        "metadata": {"key": "value"},
    },
).json()


print(f"Monitor ID: {res['monitor_id']}")
print(f"Query: {res['query']}")
print(f"Cadence: {res['cadence']}")
print(f"Webhook URL: {res['webhook']['url']}")