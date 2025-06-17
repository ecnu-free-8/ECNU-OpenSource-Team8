from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def test():
    return jsonify({"message": "Hello, World!"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=1234)