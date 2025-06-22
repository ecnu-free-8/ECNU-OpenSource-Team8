from datetime import datetime

from app.models import *


def get_current_datetime() -> str:
    """Get the current date and time in ISO format."""
    return datetime.now().isoformat()


def add(a: int, b: int) -> int:
    """Add a and b."""
    return a + b


def get_summary(username: str) -> dict:
    """
    获取用户当前月份的财务摘要：收入、支出、结余
    
    Args:
        username (str): 用户名
    Returns:
        dict: 包含收入、支出和结余的摘要信息
    """
    print("————————正在获取当前月份记录——————————————")
    # 获取当前时间
    now = datetime.utcnow()

    # 获取本月第一天（0点0分0秒）
    first_day = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # 获取下个月第一天（作为查询结束时间）
    if now.month == 12:
        next_month = now.replace(year=now.year + 1, month=1, day=1)
    else:
        next_month = now.replace(month=now.month + 1, day=1)
    try:
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
        balance = income + expense  # expense已经是负数，所以用加法
        
        print(f"[DEBUG] 财务摘要计算: username={username}")
        print(f"[DEBUG] 时间范围: {first_day} 到 {next_month}")
        print(f"[DEBUG] 收入记录数: {len(income_records)}, 总收入: {income}")
        print(f"[DEBUG] 支出记录数: {len(expense_records)}, 总支出: {expense}")
        print(f"[DEBUG] 计算结余: {income} + ({expense}) = {balance}")
        
        # 检查重复交易
        income_amounts = [record.amount for record in income_records]
        expense_amounts = [record.amount for record in expense_records]
        
        income_duplicates = [x for x in set(income_amounts) if income_amounts.count(x) > 1]
        expense_duplicates = [x for x in set(expense_amounts) if expense_amounts.count(x) > 1]
        
        if income_duplicates:
            print(f"[DEBUG] 发现重复收入金额: {income_duplicates}")
        if expense_duplicates:
            print(f"[DEBUG] 发现重复支出金额: {expense_duplicates}")
        
        # 打印详细的交易记录用于调试
        for record in income_records:
            print(f"[DEBUG] 收入记录: {record.description}, {record.amount}, {record.date}")
        for record in expense_records:
            print(f"[DEBUG] 支出记录: {record.description}, {record.amount}, {record.date}")

        return {
            "success": True,
            "data": {
                "expense": round(expense, 2),
                "income": round(income, 2),
                "balance": round(balance, 2)
            }
        }
    except Exception as e:
        print(str(e))
        return {
            "success": False,
            "error": str(e)
        }


