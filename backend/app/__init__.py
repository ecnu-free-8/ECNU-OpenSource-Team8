from flask import Flask
from flask_cors import CORS # 导入 Flask-CORS
from config import configs # 从项目根目录导入

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(configs[config_name])
    app.json.ensure_ascii = False # 确保 JSON 响应可以正确显示中文字符
    # 初始化 Flask-CORS
    # resources={r"/api/*": {"origins": "*"}} 表示允许所有来源访问 /api/ 开头的路径
    CORS(app, resources={r"/api/*": {"origins": "*"}}, origins=['http://localhost:3001'], supports_credentials=True) # 允许跨域请求，指定前端地址和支持凭据
    app.config.update(
        SESSION_COOKIE_SAMESITE='None',
        SESSION_COOKIE_SECURE=True
    )
    # 注册 API 蓝图
    from .api import bp as api_blueprint # 从 app.api 包导入蓝图实例
    app.register_blueprint(api_blueprint, url_prefix='/api/v1') # API版本前缀
    return app