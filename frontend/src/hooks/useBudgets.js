import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetApi } from '../api/services';

// 查询键常量
export const BUDGET_QUERY_KEYS = {
  all: ['budgets'],
  list: ['budgets', 'list'],
  detail: (id) => ['budgets', 'detail', id],
};

/**
 * 获取预算列表
 */
export const useBudgets = () => {
  return useQuery({
    queryKey: BUDGET_QUERY_KEYS.list,
    queryFn: budgetApi.getBudgets,
    staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
    cacheTime: 15 * 60 * 1000, // 15分钟缓存时间
    refetchOnWindowFocus: false,
    retry: 2,
    select: (response) => {
      // 转换新API格式为组件期望的格式
      return response.data.map(budget => ({
        id: budget.id,
        name: budget.name,
        targetAmount: budget.target_amount,
        currentAmount: budget.current_amount,
        category: budget.category,
        icon: '💰', // 默认图标
        type: 'monthly' // 默认类型
      }));
    },
  });
};

/**
 * 创建预算
 */
export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: budgetApi.createBudget,
    onSuccess: (response) => {
      // 使所有预算查询失效，触发重新获取
      queryClient.invalidateQueries({
        queryKey: BUDGET_QUERY_KEYS.all
      });
      
      console.log('✅ 预算创建成功:', response.data);
    },
    onError: (error) => {
      console.error('❌ 创建预算失败:', error);
    }
  });
};

/**
 * 更新预算
 */
export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => budgetApi.updateBudget(id, data),
    onSuccess: (response, variables) => {
      // 更新特定预算的缓存
      queryClient.setQueryData(
        BUDGET_QUERY_KEYS.detail(variables.id),
        response
      );
      
      // 使所有预算查询失效
      queryClient.invalidateQueries({
        queryKey: BUDGET_QUERY_KEYS.all
      });
      
      console.log('✅ 预算更新成功:', response.data);
    },
    onError: (error) => {
      console.error('❌ 更新预算失败:', error);
    }
  });
};

/**
 * 删除预算
 */
export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: budgetApi.deleteBudget,
    onSuccess: (response, id) => {
      // 从缓存中移除特定预算
      queryClient.removeQueries({
        queryKey: BUDGET_QUERY_KEYS.detail(id)
      });
      
      // 使所有预算查询失效
      queryClient.invalidateQueries({
        queryKey: BUDGET_QUERY_KEYS.all
      });
      
      console.log('✅ 预算删除成功:', id);
    },
    onError: (error) => {
      console.error('❌ 删除预算失败:', error);
    }
  });
};
