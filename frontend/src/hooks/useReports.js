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
  return useQuery({
    queryKey: REPORT_QUERY_KEYS.expense(period),
    queryFn: () => reportApi.getExpenseReport(period),
    staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
    cacheTime: 15 * 60 * 1000, // 15分钟缓存时间
    refetchOnWindowFocus: false,
    retry: 2,
    select: (response) => response.data,
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
