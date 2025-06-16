from flask import Flask, render_template, request, jsonify
from kaiyuan.backend.config import Config
from kaiyuan.backend.models import *
app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    limit = request.args.get('limit', default=10, type=int)
    transactions = Transaction.query.order_by(Transaction.date.desc()).limit(limit).all()
    return jsonify({
        "success": True,
        "data": [{
            "id": t.id,
            "description": t.description,
            "amount": t.amount,
            "category": t.category,
            "date": t.date.isoformat(),
            "type": t.type
        } for t in transactions]
    })

if __name__ == '__main__':
    #app.run(debug=True)
    app.run()