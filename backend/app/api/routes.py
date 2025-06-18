from flask import request, jsonify
from . import bp
from flask import session, redirect, url_for, render_template
from app.core.llm import call_llm, chat_llm
@bp.route('/test', methods=['GET'])
def test():
    username = session.get('username', 'No user logged in')
    return jsonify({
        "success": username != 'No user logged in',
        "data": {"username": username},
    }), 200

@bp.route('/summary', methods=['GET'])
def summary():
    username = session.get('username', 'No user logged in')
    if username == 'No user logged in':
        return jsonify({
            "success": False,
            "data": {"username": username},
        }), 401
    
    return jsonify({ # 模拟数据，后续从数据库获取
        "success": True,
        "data": {
            "expense": 2580.00,
            "income": 8500.00,
            "balance": 5920.00
        }
    }), 200
    
    
@bp.route('/chat', methods=['POST'])
def chat():
    username = session.get('username', 'No user logged in')
    if username == 'No user logged in':
        return jsonify({
            "success": False,
            "error": "用户不存在"
        }), 401
    return chat_llm(
        username,
        request.json.get('prompt', '')
    )
                       