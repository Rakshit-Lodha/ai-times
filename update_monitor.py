import requests
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get("PARALLEL_API_KEY")

response = requests.get(
    "https://api.parallel.ai/v1alpha/monitors",
    headers={"x-api-key": api_key}
)

monitors = response.json()

print(monitors)

# monitor_id_1 = ["monitor_7e43fb99ec844ccf983abc0ba82a4242"]

# for a in monitor_id_1:
#     response = requests.delete(
#         f"https://api.parallel.ai/v1alpha/monitors/{a}",
#         headers={"x-api-key": api_key}
#     )

#     print(f"Deleted: {response.status_code}")