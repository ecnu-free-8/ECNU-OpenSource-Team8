# API集成指南

## 概述

我们已经成功将原型代码重构为支持真实API的架构，同时保持了模拟数据的兼容性。这样可以在后端开发完成前继续前端开发，并在后端就绪时无缝切换到真实API。

## 架构变更

### 1. 新增依赖
- `@tanstack/react-query`: 强大的数据获取和状态管理库
- `axios`: HTTP客户端库

### 2. 新增文件结构
```
frontend/src/
├── api/
│   ├── client.js          # Axios配置和拦截器
│   └── services.js        # API服务层
├── hooks/
│   ├── useFinancial.js    # 财务数据hooks
│   ├── useTransactions.js # 交易记录hooks
│   ├── useCategories.js   # 分类管理hooks
│   ├── useBudgets.js      # 预算计划hooks
│   ├── useReports.js      # 报表数据hooks
│   └── useAI.js           # AI助手hooks
├── data/
│   └── mockData.js        # 模拟数据
├── types/
│   └── index.js           # TypeScript类型定义
└── providers/
    └── QueryProvider.js   # React Query配置
```

## 核心功能

### 1. 智能数据切换
通过环境变量 `REACT_APP_USE_MOCK_DATA` 控制是否使用模拟数据：
- `true`: 使用模拟数据（默认，适合开发阶段）
- `false`: 使用真实API

### 2. 统一的API接口
所有API调用都通过services层统一管理：
- `financialApi`: 财务摘要
- `transactionApi`: 交易记录CRUD
- `categoryApi`: 分类管理CRUD
- `budgetApi`: 预算计划CRUD
- `reportApi`: 报表数据
- `aiApi`: AI助手对话

### 3. React Query集成
- 自动缓存和同步
- 加载状态管理
- 错误处理
- 乐观更新
- 后台重新获取

### 4. 组件重构
所有页面组件都已重构为使用hooks：
- 加载状态显示
- 错误处理
- 空状态处理
- 实时数据更新

## 使用方法

### 开发阶段（使用模拟数据）
```bash
# 确保环境变量设置
echo "REACT_APP_USE_MOCK_DATA=true" >> .env

# 启动开发服务器
npm start
```

### 生产阶段（使用真实API）
```bash
# 更新环境变量
echo "REACT_APP_USE_MOCK_DATA=false" >> .env
echo "REACT_APP_API_BASE_URL=https://your-api-domain.com/api" >> .env

# 启动应用
npm start
```

## API接口规范

### 响应格式
所有API响应都应遵循统一格式：
```json
{
  "success": true,
  "data": { /* 实际数据 */ },
  "message": "操作成功",
  "timestamp": "2025-06-18T10:00:00Z"
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误信息",
  "code": "ERROR_CODE",
  "timestamp": "2025-06-18T10:00:00Z"
}
```

## 后端API端点

当后端开发完成时，需要实现以下端点：

### 财务摘要
- `GET /api/financial/summary` - 获取财务摘要

### 交易记录
- `GET /api/transactions` - 获取交易列表
- `POST /api/transactions` - 创建交易记录
- `PUT /api/transactions/:id` - 更新交易记录
- `DELETE /api/transactions/:id` - 删除交易记录

### 分类管理
- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 预算计划
- `GET /api/budgets` - 获取预算列表
- `POST /api/budgets` - 创建预算
- `PUT /api/budgets/:id` - 更新预算
- `DELETE /api/budgets/:id` - 删除预算

### 报表数据
- `GET /api/reports/expense?period=monthly` - 获取支出报表
- `GET /api/reports/income?period=monthly` - 获取收入报表

### AI助手
- `POST /api/ai/chat` - 发送消息给AI助手

## 优势

1. **无缝切换**: 可以在开发和生产环境间轻松切换
2. **类型安全**: 完整的TypeScript类型定义
3. **错误处理**: 统一的错误处理机制
4. **性能优化**: React Query提供缓存和优化
5. **开发体验**: 丰富的加载状态和错误提示
6. **可维护性**: 清晰的代码结构和分离关注点

## 下一步

1. 后端团队可以参考API规范开始开发
2. 前端可以继续基于模拟数据开发新功能
3. 当后端就绪时，只需更改环境变量即可切换到真实API
4. 可以逐步添加更多功能和优化用户体验
