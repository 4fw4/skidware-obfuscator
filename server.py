
from flask import Flask, request, jsonify, render_template, redirect, send_from_directory
from flask_cors import CORS
import os, json

app = Flask(__name__, static_folder='static')
CORS(app)

LOG_FILE = 'logs.json'

@app.route('/')
def root():
    return send_from_directory('static', 'index.html')

@app.route('/log', methods=['POST'])
def log_input():
    data = request.json
    if not data:
        return jsonify({"error": "No data received"}), 400
    logs = []
    if os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE, 'r') as f:
                logs = json.load(f)
        except:
            logs = []
    logs.append(data)
    with open(LOG_FILE, 'w') as f:
        json.dump(logs, f, indent=2)
    return jsonify({"status": "ok"}), 200

@app.route('/logs')
def view_json_logs():
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, 'r') as f:
            logs = json.load(f)
    else:
        logs = []
    return jsonify(logs)

@app.route('/view-logs')
def view_logs_page():
    return render_template('logs.html')

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
