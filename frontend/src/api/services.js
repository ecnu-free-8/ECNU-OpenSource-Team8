import { api } from './client';
import { 
  mockFinancialSummary, 
  mockTransactions, 
  mockCategories, 
  mockBudgets, 
  mockReportData,
  mockApiCall 
} from '../data/mockData';

// 环境变量控制是否使用模拟数据
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA !== 'false';

// 财务摘要API
export const financialApi = {
  // 获取财务摘要
  getSummary: async () => {
    if (USE_MOCK_DATA) {
      return mockApiCall(mockFinancialSummary);
    }
    const response = await api.get('/financial/summary');
    return response.data;
  }
};

// 交易记录API
export const transactionApi = {
  // 获取交易列表
  getTransactions: async (params = {}) => {
    if (USE_MOCK_DATA) {
      let filteredTransactions = [...mockTransactions];
      
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
      
      return mockApiCall({
        transactions: filteredTransactions,
        total: filteredTransactions.length
      });
    }
    const response = await api.get('/transactions', params);
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
      return mockApiCall(mockBudgets);
    }
    const response = await api.get('/budgets');
    return response.data;
  },

  // 创建预算
  createBudget: async (budgetData) => {
    if (USE_MOCK_DATA) {
      const newBudget = {
        id: Date.now(),
        currentAmount: 0,
        ...budgetData
      };
      return mockApiCall(newBudget);
    }
    const response = await api.post('/budgets', budgetData);
    return response.data;
  },

  // 更新预算
  updateBudget: async (id, budgetData) => {
    if (USE_MOCK_DATA) {
      return mockApiCall({ id, ...budgetData });
    }
    const response = await api.put(`/budgets/${id}`, budgetData);
    return response.data;
  },

  // 删除预算
  deleteBudget: async (id) => {
    if (USE_MOCK_DATA) {
      return mockApiCall({ id, deleted: true });
    }
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  }
};

// 报表数据API
export const reportApi = {
  // 获取支出报表
  getExpenseReport: async (period = 'monthly') => {
    if (USE_MOCK_DATA) {
      return mockApiCall(mockReportData[period] || mockReportData.monthly);
    }
    const response = await api.get(`/reports/expense?period=${period}`);
    return response.data;
  },

  // 获取收入报表
  getIncomeReport: async (period = 'monthly') => {
    if (USE_MOCK_DATA) {
      // 模拟收入报表数据
      return mockApiCall({
        title: `${period === 'monthly' ? '本月' : period === 'quarterly' ? '本季度' : '本年度'}收入分类`,
        period,
        categories: [
          { name: '工资', amount: 8500, icon: '💼', color: '#059669', percentage: 85 },
          { name: '投资', amount: 1000, icon: '📈', color: '#0891b2', percentage: 10 },
          { name: '其他', amount: 500, icon: '💰', color: '#6b7280', percentage: 5 }
        ],
        totalAmount: 10000
      });
    }
    const response = await api.get(`/reports/income?period=${period}`);
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
        const amount = amountMatch ? amountMatch[1] : '25';
        
        let category = '其他';
        if (lowerMessage.includes('午饭') || lowerMessage.includes('晚饭') || lowerMessage.includes('早饭')) category = '餐饮';
        else if (lowerMessage.includes('地铁') || lowerMessage.includes('公交') || lowerMessage.includes('打车')) category = '交通';
        else if (lowerMessage.includes('咖啡') || lowerMessage.includes('奶茶')) category = '餐饮';
        
        aiResponse = {
          type: 'transaction_record',
          content: '好的，已记录这笔开支：',
          transaction: {
            amount: amount,
            category: category,
            description: lowerMessage.includes('午饭') ? '午饭' : lowerMessage.includes('咖啡') ? '咖啡' : '消费',
            time: '刚刚'
          }
        };
      } else if (lowerMessage.includes('多少钱') || lowerMessage.includes('花了多少') || lowerMessage.includes('查询')) {
        aiResponse = {
          type: 'query_response',
          content: '根据您的记录，本月您已经花费了 ¥2,580，主要支出在餐饮(¥580)和交通(¥320)方面。'
        };
      } else if (lowerMessage.includes('预算') || lowerMessage.includes('计划')) {
        aiResponse = {
          type: 'budget_response',
          content: '好的，我已经帮您设置了预算计划。您可以在"计划"页面查看和管理所有预算。'
        };
      } else {
        aiResponse = {
          type: 'general',
          content: '我可以帮您记录开支、查询消费情况或设置预算。请告诉我您想要做什么，比如："今天买咖啡花了18元" 或 "这个月花了多少钱？"'
        };
      }
      
      return mockApiCall(aiResponse, 1000 + Math.random() * 1000);
    }
    const response = await api.post('/ai/chat', { message });
    return response.data;
  }
};
