from app.core.functions import (
    add, get_summary, get_transactions, create_transaction,
    update_transaction, delete_transaction, get_budgets,
    create_budget, get_categories, add_category, update_category,
    delete_category, get_reports,
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

@bp.route('/debug/session', methods=['GET'])
def debug_session():
    """调试接口：查看当前session状态"""
    return jsonify({
        "session": dict(session),
        "cookies": dict(request.cookies),
        "headers": dict(request.headers),
        "username": session.get('username', 'No user logged in')
    }), 200
    
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
        # 保存机器人回复时使用纯文本而不是JSON字符串
        robot_content = result.get('data', '抱歉，我暂时无法处理您的请求，请稍后再试。')
        robot_chat = Chat(
            content=robot_content,
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
    # 添加调试信息
    print("=== /api/summary 调试信息 ===")
    print(f"Session内容: {dict(session)}")
    print(f"Request headers: {dict(request.headers)}")
    print(f"Request cookies: {request.cookies}")

    username = session.get('username', 'No user logged in')
    print(f"获取到的username: {username}")

    if username == 'No user logged in':
        print("❌ 用户未登录，返回400错误")
        return jsonify({
            "success": False,
            "error": "Missing username",
            "debug_info": {
                "session": dict(session),
                "cookies": dict(request.cookies)
            }
        }), 400

    print(f"✅ 用户已登录: {username}")
    result = get_summary(username)
    print(f"get_summary结果: {result}")

    if result['success']:
        return jsonify(result), 200
    return jsonify(result), 400
    

@bp.route('/transactions', methods=['GET'])
def get_transactions_api():
    """获取用户的最近交易记录，默认按时间倒序返回10条"""
    # 添加调试信息
    print("=== /api/transactions 调试信息 ===")
    print(f"Session内容: {dict(session)}")

    username = session.get('username', 'No user logged in')
    limit = request.args.get('limit', default=10, type=int)

    print(f"获取到的username: {username}")
    print(f"limit参数: {limit}")

    if username == 'No user logged in':
        print("❌ 用户未登录，返回400错误")
        return jsonify({
            "success": False,
            "error": "Missing username",
            "debug_info": {
                "session": dict(session),
                "cookies": dict(request.cookies)
            }
        }), 400

    print(f"✅ 用户已登录: {username}")
    result = get_transactions(username, limit)
    print(f"get_transactions结果: {result}")

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
    
    # 基本字段验证
    required_fields = ['name', 'target_amount']
    for field in required_fields:
        if field not in data:
            return jsonify({"success": False, "error": f"Missing {field}"}), 400
    
    # 如果是支出预算，需要category字段；如果是储蓄目标，自动设置category为'储蓄'
    budget_type = data.get('type', 'expense')
    if budget_type == 'expense' and 'category' not in data:
        return jsonify({"success": False, "error": "Missing category for expense budget"}), 400
    elif budget_type == 'saving':
        data['category'] = '储蓄'
    
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

    result = add_category(data['name'])  # 只传递name字符串，不是整个字典
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
    print("=== /api/reports 调试信息 ===")
    print(f"Session内容: {dict(session)}")

    username = session.get('username', 'No user logged in')
    range_type = request.args.get('range', 'month')  # month/quarter/year

    print(f"获取到的username: {username}")
    print(f"range_type参数: {range_type}")

    if username == 'No user logged in':
        print("❌ 用户未登录，返回400错误")
        return jsonify({"success": False, "error": "Missing username"}), 400

    print(f"✅ 用户已登录: {username}")
    # 修复：调用正确的函数 get_reports 而不是 get_summary
    result = get_reports(username, range_type)
    print(f"get_reports结果: {result}")

    if result['success']:
        return jsonify(result), 200
    return jsonify(result), 400
