from flask import session, redirect, request, url_for, render_template, jsonify
from app import create_app
import sqlite3
from dbinit import init_db
import os

app = create_app('development')


@app.route('/')
def index():
    return "Welcome to the Chat Interaction Tree API!", 200

# 渲染注册页面
@app.route('/register', methods=['GET'])
def register_page():
    return render_template('register.html')
# 渲染登录页面
@app.route('/login', methods=['GET'])
def login_page():
    return render_template('login.html')

@app.route('/api/register', methods=['POST'])
def register():
    username = request.form.get('username')
    password = request.form.get('password')
    if len(username) == 0 or len(password) == 0:
        return jsonify({"error": "Username and password cannot be empty"}), 400
    if len(username) > 20 or len(password) > 20:
        return jsonify({"error": "Username and password must be less than 20 characters"}), 400
    # sqlite 数据库连接
    if os.path.exists(app.config['DATABASE_URI']) is False:
        init_db(app.config['DATABASE_URI'])
    conn = sqlite3.connect(app.config['DATABASE_URI'])
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
        conn.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Username already exists"}), 400
    finally:
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')
    print(f"Login attempt with username: {username}, password: {password}")
    # sqlite 数据库连接
    conn = sqlite3.connect(app.config['DATABASE_URI'])
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username=? and password=?", (username, password))
    if cursor.fetchone():
        session['username'] = username
        conn.close()
        return jsonify({
                'message': 'Login successful',
                'user': {
                    'username': username
                }
            }), 200
    
    cursor.execute("SELECT * FROM users WHERE email=? and password=?", (username, password))
    if cursor.fetchone():
        session['username'] = username
        conn.close()
        return jsonify({
                'message': 'Login successful',
                'user': {
                    'email': username
                }
            }), 200
    conn.close()
    return jsonify({"error": "Invalid username or password"}), 401    
@app.route('/logout')
def logout():
    session.pop('username', None)
    return jsonify({'message': 'Logout successful'}), 200

if __name__ == '__main__':
    # host='0.0.0.0' 使其可以从局域网访问
    # debug 模式应该由配置控制
    app.run(host='0.0.0.0', port=5123)