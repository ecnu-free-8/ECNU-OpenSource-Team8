from flask import Flask
from flask_cors import CORS # 导入 Flask-CORS
from config import configs
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(configs[config_name])
    app.json.ensure_ascii = False # 确保 JSON 响应可以正确显示中文字符
    # 初始化 Flask-CORS
    # resources={r"/api/*": {"origins": "*"}} 表示允许所有来源访问 /api/ 开头的路径
    CORS(app, resources={r"/api/*": {"origins": "*"}}, origins=['http://localhost:3001', 'http://localhost:5123'], supports_credentials=True) # 允许跨域请求，指定前端地址和支持凭据
    app.config.update(
        SESSION_COOKIE_SAMESITE='None',
        SESSION_COOKIE_SECURE=True
    )
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://remote:520%40111zz@172.23.166.117/course'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    # 注册 API 蓝图
    from .api import bp as api_blueprint # 从 app.api 包导入蓝图实例
    app.register_blueprint(api_blueprint, url_prefix='/api') # API版本前缀
    with app.app_context():
        db.create_all()
    return app