import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api/services';

// 查询键常量
export const REPORT_QUERY_KEYS = {
  all: ['reports'],
  expense: (period) => ['reports', 'expense', period],
  income: (period) => ['reports', 'income', period],
};

/**
 * 获取支出报表
 */
export const useExpenseReport = (period = 'monthly') => {
  // 转换period格式
  const rangeMap = {
    'monthly': 'month',
    'quarterly': 'quarter',
    'yearly': 'year'
  };
  const range = rangeMap[period] || 'month';

  return useQuery({
    queryKey: REPORT_QUERY_KEYS.expense(period),
    queryFn: () => reportApi.getExpenseReport(range),
    staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
    cacheTime: 15 * 60 * 1000, // 15分钟缓存时间
    refetchOnWindowFocus: false,
    retry: 2,
    select: (response) => {
      // 转换新API格式为组件期望的格式
      const data = response.data;
      return {
        title: data.title,
        totalAmount: data.total,
        categories: data.categories.map((cat, index) => ({
          ...cat,
          icon: ['🍽', '🚗', '🛍', '🎮', '💊', '📦'][index] || '📦',
          color: ['#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#6b7280'][index] || '#6b7280',
          percentage: data.total > 0 ? ((cat.amount / data.total) * 100).toFixed(1) : 0
        }))
      };
    },
    enabled: !!period, // 只有当period存在时才执行查询
  });
};

/**
 * 获取收入报表
 */
export const useIncomeReport = (period = 'monthly') => {
  return useQuery({
    queryKey: REPORT_QUERY_KEYS.income(period),
    queryFn: () => reportApi.getIncomeReport(period),
    staleTime: 5 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    select: (response) => response.data,
    enabled: !!period,
  });
};
