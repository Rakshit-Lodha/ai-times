from pyngrok import ngrok
from app1_hello import app

public_url = ngrok.connect(5002)

print("-------------")
print(public_url)

app.run(port=5002)