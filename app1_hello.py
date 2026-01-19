from flask import Flask, request, jsonify
import json
import os

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

@app.route('/webhooks', methods = ['POST'])
def receive_webhook():
    data = request.get_json()
    print("Webook Received")
    print(data)
    count = save_webhook(data)

    print(f"Webhook saved, total count: {count}")
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