from app.core.functions import (
    add, get_summary, get_transactions, create_transaction,
    update_transaction, delete_transaction, get_budgets,
    create_budget, get_categories, add_category, update_category,
    delete_category,
)
from app.core.llm import call_llm, chat_llm
from app.models import *
from flask import request, jsonify
from flask import session

from . import bp

import json

# ============ 测试接口 ============
@bp.route('/test', methods=['GET'])
def test():
    username = session.get('username', 'No user logged in')
    if username == 'No user logged in':
        return jsonify({"success": False, "error": "No user logged in"}), 401
    return jsonify({
        "success": True,
        "message": f"Hello, {username}! This is a test endpoint."
    })
    
@bp.route('/add', methods=['POST'])
def add_api():
    username = session.get('username', 'No user logged in')
    data = request.json
    return jsonify({
        "success": True,
        "data": {"username": username, "result": add(**data) },
    }), 200
# ============ 聊天接口 ============
    
    
@bp.route('/chat', methods=['POST'])
def chat():
    username = session.get('username', 'No user logged in')
    if username == 'No user logged in':
        return jsonify({
            "success": False,
            "error": "用户不存在"
        }), 401

    message = request.json.get('message', '')
    try:
        user_chat = Chat(
            content=message,
            type=1,  # 用户消息
            username=username
        )
        db.session.add(user_chat)
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": "保存用户消息失败"
        }), 500

    result = chat_llm(username, request.json.get('message', ''))
    try:
        robot_chat = Chat(
            content=json.dumps(result['data'], ensure_ascii=False),
            type=0,  # 机器人消息
            username=username
        )
        db.session.add(robot_chat)
        db.session.commit()  # 提交事务
    except Exception as e:
        db.session.rollback()

        return jsonify({
            "success": False,
            "error": "保存机器人回复失败"
        }), 500

    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify({
            "success": False,
            "error": "LLM调用失败"
        }), 500

@bp.route('/chat/history', methods=['GET'])
def get_chat_history():
    username = session.get('username', 'No user logged in')
    if username == 'No user logged in':
        return jsonify({
            "success": False,
            "error": "用户不存在"
        }), 401

    # 获取查询参数 limit，默认是 5
    limit = request.args.get('limit', default=5, type=int)

    # 查询当前用户的聊天记录，按时间倒序排列，取前 limit 条
    chat_records = Chat.query.filter_by(username=username).order_by(Chat.date.desc()).limit(limit).all()

    # 转换成字典格式返回
    result = [{
        "id": record.id,
        "content": record.content,
        "type": record.type,  # 0: robot, 1: user
        "date": record.date.isoformat() if record.date else None
    } for record in chat_records]

    return jsonify({
        "success": True,
        "data": result
    }), 200

# ============ 交易接口 ============

@bp.route('/summary', methods=['GET'])
def get_summary_api():
    """获取用户当前月份的财务摘要：收入、支出、结余"""
    username = session.get('username', 'No user logged in')
    if username == 'No user logged in':
        return jsonify({"success": False, "error": "Missing username"}), 400
    result = get_summary(username)
    if result['success']:
        return jsonify(result), 200
    return jsonify(result), 400
    

@bp.route('/transactions', methods=['GET'])
def get_transactions_api():
    """获取用户的最近交易记录，默认按时间倒序返回10条"""
    username = session.get('username', 'No user logged in')
    limit = request.args.get('limit', default=10, type=int)

    if username == 'No user logged in':
        return jsonify({"success": False, "error": "Missing username"}), 400

    result = get_transactions(username, limit)
    if result['success']:
        return jsonify(result), 200
    return jsonify(result), 400


@bp.route('/transactions', methods=['POST'])
def create_transaction_api():
    """手动添加一条交易记录"""
    username = session.get('username', 'No user logged in')
    if username == 'No user logged in':
        return jsonify({"success": False, "error": "Missing username"}), 400

    data = request.json
    required_fields = ['amount', 'type', 'category']
    for field in required_fields:
        if field not in data:
            return jsonify({"success": False, "error": f"Missing {field}"}), 400

    result = create_transaction(
        username=username,
        data=data,
    )
    if result['success']:
        return jsonify(result), 201
    return jsonify(result), 400
    


@bp.route('/transactions/<int:id>', methods=['PUT']) # 存在安全问题，实际应用中应使用安全的验证方式
def update_transaction_api(id):
    """更新指定 ID 的交易记录"""
    data = request.json
    result = update_transaction(id, data)
    if result['success']:
        return jsonify(result), 200
    return jsonify(result), 400    

@bp.route('/transactions/<int:id>', methods=['DELETE']) # 存在安全问题，实际应用中应使用安全的验证方式
def delete_transaction_api(id):
    """删除指定 ID 的交易记录"""
    result = delete_transaction(id)
    if result['success']:
        return jsonify(result), 200
    return jsonify(result), 400

# ============ 预算计划接口 ============

@bp.route('/plans', methods=['GET'])
def get_budgets_api():
    """获取用户的所有预算计划"""
    username = session.get('username', 'No user logged in')
    if username == 'No user logged in':
        return jsonify({"success": False, "error": "Missing username"}), 400

    result = get_budgets(username)
    if result['success']:
        return jsonify(result), 200
    return jsonify(result), 400


@bp.route('/plans', methods=['POST'])
def create_budget_api():
    """创建一个新的预算计划"""
    username = session.get('username', 'No user logged in')
    if username == 'No user logged in':
        return jsonify({"success": False, "error": "Missing username"}), 400
    data = request.json
    required_fields = ['name', 'target_amount', 'category']
    for field in required_fields:
        if field not in data:
            return jsonify({"success": False, "error": f"Missing {field}"}), 400
    result = create_budget(username=username, data=data)
    if result['success']:
        return jsonify(result), 200
    return jsonify(result), 400


# ============ 分类管理接口 ============

@bp.route('/categories', methods=['GET'])
def get_categories_api():
    """获取所有支出分类（预设 + 自定义）"""
    result = get_categories()
    if result['success']:
        return jsonify(result), 200
    return jsonify(result), 400


@bp.route('/categories', methods=['POST'])
def add_category_api():
    """添加一个新的支出分类"""
    data = request.json
    if 'name' not in data:
        return jsonify({"success": False, "error": "Missing name"}), 400

    result = add_category(data)
    if result['success']:
        return jsonify(result), 200
    return jsonify(result), 400


@bp.route('/categories/<int:id>', methods=['PUT'])
def update_category_api(id):
    """更新指定 ID 的分类名称"""
    data = request.json
    new_name = data.get('name')

    if not new_name:
        return jsonify({"success": False, "error": "Missing name"}), 400

    
    result = update_category(id, new_name)
    if result['success']:
        return jsonify(result), 200
    return jsonify(result), 400


@bp.route('/categories/<int:id>', methods=['DELETE'])
def delete_category_api(id):
    """删除指定 ID 的支出分类"""
    result = delete_category(id)
    if result['success']:
        return jsonify(result), 200
    return jsonify(result), 400


# ============ 报表分析接口 ============


@bp.route('/reports', methods=['GET'])
def get_reports_api():
    """根据时间范围获取支出分类统计数据"""
    username = session.get('username', 'No user logged in')
    range_type = request.args.get('range', 'month')  # month/quarter/year

    if username == 'No user logged in':
        return jsonify({"success": False, "error": "Missing username"}), 400

    result = get_summary(username, range_type)
    if result['success']:
        return jsonify(result), 200
    return jsonify(result), 400
