from flask import request, jsonify
from . import bp
from app.core.functions import (
    add
)
from flask import session, redirect, url_for, render_template
from app import db
from app.models import *

# 标准库
import re
from datetime import datetime

# ============ AI 助手辅助函数 ============


def _parse_user_message(message: str):
    """根据简单规则解析用户消息，判断意图并抽取金额/分类。

    返回示例：
    {
        "intent": "RECORD_TRANSACTION" | "QUERY_DATA",
        "amount": 25.0,            # intent 为 RECORD_TRANSACTION 时存在
        "category": "餐饮",        # intent 为 RECORD_TRANSACTION 时存在
    }
    """
    message = (message or "").strip()
    # 1. 检测金额（xx元/￥xx）
    amt_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:元|块|￥)", message)

    # 2. 根据是否存在金额简单判断意图
    if amt_match:
        amount = float(amt_match.group(1))
        # 分类简单关键字映射
        if any(k in message for k in ["饭", "餐", "午餐", "早餐", "晚餐", "午饭", "晚饭"]):
            category = "餐饮"
        elif any(k in message for k in ["地铁", "公交", "打车", "出租", "交通", "滴滴"]):
            category = "交通"
        else:
            category = "其他"

        return {
            "intent": "RECORD_TRANSACTION",
            "amount": amount,
            "category": category,
            "date_desc": "今天",
        }

    # 如未检测到金额，则默认认为是查询
    return {
        "intent": "QUERY_DATA"
    }


def _summarize_month_expense(username: str):
    """统计指定用户当月支出总额及各分类明细，返回中文描述字符串"""
    now = datetime.utcnow()
    first_day = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    transactions = Transaction.query.filter(
        Transaction.username == username,
        Transaction.type == 'expense',
        Transaction.date >= first_day
    ).all()

    total = sum(t.amount for t in transactions)

    # 分类汇总
    breakdown = {}
    for t in transactions:
        breakdown[t.category] = breakdown.get(t.category, 0) + t.amount

    # 取金额前几的分类
    sorted_items = sorted(breakdown.items(), key=lambda x: x[1], reverse=True)
    top_parts = [f"{cat}{amt:.0f}元" for cat, amt in sorted_items[:3]]
    breakdown_str = "，".join(top_parts)

    if total == 0:
        return "本月暂无支出记录。"

    response = f"本月您总共花费了{total:.2f}元"
    if breakdown_str:
        response += f"，主要支出为{breakdown_str}。"
    else:
        response += "。"
    return response


@bp.route('/test', methods=['GET'])
def test():
    username = session.get('username', 'No user logged in')
    return jsonify({
        "success": username != 'No user logged in',
        "data": {"username": username},
    }), 200
@bp.route('/add', methods=['POST'])
def add_api():
    username = session.get('username', 'No user logged in')
    data = request.json
    print(data)
    return jsonify({
        "success": username != 'No user logged in',
        "data": {"result": add(**data) },
    })

    
    
@bp.route('/chat', methods=['POST'])
def ai_chat():
    """AI 助手入口：将请求发送至大模型并转发其结构化 JSON 结果。"""
    data = request.get_json() or {}

    username = data.get('username')
    message = data.get('message', '').strip()

    if not username:
        return jsonify({"success": False, "error": "用户不存在"}), 404
    if not message:
        return jsonify({"success": False, "error": "参数错误"}), 400

    try:
        parsed = _parse_user_message(message)

        # -------- 记录开支 --------
        if parsed["intent"] == "RECORD_TRANSACTION":
            trans = Transaction(
                amount=parsed["amount"],
                type='expense',
                category=parsed["category"],
                description=message,
                date=datetime.utcnow(),
                username=username
            )
            db.session.add(trans)
            db.session.commit()

            # 同步预算数据
            update_budget_for_transaction(trans.username, trans.category, trans.amount, trans.date)

            response_text = (
                f"好的，我已经记录了这笔开支：\n"
                f"💰 金额：{parsed['amount']}元\n"
                f"🍽 分类：{parsed['category']}\n"
                f"📅 时间：{parsed.get('date_desc', '今天')}"
            )

            return jsonify({
                "success": True,
                "data": {
                    "intent": "RECORD_TRANSACTION",
                    "response": response_text,
                    "transaction_id": trans.id
                }
            })

        # -------- 查询数据 --------
        if parsed["intent"] == "QUERY_DATA":
            response_text = _summarize_month_expense(username)
            return jsonify({
                "success": True,
                "data": {
                    "intent": "QUERY_DATA",
                    "response": response_text
                }
            })

        # 未知意图
        return jsonify({"success": False, "error": "资源不存在"}), 404

    except Exception as e:
        db.session.rollback()
        print("[AI_CHAT_ERROR]", e)
        return jsonify({"success": False, "error": "服务器错误"}), 500


