from flask import Flask, render_template, request, jsonify
from datetime import datetime, timedelta
import json
import os

app = Flask(__name__)

# 数据存储文件
DATA_FILE = 'expenses.json'

# 初始化数据
if os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'r') as f:
        expenses = json.load(f)
else:
    expenses = []

categories = ["餐饮", "交通", "娱乐", "购物", "住房", "医疗", "其他"]

def save_data():
    """保存数据到文件"""
    with open(DATA_FILE, 'w') as f:
        json.dump(expenses, f, ensure_ascii=False, indent=2)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/expenses', methods=['GET', 'POST'])
def handle_expenses():
    if request.method == 'POST':
        data = request.json
        try:
            expense = {
                "description": data['description'],
                "amount": float(data['amount']),
                "category": data['category'],
                "date": datetime.now().strftime("%Y-%m-%d %H:%M")
            }
            expenses.append(expense)
            save_data()
            return jsonify({"status": "success", "data": get_today_summary()})
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 400
    else:
        period = request.args.get('period', 'today')
        return jsonify(get_expenses_data(period))

@app.route('/api/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')
    response = process_message(user_input)
    return jsonify({'response': response})

def process_message(message):
    """处理用户输入并生成响应"""
    message = message.lower().strip()
    print(f"用户输入: {message}")
    # 解析消费记录
    if any(word in message for word in ["花了", "消费", "支出", "买了", "花费"]):
        try:
            parts = message.split()
            if len(parts) >= 3 and "元" in parts[1]:
                amount = float(parts[1].replace("元", ""))
                category = parts[2] if parts[2] in categories else "其他"
                description = parts[0]
                
                expense = {
                    "description": description,
                    "amount": amount,
                    "category": category,
                    "date": datetime.now().strftime("%Y-%m-%d %H:%M")
                }
                expenses.append(expense)
                save_data()
                
                return f"✅ 已记录: {description} {amount}元 ({category})\n{get_today_summary()}"
        except Exception as e:
            return "❌ 格式错误，请使用: '描述 金额 类别' 例如: '午餐 30元 餐饮'"
    
    # 查询消费
    elif any(word in message for word in ["今天花了", "今日消费", "今天支出", "今日花了", "今日花费", "今天花费"]):
        return get_today_summary()
    
    elif any(word in message for word in ["本周", "这周"]):
        return get_weekly_summary()
    
    elif any(word in message for word in ["本月", "这个月"]):
        return get_monthly_summary()
    
    elif any(word in message for word in categories):
        return get_category_summary(message)
    
    else:
        return """我可以帮你记录和分析日常开支，请告诉我：
1. 你的消费记录（例：早餐 15元 餐饮）
2. 查询消费（例：今天/本周/本月消费）
3. 查询分类消费（例：餐饮支出）"""

def get_expenses_data(period='today'):
    """获取不同时间段的消费数据"""
    now = datetime.now()
    if period == 'today':
        date_str = now.strftime("%Y-%m-%d")
        filtered = [e for e in expenses if e['date'].startswith(date_str)]
    elif period == 'week':
        week_start = now - timedelta(days=now.weekday())
        filtered = [e for e in expenses if datetime.strptime(e['date'], "%Y-%m-%d %H:%M") >= week_start]
    elif period == 'month':
        month_start = now.replace(day=1)
        filtered = [e for e in expenses if datetime.strptime(e['date'], "%Y-%m-%d %H:%M") >= month_start]
    else:
        filtered = expenses
    
    return {
        'expenses': filtered,
        'summary': {
            'total': sum(e['amount'] for e in filtered),
            'count': len(filtered),
            'by_category': get_category_summary_data(filtered)
        }
    }

def get_today_summary():
    today = datetime.now().strftime("%Y-%m-%d")
    today_expenses = [e for e in expenses if e['date'].startswith(today)]
    return format_summary(today_expenses, "今日")

def get_weekly_summary():
    week_start = datetime.now() - timedelta(days=datetime.now().weekday())
    weekly_expenses = [e for e in expenses if datetime.strptime(e['date'], "%Y-%m-%d %H:%M") >= week_start]
    return format_summary(weekly_expenses, "本周")

def get_monthly_summary():
    month_start = datetime.now().replace(day=1)
    monthly_expenses = [e for e in expenses if datetime.strptime(e['date'], "%Y-%m-%d %H:%M") >= month_start]
    return format_summary(monthly_expenses, "本月")

def get_category_summary(category):
    category_expenses = [e for e in expenses if e['category'] == category]
    return format_summary(category_expenses, f"{category}类")

def get_category_summary_data(expense_list):
    """按分类汇总数据"""
    by_category = {}
    for e in expense_list:
        by_category[e['category']] = by_category.get(e['category'], 0) + e['amount']
    return by_category

def format_summary(expense_list, period_name):
    if not expense_list:
        return f"{period_name}还没有消费记录"
    
    total = sum(e['amount'] for e in expense_list)
    by_category = get_category_summary_data(expense_list)
    
    summary = f"📊 {period_name}消费总计: {total}元 ({len(expense_list)}笔)\n"
    for cat, amount in by_category.items():
        summary += f"- {cat}: {amount}元\n"
    
    return summary

if __name__ == '__main__':
    app.run(debug=True)