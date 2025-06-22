import React from 'react';
import { LogOut, User, Mail, Calendar } from 'lucide-react';
import { useIsLoggedIn, useLogout } from '../hooks/useAuth';

const UserProfile = () => {
  const { isLoggedIn, user, isLoading } = useIsLoggedIn();
  const logout = useLogout();

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      logout();
      // 刷新页面回到登录状态
      window.location.reload();
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-gray-500 dark:text-gray-400">未登录</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">用户信息</h3>
      
      <div className="space-y-4">
        {/* 用户名 */}
        <div className="flex items-center space-x-3">
          <User className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">用户名</p>
            <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
          </div>
        </div>

        {/* 邮箱 */}
        {user.email && (
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">邮箱</p>
              <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
            </div>
          </div>
        )}

        {/* 注册时间 */}
        {user.registerTime && (
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">注册时间</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(user.registerTime).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
        )}

        {/* 登录时间 */}
        {user.loginTime && (
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">最后登录</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(user.loginTime).toLocaleString('zh-CN')}
              </p>
            </div>
          </div>
        )}
      </div>



      {/* 退出登录按钮 */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 py-2 px-4 rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>退出登录</span>
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