def get_transactions(username: str, limit: int = 10) -> dict:
    """
    获取用户的最近交易记录，默认按时间倒序返回10条
    
    Args:
        username (str): 用户名
        limit (int): 返回的记录数量，默认为10
    Returns:
        dict: 包含交易记录的列表
    """
    try:
        transactions = Transaction.query.filter_by(username=username).order_by(Transaction.date.desc()).limit(
            limit).all()
        return {
            "success": True,
            "data": [{
                "id": t.id,
                "description": t.description,
                "amount": t.amount,
                "category": t.category,
                "date": t.date.isoformat(),
                "type": t.type
            } for t in transactions]
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def create_transaction(username: str, data: dict) -> dict:
    """
    创建一条交易记录
    
    Args:
        username (str): 用户名
        data (dict): 交易数据，包含amount, type, category, description等字段
            
    Returns:
        dict: 包含创建结果的字典
    """
    try:
        print(f"[DEBUG] 创建交易: username={username}, data={data}")
        
        # 处理金额：支出应该存储为负数
        amount = float(data['amount'])
        if data['type'] == 'expense' and amount > 0:
            amount = -amount
        
        new = Transaction(
            amount=amount,
            type=data['type'],
            category=data['category'],
            description=data.get('description'),
            date=datetime.utcnow(),
            username=username
        )
        db.session.add(new)
        db.session.commit()
        
        print(f"[DEBUG] 交易已创建: id={new.id}, type={new.type}, category={new.category}, amount={new.amount}")

        # 只有支出类交易才更新预算
        if new.type == 'expense':
            print(f"[DEBUG] 支出交易，开始更新预算")
            update_budget_for_transaction(new.username, new.category, new.amount, new.date)
        else:
            print(f"[DEBUG] 收入交易，不更新预算")

        return {
            "success": True,
            "data": {
                "id": new.id,
                "amount": new.amount,
                "type": new.type,
                "category": new.category,
                "description": new.description,
                "date": new.date.isoformat()
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def update_transaction(id: int, data: dict) -> dict:
    """
    更新指定 ID 的交易记录
    
    Args:
        id (int): 交易记录的 ID
        data (dict): 包含更新字段的字典
            可包含 amount, type, category, description 等字段
            
    Returns:
        dict: 包含更新结果的字典
    """
    try:
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

        return {
            "success": True,
            "data": {
                "id": trans.id,
                "amount": trans.amount,
                "type": trans.type,
                "category": trans.category,
                "description": trans.description,
                "date": trans.date.isoformat()
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def update_budget_for_transaction(username, category, amount_change, transaction_date):  # 非 API 函数
    """
    当交易记录变更时，更新对应的预算
    :param username: 用户ID
    :param category: 分类名称
    :param amount_change: 要增加/减少的金额
    :param transaction_date: 交易时间
    """
    if not category or amount_change == 0:
        return

    print(f"[DEBUG] 更新预算: username={username}, category={category}, amount_change={amount_change}, date={transaction_date}")
    
    # 将datetime转换为date进行比较
    transaction_date_only = transaction_date.date() if hasattr(transaction_date, 'date') else transaction_date

    # 找到所有该用户、该分类、时间范围内有效的预算
    budgets = Budget.query.filter(
        Budget.username == username,
        Budget.category == category,
        Budget.start_date <= transaction_date_only,
        Budget.end_date >= transaction_date_only
    ).all()
    
    print(f"[DEBUG] 找到的预算数量: {len(budgets)}")
    
    for budget in budgets:
        old_amount = budget.current_amount
        budget.current_amount = max(budget.current_amount - amount_change, 0)  # 防止负值
        print(f"[DEBUG] 预算 '{budget.name}' 更新: {old_amount} -> {budget.current_amount}")
        db.session.add(budget)
    
    if budgets:
        try:
            db.session.commit()
            print(f"[DEBUG] 预算更新已提交到数据库")
        except Exception as e:
            db.session.rollback()
            print(f"[DEBUG] 预算更新提交失败: {e}")
    else:
        print(f"[DEBUG] 没有找到匹配的预算，无需更新")


def delete_transaction(id: int) -> dict:
    """
    删除指定 ID 的交易记录
    
    Args:
        id (int): 交易记录的 ID
        
    Returns:
        dict: 包含删除结果的字典
    """
    try:
        trans = Transaction.query.get_or_404(id)
        db.session.delete(trans)
        db.session.commit()

        # 同步预算
        if trans.type == 'expense':
            update_budget_for_transaction(trans.username, trans.category, -trans.amount, trans.date)

        return {
            "success": True,
            "message": "删除成功"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def get_budgets(username: str) -> dict:
    """
    获取用户的所有预算计划
    Args:
        username (str): 用户名
    Returns:
        dict: 包含预算计划列表的字典
    """
    try:
        budgets = Budget.query.filter_by(username=username).all()
        return {
            "success": True,
            "data": [{
                "id": b.id,
                "name": b.name,
                "target_amount": b.target_amount,
                "current_amount": b.current_amount,
                "category": b.category
            } for b in budgets]
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def create_budget(username: str, data: dict) -> dict:
    """
    创建一个新的预算计划
    
    Args:
        data (dict): 包含预算计划信息的字典
            必须包含 name, target_amount, category, username 字段
            
    Returns:
        dict: 包含创建结果的字典
    """
    try:
        category_name = data['category']

        from datetime import date
        import calendar

        now = date.today()
        start_date = date(now.year, now.month, 1)
        last_day = calendar.monthrange(now.year, now.month)[1]
        end_date = date(now.year, now.month, last_day)

        # 检查 category 是否是预设分类之一
        existing_category = Category.query.filter_by(name=category_name).first()
        if not existing_category:
            return {
                "success": False,
                "error": f"Invalid category: {category_name}"
            }, 400

        budget = Budget(
            name=data['name'],
            target_amount=data['target_amount'],
            current_amount=0,
            category=category_name,
            start_date=start_date,
            end_date=end_date,
            username=username,
        )
        db.session.add(budget)
        db.session.commit()
        
        # 计算该分类在预算时间范围内已有的支出交易总额
        existing_transactions = Transaction.query.filter(
            Transaction.username == username,
            Transaction.category == category_name,
            Transaction.type == 'expense',
            Transaction.date >= start_date,
            Transaction.date <= end_date
        ).all()
        
        # 累计已有支出（注意：支出金额存储为负数）
        total_spent = sum(abs(trans.amount) for trans in existing_transactions)
        budget.current_amount = total_spent
        
        print(f"[DEBUG] 新预算创建: {budget.name}, 同步已有支出: {total_spent}")
        db.session.commit()

        return {
            "success": True,
            "data": {
                "id": budget.id,
                "name": budget.name,
                "target_amount": budget.target_amount,
                "current_amount": budget.current_amount,
                "category": budget.category
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def get_categories() -> dict:
    """
    获取所有支出分类（预设 + 自定义）
    
    Returns:
        dict: 包含分类列表的字典 [{"id": id1, "name": name1}, {"id": id2, "name": name2}, ...]
    """
    try:
        categories = Category.query.all()
        # print("———————————————————正在获取所有支出分类———————————————————")
        # print([{"id": c.id, "name": c.name} for c in categories])  # 调试输出
        # print("——————————————————————————————————————————————————")
        return {
            "success": True,
            "data": [{
                "id": c.id,
                "name": c.name
            } for c in categories]
        }
    except Exception as e:
        print(str(e))
        return {
            "success": False,
            "error": str(e)
        }


def add_category(name: str) -> dict:
    """
    添加一个新的支出分类
    Args:
        name (str): 分类名称
    Returns:
        dict: 包含添加结果的字典
    """
    print("———————————————————正在添加支出分类———————————————————")
    print(f"添加分类名称: {name}")  # 调试输出
    print("——————————————————————————————————————————————————")
    try:

        # 检查是否已存在同名分类
        existing = Category.query.filter(db.func.lower(Category.name) == db.func.lower(name)).first()
        if existing:
            return {
                "success": False,
                "error": f"分类 '{name}' 已存在"
            }

        new = Category(name=name)
        db.session.add(new)
        db.session.commit()
        print('———————————————————添加分类成功———————————————————')
        return {
            "success": True,
            "data": {
                "id": new.id,
                "name": new.name
            }
        }
    except Exception as e:
        print('———————————————————添加分类失败———————————————————')
        print(str(e))  # 打印错误信息
        return {
            "success": False,
            "error": str(e)
        }


def update_category(id: int, new_name: str) -> dict:
    """
    更新指定 ID 的分类名称
    Args:
        id (int): 分类的 ID
        new_name (str): 新的分类名称
    Returns:
        dict: 包含更新结果的字典
    """
    cat = Category.query.get_or_404(id)

    # 检查是否有其他分类使用了相同的名称（排除自己）
    existing = Category.query.filter(
        db.func.lower(Category.name) == db.func.lower(new_name),
        Category.id != cat.id
    ).first()

    if existing:
        return {
            "success": False,
            "error": f"分类 '{new_name}' 已存在"
        }

    cat.name = new_name
    db.session.commit()

    return {
        "success": True,
        "data": {
            "id": cat.id,
            "name": cat.name
        }
    }


def delete_category(id: int) -> dict:
    """
    删除指定 ID 的支出分类
    
    Args:
        id (int): 分类的 ID
        
    Returns:
        dict: 包含删除结果的字典
    """
    try:
        cat = Category.query.get_or_404(id)
        db.session.delete(cat)
        db.session.commit()
        return {
            "success": True,
            "message": "分类删除成功"
        }
    except Exception as e:
        print(f"删除分类失败: {str(e)}")  # 打印错误信息
        return {
            "success": False,
            "error": str(e)
        }


def get_reports(username: str, range_type: str = 'month') -> dict:
    """
    根据时间范围获取支出分类统计数据
    
    Args:
        username (str): 用户名
        range_type (str): 时间范围类型，支持 'month', 'quarter', 'year'
        
    Returns:
        dict: 包含统计数据的字典
    """
    try:
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

        return {
            "success": True,
            "data": {
                "title": title,
                "total": total,
                "categories": categories
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }