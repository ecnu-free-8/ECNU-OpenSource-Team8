from flask import Flask, request, jsonify, render_template
import sqlite3
from datetime import datetime
from openai import OpenAI
import os
from dotenv import load_dotenv
import json
import re


load_dotenv()

app = Flask(__name__)
DATABASE = 'expenses.db'

# ECNU API配置
# ECNU_API_KEY = os.getenv('ECNU_API_KEY')
client = OpenAI(
        api_key="sk-b1f55cdca327440482ff1d18c363f3b7",
        base_url="https://chat.ecnu.edu.cn/open/api/v1"
    )

def init_db():
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS expenses
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  amount REAL NOT NULL,
                  category TEXT NOT NULL,
                  date TEXT NOT NULL,
                  payment_method TEXT,
                  description TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    conn.commit()
    conn.close()

def query_db(query, args=(), one=False):
    conn = sqlite3.connect(DATABASE)
    cur = conn.cursor()
    cur.execute(query, args)
    rv = cur.fetchall()
    conn.close()
    return (rv[0] if rv else None) if one else rv

def parse_expense_with_ecnu(text):
    """使用ECNU API解析开支记录"""
    try:
        completion = client.chat.completions.create(
            model="ecnu-plus",
            messages=[
                {"role": "system", "content": """你是一个智能开支记录解析助手。请将用户的开支记录解析为严格规范的JSON格式,只返回json，其余的都不要，包含以下字段：
                - amount (float): 金额
                - category (str): 类别（餐饮、交通、购物等）
                - date (str): 日期（格式YYYY-MM-DD，默认为今天）
                - payment_method (str): 支付方式（支付宝、微信、现金等）
                - description (str): 详细描述
                """},
                {"role": "user", "content": text}
            ],
            response_format={"type": "json_object"}
        )
        pattern = r'\{[^{}]*\}'
        matches = re.findall(pattern, completion.choices[0].message.content)
        print(matches[0])
        result = json.loads(matches[0])
        
        # if 'date' not in result:
        result['date'] = datetime.now().strftime('%Y-%m-%d')
        print("解析结果:", result)
        return result
    except Exception as e:
        raise ValueError(f"ECNU API解析失败: {str(e)}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')
    
    try:
        expense_data = parse_expense_with_ecnu(user_input)
        
        conn = sqlite3.connect(DATABASE)
        c = conn.cursor()
        c.execute('''INSERT INTO expenses (amount, category, date, payment_method, description)
                     VALUES (?, ?, ?, ?, ?)''',
                  (expense_data['amount'], 
                   expense_data['category'],
                   expense_data['date'],
                   expense_data.get('payment_method', ''),
                   expense_data.get('description', '')))
        conn.commit()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': f"已记录：{expense_data['category']} {expense_data['amount']}元"
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/expenses/daily')
def get_daily_expenses():
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    expenses = query_db('SELECT * FROM expenses WHERE date = ? ORDER BY created_at DESC', [date])
    return jsonify([dict(zip(['id', 'amount', 'category', 'date', 'payment_method', 'description', 'created_at'], row)) 
                    for row in expenses])

@app.route('/api/expenses/weekly')
def get_weekly_expenses():
    weekly_data = query_db('''SELECT strftime('%Y-%W', date) as week, 
                             SUM(amount) as total, 
                             COUNT(*) as count 
                          FROM expenses 
                          GROUP BY week 
                          ORDER BY week DESC''')
    return jsonify([{'week': week, 'total': total, 'count': count} 
                    for week, total, count in weekly_data])

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
