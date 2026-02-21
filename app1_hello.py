from flask import Flask, request, jsonify
import json
import os
from parallel import Parallel
from dotenv import load_dotenv
from supabase  import create_client, Client
load_dotenv()
api_key = os.environ.get("PARALLEL_API_KEY")
client = Parallel(api_key=api_key)

supabase_url = os.environ.get("SUPABASE_URL")
supabase_api_key = os.environ.get("SUPBASE_KEY")
supabase: Client = create_client(supabase_url, supabase_api_key)
from httpx import Response

app = Flask(__name__)

data_file = '/Users/Rakshit.Lodha/Desktop/ai-times/webhook_data.json'
monitor_map_path = os.path.join(os.path.dirname(__file__), "monitor_map.json")


def load_monitor_type_map():
    try:
        with open(monitor_map_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, dict):
            return data
    except Exception as e:
        print(f"Could not load monitor map: {e}")
    return {}


MONITOR_TYPE_MAP = load_monitor_type_map()

def save_webhook(data):
    try:
        result = supabase.table('webhooks').insert(data).execute()
        return result.data[0]
    except Exception as e:
        print(f"Error in Supabase: {e}")
        return None

@app.route('/')
def home():
    return "Hello my webhook server is running"

@app.route('/parallel-webhooks', methods = ['POST'])
def receive_webhook():
    webhook_data = request.get_json()
    print("Webook Received")
    print(f"Type: {webhook_data.get('type')}")

    if webhook_data.get('type') == 'monitor.event.detected':
        event_group_id = webhook_data['data']['event']['event_group_id']
        monitor_group_id = webhook_data['data']['monitor_id']
        payload_monitor_type = (webhook_data.get('data') or {}).get('metadata', {}).get('monitor_type')
        monitor_type = payload_monitor_type or MONITOR_TYPE_MAP.get(monitor_group_id, "general")
        if not payload_monitor_type and monitor_group_id not in MONITOR_TYPE_MAP:
            print(f"Unknown monitor_id {monitor_group_id}, defaulting monitor_type to general")

        print(event_group_id)
        print(monitor_group_id)
        print(monitor_type)

        try:
            group = client.get(
                f"/v1alpha/monitors/{monitor_group_id}/event_groups/{event_group_id}",
                cast_to = Response
            ).json()

            print(group['events'])

            for event in group.get('events',[]):
                news_data = {
                    "timestamp": webhook_data.get('timestamp'),
                    "event_type": webhook_data.get('type'),
                    "event_group_id": event_group_id,
                    "monitor_id": monitor_group_id,
                    "monitor_type": monitor_type,
                    "news_output": event.get('output'),
                    "news_date": event.get('event_date'),
                    "source_urls": event.get('source_urls',[]),
                    "full_data": webhook_data
                }

                save_webhook(news_data)

        except Exception as e:
            print("Error in finding the data")

    return jsonify({"status":"received"}),200

@app.route('/view-webhooks',methods = ['GET'])
def view_webhooks():
    try:
        result = supabase.table('webhooks')\
            .select("*")\
                .order('created_at', desc = True)\
                    .execute()
        return jsonify({
            "total": len(result.data),
            "webhooks": result.data
        }),200

    except Exception as e:
        return jsonify({
            "total": 0,
            "webhooks": []
        })

if __name__ == '__main__':
    port = int(os.environ.get('PORT',5002))
    app.run(host='0.0.0.0', port = port)
