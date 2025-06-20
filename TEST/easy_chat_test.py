import requests
import json # 导入json库，如果需要打印response.json()

def logger(func):
    def wrapper(*args, **kwargs):
        print(f"——————————————正在执行 {func.__name__} ————————————————")
        result = func(*args, **kwargs)
        print(f"*** {func.__name__} 返回值： {result}")
        print('\n')
        return result
    
    return wrapper

@logger
def login_test(session=None):
    url_login = "http://localhost:5123/api/login"

    # 这是一个字典，requests会将其自动编码为表单数据 (application/x-www-form-urlencoded)
    # 并且requests会自动设置或覆盖Content-Type为正确的类型
    data_login = {
        "username": "root",
        "password": "123"
    }
    
    response_login = session.post(url_login, data=data_login) # <--- 修正

    if response_login.status_code == 200:
        print("Login successful:", response_login.json())
        print("Cookies received after login:", response_login.cookies)
        print("Session cookies after login:", session.cookies)
        
        # --- 添加这一行，查看原始的Set-Cookie头 ---
        print("\n--- Raw Set-Cookie Header ---")
        print(response_login.headers.get('Set-Cookie'))
        # ---------------------------------------------

        # ... 后续的 assert 语句 ...
    else:
        print("Login failed:", response_login.status_code, response_login.text)

@logger
def login_status(session=None):
    url_status = "http://localhost:5123/api/test"
    
    response_status = session.get(url_status)
    
    if response_status.status_code == 200:
        print("Status check successful:", response_status.json())
    else:
        print("Status check failed:", response_status.status_code, response_status.text)

@logger
def chat_test(prompt: str, session=None):
    url_chat = "http://localhost:5123/api/chat"
    
    data_chat = {
        "prompt": prompt
    }
    
    response_chat = session.post(url_chat, json=data_chat)  # 使用json参数自动设置Content-Type为application/json
    
    if response_chat.status_code == 200:
        print("Chat response:", response_chat.json())
    else:
        print("Chat request failed:", response_chat.status_code, response_chat.text)

session = requests.Session()  # 创建一个会话对象
login_test(session)
login_status(session)


@logger
def get_categories(session=None):
    url_categories = "http://localhost:5123/api/categories"
    
    response_categories = session.get(url_categories)
    
    if response_categories.status_code == 200:
        print("Categories:", response_categories.json())
    else:
        print("Failed to get categories:", response_categories.status_code, response_categories.text)

get_categories(session)  # 获取当前分类列表

chat_test("添加一个分类，就叫绝区零氪金吧", session) # 添加一个分类

get_categories(session)  # 获取当前分类列表

chat_test("删除绝区零的这个分类", session) # 删除一个分类

get_categories(session)  # 获取当前分类列表