@bp.route('/summary', methods=['GET'])
def get_summary():
    """获取用户当前月份的财务摘要：收入、支出、结余"""
    username = session.get('username', 'No user logged in')
    if username == 'No user logged in':
        return jsonify({"success": False, "error": "Missing username"}), 400

    # 获取当前时间
    now = datetime.utcnow()

    # 获取本月第一天（0点0分0秒）
    first_day = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # 获取下个月第一天（作为查询结束时间）
    if now.month == 12:
        next_month = now.replace(year=now.year + 1, month=1, day=1)
    else:
        next_month = now.replace(month=now.month + 1, day=1)

    # 查询本月的交易记录
    income_records = Transaction.query.filter(
        Transaction.username == username,
        Transaction.type == 'income',
        Transaction.date >= first_day,
        Transaction.date < next_month
    ).all()

    expense_records = Transaction.query.filter(
        Transaction.username == username,
        Transaction.type == 'expense',
        Transaction.date >= first_day,
        Transaction.date < next_month
    ).all()

    income = sum(t.amount for t in income_records)
    expense = sum(t.amount for t in expense_records)
    balance = income - expense

    return jsonify({
        "success": True,
        "data": {
            "expense": round(expense, 2),
            "income": round(income, 2),
            "balance": round(balance, 2)
        }
    })


@bp.route('/transactions', methods=['GET'])
def get_transactions():
    """获取用户的最近交易记录，默认按时间倒序返回10条"""
    username = session.get('username', 'No user logged in')
    limit = request.args.get('limit', default=10, type=int)

    if username == 'No user logged in':
        return jsonify({"success": False, "error": "Missing username"}), 400

    transactions = Transaction.query.filter_by(username=username).order_by(Transaction.date.desc()).limit(limit).all()
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


@bp.route('/transactions', methods=['POST'])
def create_transaction():
    """手动添加一条交易记录"""
    data = request.json
    required_fields = ['amount', 'type', 'category', 'username']
    for field in required_fields:
        if field not in data:
            return jsonify({"success": False, "error": f"Missing {field}"}), 400

    new = Transaction(
        amount=data['amount'],
        type=data['type'],
        category=data['category'],
        description=data.get('description'),
        date=datetime.utcnow(),
        username=data['username']
    )
    db.session.add(new)
    db.session.commit()

    # 只有支出类交易才更新预算
    if new.type == 'expense':
        update_budget_for_transaction(new.username, new.category, new.amount, new.date)

    return jsonify({
        "success": True,
        "data": {
            "id": new.id,
            "amount": new.amount,
            "type": new.type,
            "category": new.category,
            "description": new.description,
            "date": new.date.isoformat()
        }
    }), 201


@bp.route('/transactions/<int:id>', methods=['PUT'])
def update_transaction(id):
    """更新指定 ID 的交易记录"""
    data = request.json
    trans = Transaction.query.get_or_404(id)

    old_category = trans.category
    old_amount = trans.amount
    old_date = trans.date
    old_type = trans.type

    # 更新字段
    trans.amount = data.get('amount', trans.amount)
    trans.type = data.get('type', trans.type)
    trans.category = data.get('category', trans.category)
    trans.description = data.get('description', trans.description)

    db.session.commit()

    # 如果是支出类型，并且分类或金额发生变化，则更新预算
    if old_type == 'expense':
        # 先减去旧值
        update_budget_for_transaction(trans.username, old_category, -old_amount, old_date)

    if trans.type == 'expense':
        # 再加上新值
        update_budget_for_transaction(trans.username, trans.category, trans.amount, trans.date)

    return jsonify({
        "success": True,
        "data": {
            "id": trans.id,
            "amount": trans.amount,
            "type": trans.type,
            "category": trans.category,
            "description": trans.description,
            "date": trans.date.isoformat()
        }
    })


@bp.route('/transactions/<int:id>', methods=['DELETE'])
def delete_transaction(id):
    """删除指定 ID 的交易记录"""
    trans = Transaction.query.get_or_404(id)
    db.session.delete(trans)
    db.session.commit()

    # 同步预算
    if trans.type == 'expense':
        update_budget_for_transaction(trans.username, trans.category, -trans.amount, trans.date)

    return jsonify({"success": True, "data": "删除成功"})


def update_budget_for_transaction(username, category, amount_change, transaction_date):
    """
    当交易记录变更时，更新对应的预算
    :param username: 用户ID
    :param category: 分类名称
    :param amount_change: 要增加/减少的金额
    :param transaction_date: 交易时间
    """
    if not category or amount_change == 0:
        return

    # 找到所有该用户、该分类、时间范围内有效的预算
    budgets = Budget.query.filter(
        Budget.username == username,
        Budget.category == category,
        Budget.start_date <= transaction_date,
        Budget.end_date >= transaction_date
    ).all()

    for budget in budgets:
        budget.current_amount = max(budget.current_amount + amount_change, 0)  # 防止负值
        db.session.add(budget)


# ============ 预算计划接口 ============

