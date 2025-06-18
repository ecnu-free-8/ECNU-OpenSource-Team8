from backend.app.models import app, db

with app.app_context():
    db.create_all()
    print("✅ 数据库和所有表已成功创建！")