# 智能记账应用 - 完整API规范

## 设计原则
- **简单实用** - 能完成基本功能即可
- **用户隔离** - 所有请求需要带上username
- **统一格式** - 标准化的请求和响应格式

## 1. 通用规范

### 1.1 请求格式
所有API请求都需要包含用户身份标识：

**查询参数方式（GET请求）:**
```
GET /api/summary?username=demo_user
```

**请求体方式（POST/PUT请求）:**
```json
{
  "username": "demo_user",
  "amount": 25.0,
  "category": "餐饮"
}
```

### 1.2 响应格式

**成功响应:**
```json
{
  "success": true,
  "data": {}
}
```

**错误响应:**
```json
{
  "success": false,
  "error": "具体错误信息"
}
```

## 2. 认证接口

### 2.1 用户登录
```
POST /api/login
```

**请求参数:**
```json
{
  "username": "demo_user",
  "password": "123456"
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "username": "demo_user",
    "email": "demo@example.com"
  }
}
```

### 2.2 用户注册
```
POST /api/register
```

**请求参数:**
```json
{
  "username": "new_user",
  "email": "user@example.com",
  "password": "123456"
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "username": "new_user",
    "email": "user@example.com"
  }
}
```

## 3. 主页接口

### 3.1 获取财务摘要
```
GET /api/summary?username=demo_user
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "expense": 2580.00,
    "income": 8500.00,
    "balance": 5920.00
  }
}
```

### 3.2 获取最近交易
```
GET /api/transactions?username=demo_user&limit=10
```

**查询参数:**
- `username` (必需): 用户名
- `limit` (可选): 返回条数，默认10

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "description": "午餐",
      "amount": 25.0,
      "category": "餐饮",
      "date": "2025-06-15T12:30:00Z",
      "type": "expense"
    }
  ]
}
```

## 4. 交易管理接口

### 4.1 创建交易记录
```
POST /api/transactions
```

**请求参数:**
```json
{
  "username": "demo_user",
  "amount": 25.0,
  "type": "expense",
  "category": "餐饮",
  "description": "午餐"
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": 124,
    "amount": 25.0,
    "type": "expense",
    "category": "餐饮",
    "description": "午餐",
    "date": "2025-06-15T12:30:00Z"
  }
}
```

### 4.2 更新交易记录
```
PUT /api/transactions/{id}
```

**请求参数:**
```json
{
  "username": "demo_user",
  "amount": 30.0,
  "category": "餐饮",
  "description": "午餐(已修正)"
}
```

### 4.3 删除交易记录
```
DELETE /api/transactions/{id}?username=demo_user
```

**响应示例:**
```json
{
  "success": true,
  "data": "删除成功"
}
```

## 5. 分类管理接口

### 5.1 获取分类列表
```
GET /api/categories?username=demo_user
```

**响应示例:**
```json
{
  "success": true,
  "data": [
    {"id": 1, "name": "餐饮"},
    {"id": 2, "name": "交通"},
    {"id": 3, "name": "购物"},
    {"id": 4, "name": "娱乐"}
  ]
}
```

### 5.2 添加分类
```
POST /api/categories
```

**请求参数:**
```json
{
  "username": "demo_user",
  "name": "宠物"
}
```

### 5.3 更新分类
```
PUT /api/categories/{id}
```

**请求参数:**
```json
{
  "username": "demo_user",
  "name": "宠物用品"
}
```

### 5.4 删除分类
```
DELETE /api/categories/{id}?username=demo_user
```

## 6. 预算计划接口

### 6.1 获取预算列表
```
GET /api/plans?username=demo_user
```

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "餐饮预算",
      "target_amount": 800.0,
      "current_amount": 580.0,
      "category": "餐饮"
    }
  ]
}
```

### 6.2 创建预算
```
POST /api/plans
```

**请求参数:**
```json
{
  "username": "demo_user",
  "name": "月度餐饮预算",
  "target_amount": 800.0,
  "category": "餐饮"
}
```

### 6.3 更新预算
```
PUT /api/plans/{id}
```

### 6.4 删除预算
```
DELETE /api/plans/{id}?username=demo_user
```

## 7. 报表接口

### 7.1 获取支出分析
```
GET /api/reports?username=demo_user&range=month
```

**查询参数:**
- `username` (必需): 用户名
- `range` (可选): 时间范围 (month, quarter, year)，默认month

**响应示例:**
```json
{
  "success": true,
  "data": {
    "title": "本月支出分类",
    "total": 1359.0,
    "categories": [
      {"name": "餐饮", "amount": 580.0},
      {"name": "交通", "amount": 320.0}
    ]
  }
}
```

## 8. AI助手接口

### 8.1 处理自然语言输入
```
POST /api/chat
```

**请求参数:**
```json
{
  "username": "demo_user",
  "message": "今天午饭花了25元"
}
```

**响应示例 - 记录开支:**
```json
{
  "success": true,
  "data": {
    "intent": "RECORD_TRANSACTION",
    "response": "好的，我已经记录了这笔开支：\n💰 金额：25元\n🍽 分类：餐饮\n📅 时间：今天",
    "transaction_id": 123
  }
}
```

**响应示例 - 查询数据:**
```json
{
  "success": true,
  "data": {
    "intent": "QUERY_DATA",
    "response": "本月您总共花费了2580.00元，主要支出为餐饮580元，交通320元。"
  }
}
```

## 9. 错误处理

### 常见错误码
- `用户不存在` - 用户名不存在
- `参数错误` - 必需参数缺失或格式错误
- `权限不足` - 用户无权访问该资源
- `资源不存在` - 请求的数据不存在
- `服务器错误` - 内部服务器错误

### 错误响应示例
```json
{
  "success": false,
  "error": "用户不存在"
}
```

## 10. 实现建议

### 后端实现要点
1. **用户验证**: 每个请求都验证username是否存在
2. **数据隔离**: 确保用户只能访问自己的数据
3. **参数验证**: 验证必需参数和数据格式
4. **错误处理**: 返回清晰的错误信息
5. **性能优化**: 合理使用数据库索引

### 前端适配
- 所有API调用自动添加当前登录用户的username
- 统一的错误处理和用户提示
- 登录状态管理和自动登出

这个API规范简单实用，能够满足智能记账应用的所有基本功能需求！
