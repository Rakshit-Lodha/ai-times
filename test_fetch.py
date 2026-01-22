import os
from parallel import Parallel
from dotenv import load_dotenv
load_dotenv()
from httpx import Response
import json


client = Parallel(api_key = os.environ.get("PARALLEL_API_KEY"))

moitor_id = "monitor_6b502a8614e249ad9425aace96005c27"

event_group_id = "mevtgrp_6b502a8614e249ad44553d1bc5a90a947b03ee2226867c5c"

data_file = '/Users/Rakshit.Lodha/Desktop/ai-times/webhook_data.json'


def save_webhook(data):
    if os.path.exists(data_file):
        with open(data_file,'r') as f:
            all_data = json.load(f)
    
    else:
        all_data = []
    
    all_data.append(data)

    with open(data_file, 'w') as f:
        json.dump(all_data,f, indent=2)

try:

    response = client.get(
        f"/v1alpha/monitors/{moitor_id}/event_groups/{event_group_id}",
        cast_to = Response
    ).json()

    print(f"Events: {response}")
    save_webhook(response)


except Exception as e:
    print(f"❌ Error Type: {type(e).__name__}")
    print(f"❌ Error Message: {str(e)}")
    
    import traceback
    print("\nFull Traceback:")
    traceback.print_exc()