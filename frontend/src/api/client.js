import axios from 'axios';

// API基础配置
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5123/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // 确保发送cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// 获取当前用户名
const getCurrentUsername = () => {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    try {
      const user = JSON.parse(currentUser);
      return user.username;
    } catch (e) {
      return null;
    }
  }
  return null;
};

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加请求时间戳
    config.metadata = { startTime: new Date() };

    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // 计算请求耗时
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);
    
    return response;
  },
  (error) => {
    const duration = error.config?.metadata ? 
      new Date() - error.config.metadata.startTime : 0;
    
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`, error);
    
    // 统一错误处理
    if (error.response?.status === 401) {
      // 只有在非登录/注册接口时才跳转
      const isAuthEndpoint = error.config?.url?.includes('/login') || error.config?.url?.includes('/register');
      if (!isAuthEndpoint) {
        // 未授权，清除token并跳转到登录页
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API方法封装
export const api = {
  // GET请求
  get: (url, config = {}) => {
    return apiClient.get(url, config);
  },
  
  // POST请求
  post: (url, data = {}) => {
    return apiClient.post(url, data);
  },
  
  // PUT请求
  put: (url, data = {}) => {
    return apiClient.put(url, data);
  },
  
  // DELETE请求
  delete: (url) => {
    return apiClient.delete(url);
  },
  
  // PATCH请求
  patch: (url, data = {}) => {
    return apiClient.patch(url, data);
  }
};

// 导出axios实例（用于特殊情况）
export default apiClient;
