import React from 'react';
import { Plus, Target, Loader2, AlertCircle } from 'lucide-react';
import { useBudgets } from '../hooks/useBudgets';

const PlansPage = () => {
  // 使用hooks获取预算数据
  const {
    data: budgets,
    isLoading,
    error
  } = useBudgets();

  const formatAmount = (amount) => {
    return `¥${amount.toLocaleString()}`;
  };

  const getUsagePercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressBarBgColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-100 dark:bg-red-900/20';
    if (percentage >= 70) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-green-100 dark:bg-green-900/20';
  };

  const getBudgetStatus = (current, target, type) => {
    const percentage = getUsagePercentage(current, target);
    
    if (type === 'saving') {
      if (percentage >= 100) return { text: '目标达成！', color: 'text-green-600 dark:text-green-400' };
      if (percentage >= 75) return { text: '即将达成', color: 'text-blue-600 dark:text-blue-400' };
      return { text: '储蓄中', color: 'text-gray-600 dark:text-gray-400' };
    } else {
      if (percentage >= 100) return { text: '预算超支', color: 'text-red-600 dark:text-red-400' };
      if (percentage >= 90) return { text: '预算紧张', color: 'text-orange-600 dark:text-orange-400' };
      if (percentage >= 70) return { text: '使用较多', color: 'text-yellow-600 dark:text-yellow-400' };
      return { text: '预算充足', color: 'text-green-600 dark:text-green-400' };
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">预算计划</h1>
        <Target className="w-6 h-6 text-blue-500" />
      </div>

      {/* 预算卡片列表 */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
          <span className="text-gray-600 dark:text-gray-400">加载预算数据...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700 dark:text-red-300">获取预算数据失败</span>
        </div>
      ) : budgets && budgets.length > 0 ? (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const percentage = getUsagePercentage(budget.currentAmount, budget.targetAmount);
            const status = getBudgetStatus(budget.currentAmount, budget.targetAmount, budget.type);

            return (
              <div
                key={budget.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4"
              >
              {/* 预算标题和图标 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{budget.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {budget.name}
                    </h3>
                    <p className={`text-sm ${status.color}`}>
                      {status.text}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {budget.type === 'saving' ? '已储蓄' : '已使用'}
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* 金额显示 */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {formatAmount(budget.currentAmount)}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {formatAmount(budget.targetAmount)}
                </span>
              </div>

              {/* 进度条 */}
              <div className="space-y-2">
                <div className={`w-full h-3 rounded-full ${getProgressBarBgColor(percentage)}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor(percentage)}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                
                {/* 剩余金额或超支提示 */}
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {budget.type === 'saving' 
                      ? `还需储蓄 ${formatAmount(Math.max(0, budget.targetAmount - budget.currentAmount))}`
                      : budget.currentAmount > budget.targetAmount
                        ? `超支 ${formatAmount(budget.currentAmount - budget.targetAmount)}`
                        : `剩余 ${formatAmount(budget.targetAmount - budget.currentAmount)}`
                    }
                  </span>
                  <span>
                    {budget.type === 'monthly' ? '本月' : '目标'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">暂无预算计划</p>
        </div>
      )}

      {/* 添加新预算按钮 */}
      <button className="w-full bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-6 flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200">
        <Plus className="w-5 h-5" />
        <span className="font-medium">添加新预算</span>
      </button>
    </div>
  );
};

export default PlansPage;
