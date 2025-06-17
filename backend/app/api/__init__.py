from flask import Blueprint

# url_prefix 会在 app/__init__.py 中注册蓝图时指定，这里不需要
bp = Blueprint('api', __name__) 

from . import routes # 导入这个蓝图下的路由定义