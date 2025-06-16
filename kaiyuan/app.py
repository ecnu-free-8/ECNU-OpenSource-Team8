from flask import render_template, request, jsonify

from kaiyuan.backend.config import Config
from kaiyuan.backend.models import *

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/api/summary', methods=['GET'])
def get_summary():
    """获取用户当前月份的财务摘要：收入、支出、结余"""
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({"success": False, "error": "Missing user_id"}), 400

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
        Transaction.user_id == user_id,
        Transaction.type == 'income',
        Transaction.date >= first_day,
        Transaction.date < next_month
    ).all()

    expense_records = Transaction.query.filter(
        Transaction.user_id == user_id,
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


@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """获取用户的最近交易记录，默认按时间倒序返回10条"""
    user_id = request.args.get('user_id', type=int)
    limit = request.args.get('limit', default=10, type=int)

    if not user_id:
        return jsonify({"success": False, "error": "Missing user_id"}), 400

    transactions = Transaction.query.filter_by(user_id=user_id).order_by(Transaction.date.desc()).limit(limit).all()
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


@app.route('/api/transactions', methods=['POST'])
def create_transaction():
    """手动添加一条交易记录"""
    data = request.json
    required_fields = ['amount', 'type', 'category', 'user_id']
    for field in required_fields:
        if field not in data:
            return jsonify({"success": False, "error": f"Missing {field}"}), 400

    new = Transaction(
        amount=data['amount'],
        type=data['type'],
        category=data['category'],
        description=data.get('description'),
        date=datetime.utcnow(),
        user_id=data['user_id']
    )
    db.session.add(new)
    db.session.commit()

    # 只有支出类交易才更新预算
    if new.type == 'expense':
        update_budget_for_transaction(new.user_id, new.category, new.amount, new.date)

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


@app.route('/api/transactions/<int:id>', methods=['PUT'])
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
        update_budget_for_transaction(trans.user_id, old_category, -old_amount, old_date)

    if trans.type == 'expense':
        # 再加上新值
        update_budget_for_transaction(trans.user_id, trans.category, trans.amount, trans.date)

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


@app.route('/api/transactions/<int:id>', methods=['DELETE'])
def delete_transaction(id):
    """删除指定 ID 的交易记录"""
    trans = Transaction.query.get_or_404(id)
    db.session.delete(trans)
    db.session.commit()

    # 同步预算
    if trans.type == 'expense':
        update_budget_for_transaction(trans.user_id, trans.category, -trans.amount, trans.date)

    return jsonify({"success": True, "data": "删除成功"})


def update_budget_for_transaction(user_id, category, amount_change, transaction_date):
    """
    当交易记录变更时，更新对应的预算
    :param user_id: 用户ID
    :param category: 分类名称
    :param amount_change: 要增加/减少的金额
    :param transaction_date: 交易时间
    """
    if not category or amount_change == 0:
        return

    # 找到所有该用户、该分类、时间范围内有效的预算
    budgets = Budget.query.filter(
        Budget.user_id == user_id,
        Budget.category == category,
        Budget.start_date <= transaction_date,
        Budget.end_date >= transaction_date
    ).all()

    for budget in budgets:
        budget.current_amount = max(budget.current_amount + amount_change, 0)  # 防止负值
        db.session.add(budget)


# ============ 预算计划接口 ============

@app.route('/api/plans', methods=['GET'])
def get_budgets():
    """获取用户的所有预算计划"""
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({"success": False, "error": "Missing user_id"}), 400

    budgets = Budget.query.filter_by(user_id=user_id).all()
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


@app.route('/api/plans', methods=['POST'])
def create_budget():
    """创建一个新的预算计划"""
    data = request.json
    required_fields = ['name', 'target_amount', 'category', 'user_id']
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
        user_id=data['user_id']
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

@app.route('/api/categories', methods=['GET'])
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


@app.route('/api/categories', methods=['POST'])
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


@app.route('/api/categories/<int:id>', methods=['PUT'])
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


@app.route('/api/categories/<int:id>', methods=['DELETE'])
def delete_category(id):
    """删除指定 ID 的支出分类"""
    cat = Category.query.get_or_404(id)
    db.session.delete(cat)
    db.session.commit()
    return jsonify({"success": True, "data": "分类删除成功"})


# ============ 报表分析接口 ============


@app.route('/api/reports', methods=['GET'])
def get_reports():
    """根据时间范围获取支出分类统计数据"""
    user_id = request.args.get('user_id', type=int)
    range_type = request.args.get('range', 'month')  # month/quarter/year

    if not user_id:
        return jsonify({"success": False, "error": "Missing user_id"}), 400

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
        Transaction.user_id == user_id,
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


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("✅ 数据库和所有表已成功创建！")
    app.run()