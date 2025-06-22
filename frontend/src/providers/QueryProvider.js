import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// 创建QueryClient实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 全局查询配置
      staleTime: 5 * 60 * 1000, // 5分钟
      cacheTime: 10 * 60 * 1000, // 10分钟
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        // 对于4xx错误不重试
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // 最多重试2次
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // 全局变更配置
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// 错误处理
queryClient.setMutationDefaults(['transaction', 'create'], {
  mutationFn: async (data) => {
    // 这里可以添加全局的变更前处理逻辑
    return data;
  },
});

// 全局错误处理
queryClient.setDefaultOptions({
  queries: {
    onError: (error) => {
      console.error('Query Error:', error);
      // 这里可以添加全局错误处理逻辑，比如显示toast
    },
  },
  mutations: {
    onError: (error) => {
      console.error('Mutation Error:', error);
      // 这里可以添加全局错误处理逻辑
    },
  },
});

/**
 * React Query Provider组件
 */
const QueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}

    </QueryClientProvider>
  );
};

export default QueryProvider;
