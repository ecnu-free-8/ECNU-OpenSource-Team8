import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionApi } from '../api/services';

// 查询键常量
export const TRANSACTION_QUERY_KEYS = {
  all: ['transactions'],
  list: (params) => ['transactions', 'list', params],
  detail: (id) => ['transactions', 'detail', id],
};

/**
 * 获取交易记录列表
 */
export const useTransactions = (params = {}) => {
  return useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.list(params),
    queryFn: () => transactionApi.getTransactions(params),
    staleTime: 2 * 60 * 1000, // 2分钟内数据被认为是新鲜的
    cacheTime: 5 * 60 * 1000, // 5分钟缓存时间
    refetchOnWindowFocus: false,
    retry: 2,
    select: (response) => response.data,
  });
};

/**
 * 创建交易记录
 */
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: transactionApi.createTransaction,
    onSuccess: (response) => {
      // 使所有交易列表查询失效，触发重新获取
      queryClient.invalidateQueries({
        queryKey: TRANSACTION_QUERY_KEYS.all
      });
      
      // 同时刷新财务摘要
      queryClient.invalidateQueries({
        queryKey: ['financial', 'summary']
      });
      
      console.log('✅ 交易记录创建成功:', response.data);
    },
    onError: (error) => {
      console.error('❌ 创建交易记录失败:', error);
    }
  });
};

/**
 * 更新交易记录
 */
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => transactionApi.updateTransaction(id, data),
    onSuccess: (response, variables) => {
      // 更新特定交易的缓存
      queryClient.setQueryData(
        TRANSACTION_QUERY_KEYS.detail(variables.id),
        response
      );
      
      // 使所有交易列表查询失效
      queryClient.invalidateQueries({
        queryKey: TRANSACTION_QUERY_KEYS.all
      });
      
      // 刷新财务摘要
      queryClient.invalidateQueries({
        queryKey: ['financial', 'summary']
      });
      
      console.log('✅ 交易记录更新成功:', response.data);
    },
    onError: (error) => {
      console.error('❌ 更新交易记录失败:', error);
    }
  });
};

/**
 * 删除交易记录
 */
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: transactionApi.deleteTransaction,
    onSuccess: (response, id) => {
      // 从缓存中移除特定交易
      queryClient.removeQueries({
        queryKey: TRANSACTION_QUERY_KEYS.detail(id)
      });
      
      // 使所有交易列表查询失效
      queryClient.invalidateQueries({
        queryKey: TRANSACTION_QUERY_KEYS.all
      });
      
      // 刷新财务摘要
      queryClient.invalidateQueries({
        queryKey: ['financial', 'summary']
      });
      
      console.log('✅ 交易记录删除成功:', id);
    },
    onError: (error) => {
      console.error('❌ 删除交易记录失败:', error);
    }
  });
};

/**
 * 获取最近交易记录（用于首页显示）
 */
export const useRecentTransactions = (limit = 6) => {
  return useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.list({ limit, sortBy: 'date', sortOrder: 'desc' }),
    queryFn: () => transactionApi.getTransactions({ 
      limit, 
      sortBy: 'date', 
      sortOrder: 'desc' 
    }),
    staleTime: 1 * 60 * 1000, // 1分钟内数据被认为是新鲜的
    cacheTime: 3 * 60 * 1000, // 3分钟缓存时间
    refetchOnWindowFocus: false,
    select: (response) => response.data.transactions || response.data,
  });
};
