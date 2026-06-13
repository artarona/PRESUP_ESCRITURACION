import os
from flask import Flask, render_template, jsonify

app = Flask(__name__)

# Route to serve the main dashboard
@app.route('/')
def index():
    return render_template('index.html')

# Health check endpoint for Render monitoring
@app.route('/health')
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    # Listen on port defined by Render environment or default to 5000
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
