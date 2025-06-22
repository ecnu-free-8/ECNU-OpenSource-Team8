from flask import session, redirect, request, url_for, render_template, jsonify
from flask_cors import cross_origin, CORS
from app import create_app
import sqlite3
from dbinit import init_db
import os

app = create_app('development')

# 添加全局CORS配置，允许3001端口访问
CORS(app,
     origins=['http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:3000', 'http://127.0.0.1:3000'],
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
     expose_headers=['Content-Type', 'Authorization'])


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

@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    # 处理OPTIONS预检请求
    if request.method == 'OPTIONS':
        return '', 200

    # 根据Content-Type选择正确的数据获取方式
    if request.content_type == 'application/json':
        # 处理JSON数据
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400
        username = data.get('username')
        password = data.get('password')
    else:
        # 处理表单数据
        username = request.form.get('username')
        password = request.form.get('password')
    print(f"Register attempt - username: {username}")

    if not username or not password:
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

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    # 处理OPTIONS预检请求
    if request.method == 'OPTIONS':
        print("✅ OPTIONS预检请求处理成功")
        return '', 200

    # 尝试多种方式获取数据
    username = None
    password = None

    # 方式1: form data
    if request.form:
        username = request.form.get('username')
        password = request.form.get('password')
        print(f"📝 从form获取: username={username}, password={'***' if password else 'None'}")

    # 方式2: JSON data
    if not username and request.is_json:
        json_data = request.get_json()
        if json_data:
            username = json_data.get('username')
            password = json_data.get('password')
            print(f"📝 从JSON获取: username={username}, password={'***' if password else 'None'}")

    # 方式3: raw data
    if not username and request.data:
        print(f"📝 Raw data: {request.data}")

    print(f"🔑 最终获取到: username={username}, password={'***' if password else 'None'}")
    print(f"Session before login: {dict(session)}")

    # sqlite 数据库连接
    conn = sqlite3.connect(app.config['DATABASE_URI'])
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username=? and password=?", (username, password))
    if cursor.fetchone():
        session['username'] = username
        print(f"✅ Login successful for username: {username}")
        print(f"Session after login: {dict(session)}")
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
        print(f"✅ Login successful for email: {username}")
        print(f"Session after login: {dict(session)}")
        conn.close()
        return jsonify({
                'message': 'Login successful',
                'user': {
                    'email': username
                }
            }), 200

    print(f"❌ Login failed for: {username}")
    conn.close()
    return jsonify({"error": "Invalid username or password"}), 401
@app.route('/logout', methods=['GET', 'POST', 'OPTIONS'])
def logout():
    # 处理OPTIONS预检请求
    if request.method == 'OPTIONS':
        return '', 200

    print(f"Logout - Session before: {dict(session)}")
    session.pop('username', None)
    print(f"Logout - Session after: {dict(session)}")
    return jsonify({'message': 'Logout successful'}), 200

if __name__ == '__main__':
    # host='0.0.0.0' 使其可以从局域网访问
    # debug 模式应该由配置控制
    for rule in app.url_map.iter_rules():
        print(f"{rule.endpoint}: {rule.rule} {rule.methods}")
    app.run(host='0.0.0.0', port=5123)