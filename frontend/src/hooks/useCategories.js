import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../api/services';

// 查询键常量
export const CATEGORY_QUERY_KEYS = {
  all: ['categories'],
  list: ['categories', 'list'],
  detail: (id) => ['categories', 'detail', id],
};

/**
 * 获取分类列表
 */
export const useCategories = () => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.list,
    queryFn: categoryApi.getCategories,
    staleTime: 10 * 60 * 1000, // 10分钟内数据被认为是新鲜的
    cacheTime: 30 * 60 * 1000, // 30分钟缓存时间
    refetchOnWindowFocus: false,
    retry: 2,
    select: (response) => response.data,
  });
};

/**
 * 获取支出分类
 */
export const useExpenseCategories = () => {
  return useQuery({
    queryKey: [...CATEGORY_QUERY_KEYS.list, 'expense'],
    queryFn: categoryApi.getCategories,
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (response) => {
      const categories = response.data;
      return categories.filter(cat => cat.type === 'expense' || cat.type === 'both');
    },
  });
};

/**
 * 获取收入分类
 */
export const useIncomeCategories = () => {
  return useQuery({
    queryKey: [...CATEGORY_QUERY_KEYS.list, 'income'],
    queryFn: categoryApi.getCategories,
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (response) => {
      const categories = response.data;
      return categories.filter(cat => cat.type === 'income' || cat.type === 'both');
    },
  });
};

/**
 * 创建分类
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: categoryApi.createCategory,
    onSuccess: (response) => {
      // 使所有分类查询失效，触发重新获取
      queryClient.invalidateQueries({
        queryKey: CATEGORY_QUERY_KEYS.all
      });
      
      console.log('✅ 分类创建成功:', response.data);
    },
    onError: (error) => {
      console.error('❌ 创建分类失败:', error);
    }
  });
};

/**
 * 更新分类
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => categoryApi.updateCategory(id, data),
    onSuccess: (response, variables) => {
      // 更新特定分类的缓存
      queryClient.setQueryData(
        CATEGORY_QUERY_KEYS.detail(variables.id),
        response
      );
      
      // 使所有分类查询失效
      queryClient.invalidateQueries({
        queryKey: CATEGORY_QUERY_KEYS.all
      });
      
      console.log('✅ 分类更新成功:', response.data);
    },
    onError: (error) => {
      console.error('❌ 更新分类失败:', error);
    }
  });
};

/**
 * 删除分类
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: categoryApi.deleteCategory,
    onSuccess: (response, id) => {
      // 从缓存中移除特定分类
      queryClient.removeQueries({
        queryKey: CATEGORY_QUERY_KEYS.detail(id)
      });
      
      // 使所有分类查询失效
      queryClient.invalidateQueries({
        queryKey: CATEGORY_QUERY_KEYS.all
      });
      
      console.log('✅ 分类删除成功:', id);
    },
    onError: (error) => {
      console.error('❌ 删除分类失败:', error);
    }
  });
};
