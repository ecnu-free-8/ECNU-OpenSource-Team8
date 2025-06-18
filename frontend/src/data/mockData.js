// 模拟数据 - 将来替换为真实API

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 财务摘要模拟数据
export const mockFinancialSummary = {
  monthlyIncome: 8500,
  monthlyExpense: 2580,
  monthlyBalance: 5920,
  yearlyIncome: 102000,
  yearlyExpense: 30960
};

// 交易记录模拟数据
export const mockTransactions = [
  {
    id: 1,
    description: '午餐',
    amount: -25,
    category: '餐饮',
    date: '2025-06-18',
    time: '今天 12:30',
    type: 'expense',
    note: '公司附近的快餐'
  },
  {
    id: 2,
    description: '地铁',
    amount: -6,
    category: '交通',
    date: '2025-06-18',
    time: '今天 08:15',
    type: 'expense'
  },
  {
    id: 3,
    description: '工资',
    amount: 8500,
    category: '收入',
    date: '2025-06-01',
    time: '6月1日',
    type: 'income'
  },
  {
    id: 4,
    description: '咖啡',
    amount: -18,
    category: '餐饮',
    date: '2025-06-17',
    time: '昨天 15:20',
    type: 'expense'
  },
  {
    id: 5,
    description: '购物',
    amount: -234,
    category: '购物',
    date: '2025-06-17',
    time: '昨天 10:30',
    type: 'expense',
    note: '买了一件衬衫'
  },
  {
    id: 6,
    description: '电影票',
    amount: -45,
    category: '娱乐',
    date: '2025-06-16',
    time: '6月16日',
    type: 'expense'
  }
];

// 分类模拟数据
export const mockCategories = [
  { id: 1, name: '餐饮', icon: '🍽', color: '#ef4444', type: 'expense' },
  { id: 2, name: '交通', icon: '🚗', color: '#3b82f6', type: 'expense' },
  { id: 3, name: '购物', icon: '🛍', color: '#10b981', type: 'expense' },
  { id: 4, name: '娱乐', icon: '🎮', color: '#8b5cf6', type: 'expense' },
  { id: 5, name: '医疗', icon: '💊', color: '#ec4899', type: 'expense' },
  { id: 6, name: '其他', icon: '📦', color: '#6b7280', type: 'both' },
  { id: 7, name: '收入', icon: '💰', color: '#059669', type: 'income' }
];

// 预算计划模拟数据
export const mockBudgets = [
  {
    id: 1,
    name: '餐饮预算',
    category: '餐饮',
    currentAmount: 580,
    targetAmount: 800,
    icon: '🍽',
    type: 'monthly',
    startDate: '2025-06-01',
    endDate: '2025-06-30'
  },
  {
    id: 2,
    name: '交通预算',
    category: '交通',
    currentAmount: 320,
    targetAmount: 500,
    icon: '🚗',
    type: 'monthly',
    startDate: '2025-06-01',
    endDate: '2025-06-30'
  },
  {
    id: 3,
    name: '娱乐预算',
    category: '娱乐',
    currentAmount: 450,
    targetAmount: 400,
    icon: '🎮',
    type: 'monthly',
    startDate: '2025-06-01',
    endDate: '2025-06-30'
  },
  {
    id: 4,
    name: '购物预算',
    category: '购物',
    currentAmount: 234,
    targetAmount: 600,
    icon: '🛍',
    type: 'monthly',
    startDate: '2025-06-01',
    endDate: '2025-06-30'
  },
  {
    id: 5,
    name: '旅行储蓄',
    category: '储蓄',
    currentAmount: 2500,
    targetAmount: 10000,
    icon: '✈️',
    type: 'saving',
    startDate: '2025-01-01',
    endDate: '2025-12-31'
  }
];

// 报表数据模拟
export const mockReportData = {
  monthly: {
    title: '本月支出分类',
    period: 'monthly',
    categories: [
      { name: '餐饮', amount: 580, icon: '🍽', color: '#ef4444', percentage: 44.8 },
      { name: '交通', amount: 320, icon: '🚗', color: '#3b82f6', percentage: 24.7 },
      { name: '购物', amount: 234, icon: '🛍', color: '#10b981', percentage: 18.1 },
      { name: '娱乐', amount: 100, icon: '🎮', color: '#8b5cf6', percentage: 7.7 },
      { name: '医疗', amount: 80, icon: '💊', color: '#ec4899', percentage: 6.2 },
      { name: '其他', amount: 45, icon: '📦', color: '#6b7280', percentage: 3.5 }
    ],
    totalAmount: 1359
  },
  quarterly: {
    title: '本季度支出分类',
    period: 'quarterly',
    categories: [
      { name: '餐饮', amount: 1740, icon: '🍽', color: '#ef4444', percentage: 44.8 },
      { name: '交通', amount: 960, icon: '🚗', color: '#3b82f6', percentage: 24.7 },
      { name: '购物', amount: 702, icon: '🛍', color: '#10b981', percentage: 18.1 },
      { name: '娱乐', amount: 300, icon: '🎮', color: '#8b5cf6', percentage: 7.7 },
      { name: '医疗', amount: 240, icon: '💊', color: '#ec4899', percentage: 6.2 },
      { name: '其他', amount: 135, icon: '📦', color: '#6b7280', percentage: 3.5 }
    ],
    totalAmount: 4077
  },
  yearly: {
    title: '本年度支出分类',
    period: 'yearly',
    categories: [
      { name: '餐饮', amount: 6960, icon: '🍽', color: '#ef4444', percentage: 44.8 },
      { name: '交通', amount: 3840, icon: '🚗', color: '#3b82f6', percentage: 24.7 },
      { name: '购物', amount: 2808, icon: '🛍', color: '#10b981', percentage: 18.1 },
      { name: '娱乐', amount: 1200, icon: '🎮', color: '#8b5cf6', percentage: 7.7 },
      { name: '医疗', amount: 960, icon: '💊', color: '#ec4899', percentage: 6.2 },
      { name: '其他', amount: 540, icon: '📦', color: '#6b7280', percentage: 3.5 }
    ],
    totalAmount: 16308
  }
};

// 模拟API响应格式
export const createMockResponse = (data, success = true, message = '') => ({
  success,
  data,
  message,
  timestamp: new Date().toISOString()
});

// 模拟API调用
export const mockApiCall = async (data, delayMs = 500) => {
  await delay(delayMs);
  return createMockResponse(data);
};
