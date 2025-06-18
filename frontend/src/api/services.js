import { api } from './client';
import {
  mockFinancialSummary,
  mockTransactions,
  mockCategories,
  mockBudgets,
  mockReportData,
  mockApiCall,
  getUserMockData
} from '../data/mockData';

// 环境变量控制是否使用模拟数据
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA !== 'false';

// 获取当前用户名
const getCurrentUsername = () => {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    try {
      const user = JSON.parse(currentUser);
      return user.username;
    } catch (e) {
      return 'demo';
    }
  }
  return 'demo';
};

// 财务摘要API
export const financialApi = {
  // 获取财务摘要
  getSummary: async () => {
    if (USE_MOCK_DATA) {
      const username = getCurrentUsername();
      const userMockData = getUserMockData(username);
      return mockApiCall(userMockData.financialSummary);
    }
    const response = await api.get('/summary');
    return response.data;
  }
};

// 交易记录API
export const transactionApi = {
  // 获取交易列表
  getTransactions: async (params = {}) => {
    if (USE_MOCK_DATA) {
      const username = getCurrentUsername();
      const userMockData = getUserMockData(username);
      let filteredTransactions = [...userMockData.transactions];

      // 模拟筛选逻辑
      if (params.type) {
        filteredTransactions = filteredTransactions.filter(t => t.type === params.type);
      }
      if (params.category) {
        filteredTransactions = filteredTransactions.filter(t => t.category === params.category);
      }
      if (params.startDate && params.endDate) {
        filteredTransactions = filteredTransactions.filter(t =>
          t.date >= params.startDate && t.date <= params.endDate
        );
      }
      if (params.limit) {
        filteredTransactions = filteredTransactions.slice(0, params.limit);
      }

      return mockApiCall(filteredTransactions);
    }
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  // 创建交易记录
  createTransaction: async (transactionData) => {
    if (USE_MOCK_DATA) {
      const newTransaction = {
        id: Date.now(),
        ...transactionData,
        date: transactionData.date || new Date().toISOString().split('T')[0],
        time: '刚刚'
      };
      return mockApiCall(newTransaction);
    }
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  // 更新交易记录
  updateTransaction: async (id, transactionData) => {
    if (USE_MOCK_DATA) {
      return mockApiCall({ id, ...transactionData });
    }
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  },

  // 删除交易记录
  deleteTransaction: async (id) => {
    if (USE_MOCK_DATA) {
      return mockApiCall({ id, deleted: true });
    }
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  }
};

// 分类管理API
export const categoryApi = {
  // 获取分类列表
  getCategories: async () => {
    if (USE_MOCK_DATA) {
      return mockApiCall(mockCategories);
    }
    const response = await api.get('/categories');
    return response.data;
  },

  // 创建分类
  createCategory: async (categoryData) => {
    if (USE_MOCK_DATA) {
      const newCategory = {
        id: Date.now(),
        ...categoryData
      };
      return mockApiCall(newCategory);
    }
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // 更新分类
  updateCategory: async (id, categoryData) => {
    if (USE_MOCK_DATA) {
      return mockApiCall({ id, ...categoryData });
    }
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // 删除分类
  deleteCategory: async (id) => {
    if (USE_MOCK_DATA) {
      return mockApiCall({ id, deleted: true });
    }
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

// 预算计划API
export const budgetApi = {
  // 获取预算列表
  getBudgets: async () => {
    if (USE_MOCK_DATA) {
      // 转换为新的API格式
      const formattedBudgets = mockBudgets.map(budget => ({
        id: budget.id,
        name: budget.name,
        target_amount: budget.targetAmount,
        current_amount: budget.currentAmount,
        category: budget.category
      }));
      return mockApiCall(formattedBudgets);
    }
    const response = await api.get('/plans');
    return response.data;
  },

  // 创建预算
  createBudget: async (budgetData) => {
    if (USE_MOCK_DATA) {
      const newBudget = {
        id: Date.now(),
        name: budgetData.name,
        target_amount: budgetData.target_amount,
        current_amount: 0.0,
        category: budgetData.category
      };
      return mockApiCall(newBudget);
    }
    const response = await api.post('/plans', budgetData);
    return response.data;
  },

  // 更新预算
  updateBudget: async (id, budgetData) => {
    if (USE_MOCK_DATA) {
      return mockApiCall({ id, ...budgetData });
    }
    const response = await api.put(`/plans/${id}`, budgetData);
    return response.data;
  },

  // 删除预算
  deleteBudget: async (id) => {
    if (USE_MOCK_DATA) {
      return mockApiCall("预算删除成功");
    }
    const response = await api.delete(`/plans/${id}`);
    return response.data;
  }
};

// 报表数据API
export const reportApi = {
  // 获取支出报表
  getExpenseReport: async (range = 'month') => {
    if (USE_MOCK_DATA) {
      const periodMap = {
        'month': 'monthly',
        'quarter': 'quarterly',
        'year': 'yearly'
      };
      const mockPeriod = periodMap[range] || 'monthly';
      const reportData = mockReportData[mockPeriod] || mockReportData.monthly;

      // 转换为新的API格式
      const formattedData = {
        title: reportData.title,
        total: reportData.totalAmount,
        categories: reportData.categories.map(cat => ({
          name: cat.name,
          amount: cat.amount
        }))
      };
      return mockApiCall(formattedData);
    }
    const response = await api.get(`/reports?range=${range}`);
    return response.data;
  },

  // 获取收入报表
  getIncomeReport: async (range = 'month') => {
    if (USE_MOCK_DATA) {
      // 模拟收入报表数据
      const formattedData = {
        title: `${range === 'month' ? '本月' : range === 'quarter' ? '本季度' : '本年度'}收入分类`,
        total: 10000,
        categories: [
          { name: '工资', amount: 8500 },
          { name: '投资', amount: 1000 },
          { name: '其他', amount: 500 }
        ]
      };
      return mockApiCall(formattedData);
    }
    const response = await api.get(`/reports?range=${range}&type=income`);
    return response.data;
  }
};

// 认证API
export const authApi = {
  // 用户登录
  login: async (credentials) => {
    if (USE_MOCK_DATA) {
      // 模拟登录验证
      const { username, password } = credentials;

      // 简单的模拟验证 - 演示用户
      const demoUsers = {
        'demo': { password: '123456', email: 'demo@example.com', displayName: '演示用户' },
        'admin': { password: 'admin', email: 'admin@example.com', displayName: '管理员' },
        'test': { password: 'test', email: 'test@example.com', displayName: '测试用户' }
      };

      if (username && password) {
        const user = demoUsers[username.toLowerCase()];
        if (user && user.password === password) {
          const userData = {
            username: username,
            email: user.email,
            displayName: user.displayName,
            loginTime: new Date().toISOString()
          };
          return mockApiCall(userData);
        } else {
          throw new Error('用户名或密码错误');
        }
      } else {
        throw new Error('请输入用户名和密码');
      }
    }
    const response = await api.post('/login', credentials);
    return response.data;
  },

  // 用户注册
  register: async (userData) => {
    if (USE_MOCK_DATA) {
      const { username, email, password } = userData;

      // 简单的模拟注册
      if (username && email && password) {
        const newUser = {
          username: username,
          email: email,
          registerTime: new Date().toISOString()
        };
        return mockApiCall(newUser);
      } else {
        throw new Error('请填写完整的注册信息');
      }
    }
    const response = await api.post('/register', userData);
    return response.data;
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    if (USE_MOCK_DATA) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        return mockApiCall(JSON.parse(storedUser));
      } else {
        throw new Error('用户未登录');
      }
    }
    const response = await api.get('/user/current');
    return response.data;
  }
};

// AI助手API
export const aiApi = {
  // 发送消息给AI助手
  sendMessage: async (message) => {
    if (USE_MOCK_DATA) {
      // 模拟AI响应逻辑
      const lowerMessage = message.toLowerCase();
      let aiResponse;

      if (lowerMessage.includes('花了') || lowerMessage.includes('买') || lowerMessage.includes('支出')) {
        const amountMatch = message.match(/(\d+)元?/);
        const amount = amountMatch ? parseFloat(amountMatch[1]) : 25.0;

        let category = '其他';
        if (lowerMessage.includes('午饭') || lowerMessage.includes('晚饭') || lowerMessage.includes('早饭')) category = '餐饮';
        else if (lowerMessage.includes('地铁') || lowerMessage.includes('公交') || lowerMessage.includes('打车')) category = '交通';
        else if (lowerMessage.includes('咖啡') || lowerMessage.includes('奶茶')) category = '餐饮';

        aiResponse = {
          intent: 'RECORD_TRANSACTION',
          response: `好的，我已经记录了这笔开支：\n💰 金额：${amount}元\n🍽 分类：${category}\n📅 时间：今天`,
          transaction_id: Date.now()
        };
      } else if (lowerMessage.includes('多少钱') || lowerMessage.includes('花了多少') || lowerMessage.includes('查询')) {
        aiResponse = {
          intent: 'QUERY_DATA',
          response: '本月您总共花费了2580.00元，主要支出为餐饮580元，交通320元。'
        };
      } else if (lowerMessage.includes('预算') || lowerMessage.includes('计划')) {
        aiResponse = {
          intent: 'SET_BUDGET',
          response: '已为您设置餐饮预算800元/月。',
          budget_id: Date.now()
        };
      } else {
        aiResponse = {
          intent: 'GENERAL',
          response: '我可以帮您记录开支、查询消费情况或设置预算。请告诉我您想要做什么，比如："今天买咖啡花了18元" 或 "这个月花了多少钱？"'
        };
      }

      return mockApiCall(aiResponse, 1000 + Math.random() * 1000);
    }
    const response = await api.post('/chat', { message });
    return response.data;
  }
};
