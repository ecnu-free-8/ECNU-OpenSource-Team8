import { useQuery, useQueryClient } from '@tanstack/react-query';
import { financialApi } from '../api/services';

// 查询键常量
export const FINANCIAL_QUERY_KEYS = {
  summary: ['financial', 'summary'],
};

/**
 * 获取财务摘要数据
 */
export const useFinancialSummary = () => {
  return useQuery({
    queryKey: FINANCIAL_QUERY_KEYS.summary,
    queryFn: financialApi.getSummary,
    staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
    cacheTime: 10 * 60 * 1000, // 10分钟缓存时间
    refetchOnWindowFocus: false,
    retry: 2,
    select: (response) => {
      // 转换新API格式为组件期望的格式
      const data = response.data;
      return {
        monthlyExpense: data.expense,
        monthlyIncome: data.income,
        monthlyBalance: data.balance
      };
    },
  });
};

/**
 * 刷新财务摘要数据
 */
export const useRefreshFinancialSummary = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({
      queryKey: FINANCIAL_QUERY_KEYS.summary
    });
  };
};
