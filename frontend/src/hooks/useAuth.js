import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/services';

// 查询键常量
export const AUTH_QUERY_KEYS = {
  currentUser: ['auth', 'currentUser'],
};

/**
 * 获取当前用户信息
 */
export const useCurrentUser = () => {
  const skipLogin = process.env.REACT_APP_SKIP_LOGIN === 'true';

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.currentUser,
    queryFn: () => {
      // 开发模式下跳过登录
      if (skipLogin) {
        return Promise.resolve({
          success: true,
          data: {
            username: 'demo_user',
            email: 'demo@example.com',
            loginTime: new Date().toISOString()
          }
        });
      }
      return authApi.getCurrentUser();
    },
    staleTime: 10 * 60 * 1000, // 10分钟内数据被认为是新鲜的
    cacheTime: 30 * 60 * 1000, // 30分钟缓存时间
    refetchOnWindowFocus: false,
    retry: false, // 认证失败不重试
    select: (response) => response.data,
  });
};

/**
 * 用户登录
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      const userData = response.data;
      
      // 存储用户信息到localStorage
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      
      // 更新查询缓存
      queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser, response);
      
      console.log('✅ 登录成功:', userData);
    },
    onError: (error) => {
      console.error('❌ 登录失败:', error);
    }
  });
};

/**
 * 用户注册
 */
export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      const userData = response.data;
      
      // 注册成功后自动登录
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      
      // 更新查询缓存
      queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser, response);
      
      console.log('✅ 注册成功:', userData);
    },
    onError: (error) => {
      console.error('❌ 注册失败:', error);
    }
  });
};

/**
 * 用户登出
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return () => {
    // 清除本地存储
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    
    // 清除查询缓存
    queryClient.removeQueries({
      queryKey: AUTH_QUERY_KEYS.currentUser
    });
    
    // 清除所有用户相关的缓存
    queryClient.clear();
    
    console.log('✅ 登出成功');
  };
};

/**
 * 检查用户是否已登录
 */
export const useIsLoggedIn = () => {
  const { data: currentUser, isLoading, error } = useCurrentUser();
  
  // 如果有用户数据且没有错误，则认为已登录
  const isLoggedIn = !!currentUser && !error;
  
  return {
    isLoggedIn,
    isLoading,
    user: currentUser
  };
};
