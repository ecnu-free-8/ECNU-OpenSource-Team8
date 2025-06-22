import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import ReportsPage from './pages/ReportsPage';
import PlansPage from './pages/PlansPage';
import ManagePage from './pages/ManagePage';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import BottomNav from './components/BottomNav';
import { useIsLoggedIn } from './hooks/useAuth';

function App() {
  const [activePage, setActivePage] = useState('home');
  const [isChatOpen, setChatOpen] = useState(false);

  // 检查登录状态
  const { isLoggedIn, isLoading } = useIsLoggedIn();

  // 登录成功回调
  const handleLoginSuccess = () => {
    // 登录成功后可以做一些初始化操作
    console.log('登录成功，欢迎使用智能记账应用！');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'reports':
        return <ReportsPage />;
      case 'plans':
        return <PlansPage />;
      case 'manage':
        return <ManagePage />;
      default:
        return <HomePage />;
    }
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="relative w-full h-full max-w-md md:max-w-lg lg:max-w-xl mx-auto bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  // 未登录状态显示登录页面
  // 注意：后端使用session管理登录状态，前端通过localStorage检查
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    // 移动端应用容器 - 在桌面端适当放宽，移动端全屏
    <div className="relative w-full h-full max-w-md md:max-w-lg lg:max-w-xl mx-auto bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      
      {/* 页面内容区域 */}
      <main className="flex-grow overflow-y-auto">
        {renderPage()}
      </main>

      {/* 底部导航栏 */}
      <BottomNav 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onAddClick={() => setChatOpen(true)}
      />

      {/* 智能助手模态框 */}
      {isChatOpen && <ChatPage onClose={() => setChatOpen(false)} />}
    </div>
  );
}

export default App;