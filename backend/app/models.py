from datetime import datetime  # 用于时间字段
from app import db

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(10), nullable=False)  # expense/income
    category = db.Column(db.String(20), nullable=False)
    description = db.Column(db.String(100))
    date = db.Column(db.DateTime, default=datetime.utcnow)
    username = db.Column(db.String(50), nullable=False)

class Budget(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    target_amount = db.Column(db.Float, nullable=False)
    current_amount = db.Column(db.Float, default=0)
    category = db.Column(db.String(20), nullable=False)
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    username = db.Column(db.String(50), nullable=False)

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), unique=True, nullable=False)

class Chat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    type = db.Column(db.Integer, nullable=False)  # 0: robot, 1: user
    date = db.Column(db.DateTime, default=datetime.utcnow)
    username = db.Column(db.String(50), nullable=False)