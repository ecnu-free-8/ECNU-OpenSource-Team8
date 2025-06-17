
# ECNU-OpenSource-Team8 Backend README

## 环境配置

1. 确保安装了 Python 3.8 或更高版本。
2. 安装依赖库：
   ```bash
   pip install -r requirements.txt
   ```
3. 前端服务应该运行在 `http://localhost:3001`，或者修改 app/static/login.js 中的 URL。

## 启动服务

1. 启动 Flask 服务：
   在 backend 目录下运行以下命令：
   ```bash
   python run.py
   ```

## API 端点

### 登录
- **URL**: `/api/login`
- **方法**: `POST`
- **请求体**:
  ```json
  {
      "username": "your_username",
      "password": "your_password"
  }
  ```
- **响应**:
  ```json
    {
        "message": "Login successful",
        "user": {
            "username": "your_username"
        }
    // 或者
    {
        "message": "Login successful",
        "user": {
            "email": "your_email"
        }
    }
    ```

### 注册
- **URL**: `/api/register`
- **方法**: `POST`
- **请求体**:
  ```json
  {
      "username": "your_username",
      "email": "your_email",
      "password": "your_password"
  }
  ```
- **响应**:
  ```json
  {
      "message": "Registration successful"
  }
  ```

### 登出
- **URL**: `/logout`
- **方法**: `GET`
- **响应**:
  ```json
  {
      "message": "Logout successful"
  }
  ```

## 前端代码示例
前端代码测试登陆状态示例（使用 Axios）:

```javascript
import axios from 'axios';

// 可以设置为全局默认值
axios.defaults.withCredentials = true;

// 或者在单个请求中设置
axios.get('http://localhost:5123/api/test', {
    withCredentials: true // <-- 关键配置！
}).then(response => {
    console.log(response.data); // 打印用户名，如果未登录则返回 No user logged in
});
```

