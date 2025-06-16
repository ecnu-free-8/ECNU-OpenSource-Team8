import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import ReportsPage from './pages/ReportsPage';
import PlansPage from './pages/PlansPage';
import ManagePage from './pages/ManagePage';
import ChatPage from './pages/ChatPage';
import BottomNav from './components/BottomNav';

function App() {
  const [activePage, setActivePage] = useState('home');
  const [isChatOpen, setChatOpen] = useState(false);

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

  return (
    // 移动端应用容器 - 占满整个浏览器窗口
    <div className="relative w-full h-full max-w-sm mx-auto bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      
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