import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, User, Lock, Mail } from 'lucide-react';
import { useLogin, useRegister } from '../hooks/useAuth';

const LoginPage = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true); // true: 登录, false: 注册
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        // 登录
        await loginMutation.mutateAsync({
          username: formData.username,
          password: formData.password
        });
      } else {
        // 注册
        await registerMutation.mutateAsync({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
      }
      
      // 成功后调用回调
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error) {
      // 错误处理已在mutation中完成
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    // 使用与主应用相同的移动端容器样式
    <div className="relative w-full h-full max-w-md md:max-w-lg lg:max-w-xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Logo和标题 */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">💰</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              智能记账
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              {isLogin ? '欢迎回来' : '创建您的账户'}
            </p>
          </div>

          {/* 登录/注册表单 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            {/* 切换标签 */}
            <div className="flex mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-3 text-center font-medium rounded-md transition-colors duration-200 ${
                  isLogin
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                登录
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-3 text-center font-medium rounded-md transition-colors duration-200 ${
                  !isLogin
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                注册
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* 用户名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  用户名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="请输入用户名"
                  />
                </div>
              </div>

              {/* 邮箱（仅注册时显示） */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    邮箱
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="请输入邮箱地址"
                    />
                  </div>
                </div>
              )}

              {/* 密码 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-9 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="请输入密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {isLogin ? '登录中...' : '注册中...'}
                  </>
                ) : (
                  isLogin ? '登录' : '注册'
                )}
              </button>
            </form>

            {/* 错误信息 */}
            {(loginMutation.error || registerMutation.error) && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm">
                  {loginMutation.error?.message || registerMutation.error?.message}
                </p>
              </div>
            )}
          </div>

          {/* 演示用户提示 */}
          {process.env.NODE_ENV === 'development' && isLogin && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-700 dark:text-blue-300 text-xs">
                💡 演示账户: demo/123456 或 admin/admin
              </p>
            </div>
          )}

          {/* 底部提示 */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isLogin ? '还没有账户？' : '已有账户？'}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-500 hover:text-blue-600 font-medium ml-1"
              >
                {isLogin ? '立即注册' : '立即登录'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
