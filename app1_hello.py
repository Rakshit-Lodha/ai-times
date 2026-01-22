from flask import Flask, request, jsonify
import json
import os
from parallel import Parallel
from dotenv import load_dotenv
load_dotenv()
api_key = os.environ.get("PARALLEL_API_KEY")
client = Parallel(api_key=api_key)
from httpx import Response

app = Flask(__name__)

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
    
    return len(all_data)


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

        print(event_group_id)
        print(monitor_group_id)

        try:
            group = client.get(
                f"/v1alpha/monitors/{monitor_group_id}/event_groups/{event_group_id}",
                cast_to = Response
            ).json()

            print(group['events'])

            for event in group.get('events',[]):
                news_data = {
                    "timestamp": webhook_data.get('timestamp'),
                    "event_group_id": event_group_id,
                    "monitor_id": monitor_group_id,
                    "news_output": event.get('output'),
                    "new_date": event.get('event_date'),
                    "source_url": event.get('source_urls',[]),
                    "full_data": webhook_data
                }

                save_webhook(news_data)

        except Exception as e:
            print("Error in finding the data")

    return jsonify({"status":"received"}),200

@app.route('/view-webhooks',methods = ['GET'])
def view_webhooks():
    if os.path.exists(data_file):
        with open(data_file,'r') as f:
            all_data = json.load(f)
        return jsonify({
            "total": len(all_data),
            "webhooks": all_data
        })
    else:
        return jsonify({
            "total": 0,
            "webhooks": []
        })

if __name__ == '__main__':
    app.run(debug=True, port = 5002)