@bp.route('/plans', methods=['GET'])
def get_budgets():
    """获取用户的所有预算计划"""
    username = session.get('username', 'No user logged in')
    if username == 'No user logged in':
        return jsonify({"success": False, "error": "Missing username"}), 400

    budgets = Budget.query.filter_by(username=username).all()
    return jsonify({
        "success": True,
        "data": [{
            "id": b.id,
            "name": b.name,
            "target_amount": b.target_amount,
            "current_amount": b.current_amount,
            "category": b.category
        } for b in budgets]
    })


@bp.route('/plans', methods=['POST'])
def create_budget():
    """创建一个新的预算计划"""
    data = request.json
    required_fields = ['name', 'target_amount', 'category', 'username']
    for field in required_fields:
        if field not in data:
            return jsonify({"success": False, "error": f"Missing {field}"}), 400

    category_name = data['category']

    # 检查 category 是否是预设分类之一
    existing_category = Category.query.filter_by(name=category_name).first()
    if not existing_category:
        return jsonify({
            "success": False,
            "error": f"Invalid category: {category_name}"
        }), 400

    budget = Budget(
        name=data['name'],
        target_amount=data['target_amount'],
        current_amount=0,
        category=category_name,
        username=data['username']
    )

    db.session.add(budget)
    db.session.commit()

    return jsonify({
        "success": True,
        "data": {
            "id": budget.id,
            "name": budget.name,
            "target_amount": budget.target_amount,
            "current_amount": budget.current_amount,
            "category": budget.category
        }
    }), 201


# ============ 分类管理接口 ============

@bp.route('/categories', methods=['GET'])
def get_categories():
    """获取所有支出分类（预设 + 自定义）"""
    categories = Category.query.all()
    return jsonify({
        "success": True,
        "data": [{
            "id": c.id,
            "name": c.name
        } for c in categories]
    })


@bp.route('/categories', methods=['POST'])
def add_category():
    """添加一个新的支出分类"""
    data = request.json
    if 'name' not in data:
        return jsonify({"success": False, "error": "Missing name"}), 400

    new_name = data['name'].strip()

    # 检查是否已存在同名分类
    existing = Category.query.filter(db.func.lower(Category.name) == db.func.lower(new_name)).first()
    if existing:
        return jsonify({
            "success": False,
            "error": f"分类 '{new_name}' 已存在"
        }), 400

    new = Category(name=new_name)
    db.session.add(new)
    db.session.commit()

    return jsonify({
        "success": True,
        "data": {
            "id": new.id,
            "name": new.name
        }
    }), 201


@bp.route('/categories/<int:id>', methods=['PUT'])
def update_category(id):
    """更新指定 ID 的分类名称"""
    data = request.json
    new_name = data.get('name')

    if not new_name:
        return jsonify({"success": False, "error": "Missing name"}), 400

    cat = Category.query.get_or_404(id)

    # 检查是否有其他分类使用了相同的名称（排除自己）
    existing = Category.query.filter(
        db.func.lower(Category.name) == db.func.lower(new_name),
        Category.id != cat.id
    ).first()

    if existing:
        return jsonify({
            "success": False,
            "error": f"分类 '{new_name}' 已存在"
        }), 400

    cat.name = new_name
    db.session.commit()

    return jsonify({
        "success": True,
        "data": {
            "id": cat.id,
            "name": cat.name
        }
    })


@bp.route('/categories/<int:id>', methods=['DELETE'])
def delete_category(id):
    """删除指定 ID 的支出分类"""
    cat = Category.query.get_or_404(id)
    db.session.delete(cat)
    db.session.commit()
    return jsonify({"success": True, "data": "分类删除成功"})


# ============ 报表分析接口 ============


@bp.route('/reports', methods=['GET'])
def get_reports():
    """根据时间范围获取支出分类统计数据"""
    username = session.get('username', 'No user logged in')
    range_type = request.args.get('range', 'month')  # month/quarter/year

    if username == 'No user logged in':
        return jsonify({"success": False, "error": "Missing username"}), 400

    now = datetime.utcnow()

    if range_type == 'month':
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        title = '本月支出分类'
    elif range_type == 'quarter':
        quarter = (now.month - 1) // 3 + 1
        quarter_start_month = 3 * (quarter - 1) + 1
        start_date = now.replace(month=quarter_start_month, day=1, hour=0, minute=0, second=0, microsecond=0)
        title = '本季度支出分类'
    elif range_type == 'year':
        start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        title = '本年度支出分类'
    else:
        return jsonify({"success": False, "error": "Invalid range type"}), 400

    # 查询时间范围内所有支出类交易
    transactions = Transaction.query.filter(
        Transaction.username == username,
        Transaction.type == 'expense',
        Transaction.date >= start_date
    ).all()

    # 按分类统计金额
    category_summary = {}
    for t in transactions:
        if t.category not in category_summary:
            category_summary[t.category] = 0
        category_summary[t.category] += t.amount

    categories = [{"name": k, "amount": round(v, 2)} for k, v in category_summary.items()]
    total = round(sum(category_summary.values()), 2)

    return jsonify({
        "success": True,
        "data": {
            "title": title,
            "total": total,
            "categories": categories
        }
    })
