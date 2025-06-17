from flask import request, jsonify
from . import bp
from flask import session, redirect, url_for, render_template
# from app.core.chat_process import (
#     generate_tree
# )
@bp.route('/test', methods=['GET'])
def test():
    return session.get('username', 'No user logged in'), 200
# @bp.route('/chat-interaction-tree/<string:contents>', methods=['GET'])
# def get_tree(contents):
#     try:
#         # 假设你的 chat_processor 函数知道如何获取该用户的数据
#         result = generate_tree(contents)
#         print(result)
#         if result is None:
#             return jsonify({"message": "Tree data not found for user."}), 404
#         print(jsonify({'data': result}))
#         return jsonify({'data': result}), 200
#     except Exception as e:
#         return jsonify({"error": "Failed to retrieve tree data", "details": str(e)}), 500

# @bp.route('/chat-interaction-tree', methods=['POST'])
# def post_interaction():
#     if not request.is_json:
#         return jsonify({"error": "Request must be JSON"}), 400
#     contents = request.get_json()['contents']
#     try:
#         result = generate_tree(contents)
#         return jsonify({'data': result}), 201
#     except Exception as e:
#         return jsonify({"error": "Failed to add interaction", "details": str(e)}), 500