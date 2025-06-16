import { Home, BarChart3, Plus, Target, Cog } from 'lucide-react';

const BottomNav = ({ activePage, setActivePage, onAddClick }) => {
  const navItems = [
    { id: 'home', label: '主页', icon: Home },
    { id: 'reports', label: '报表', icon: BarChart3 },
    { id: 'add', label: '智能助手', icon: Plus, isSpecial: true },
    { id: 'plans', label: '计划', icon: Target },
    { id: 'manage', label: '管理', icon: Cog },
  ];

  const handleNavClick = (item) => {
    if (item.id === 'add') {
      onAddClick();
    } else {
      setActivePage(item.id);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          if (item.isSpecial) {
            // 特殊的中央添加按钮
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className="flex flex-col items-center justify-center w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Icon className="w-6 h-6 text-white" />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-0 transition-colors duration-200 ${
                isActive
                  ? 'text-blue-500 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-blue-500 dark:text-blue-400' : ''}`} />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
