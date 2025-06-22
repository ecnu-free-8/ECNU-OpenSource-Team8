from flask import Flask
from flask_cors import CORS # 导入 Flask-CORS
from config import configs
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(configs[config_name])
    app.json.ensure_ascii = False # 确保 JSON 响应可以正确显示中文字符
    # 初始化 Flask-CORS - 修复CORS配置
    CORS(app,
         origins=['http://localhost:3001', 'http://localhost:5123'],
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

    # Session配置 - 开发环境设置
    app.config.update(
        SESSION_COOKIE_SAMESITE='Lax',  # 开发环境使用Lax而不是None
        SESSION_COOKIE_SECURE=False,    # 开发环境设置为False
        SESSION_COOKIE_HTTPONLY=True,   # 增加安全性
        SESSION_COOKIE_DOMAIN=None      # 开发环境不设置域名
    )

    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://remote:520%40111zz@172.23.166.117/course'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    # 注册 API 蓝图
    from .api import bp as api_blueprint # 从 app.api 包导入蓝图实例
    app.register_blueprint(api_blueprint, url_prefix='/api') # API版本前缀
    with app.app_context():
        db.create_all()
        
        # 初始化预设分类
        from .models import Category, Budget
        from datetime import datetime, date
        
        default_categories = [
            '餐饮', '交通', '购物', '娱乐', '医疗', '教育', 
            '住房', '通讯', '旅游', '其他', '储蓄'
        ]
        
        for category_name in default_categories:
            existing = Category.query.filter_by(name=category_name).first()
            if not existing:
                new_category = Category(name=category_name)
                db.session.add(new_category)
        
        # 为默认用户(username=1)初始化一些示例预算
        default_username = 1
        current_date = date.today()
        
        # 检查是否已有预算数据
        existing_budgets = Budget.query.filter_by(username=default_username).first()
        if not existing_budgets:
            sample_budgets = [
                {'name': '娱乐预算', 'category': '娱乐', 'target_amount': 500.0},
                {'name': '餐饮预算', 'category': '餐饮', 'target_amount': 1000.0},
                {'name': '交通预算', 'category': '交通', 'target_amount': 300.0},
            ]
            
            for budget_data in sample_budgets:
                new_budget = Budget(
                    name=budget_data['name'],
                    category=budget_data['category'],
                    target_amount=budget_data['target_amount'],
                    current_amount=0.0,
                    start_date=current_date.replace(day=1),  # 本月第一天
                    end_date=current_date.replace(day=28),   # 本月最后几天
                    username=default_username
                )
                db.session.add(new_budget)
        
        db.session.commit()
    return app