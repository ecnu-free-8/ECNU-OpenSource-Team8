import React, { useState } from 'react';
import { Plus, Target, Loader2, AlertCircle, X, Save } from 'lucide-react';
import { useBudgets, useCreateBudget } from '../hooks/useBudgets';
import { useCategories } from '../hooks/useCategories';

const PlansPage = () => {
  // 状态管理
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newBudget, setNewBudget] = useState({
    name: '',
    target_amount: '',
    category: '',
    type: 'expense' // expense 或 saving
  });

  // 使用hooks获取预算数据
  const {
    data: budgets,
    isLoading,
    error
  } = useBudgets();

  // 使用hooks获取分类数据
  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: categoriesError
  } = useCategories();

  // 创建预算的mutation
  const createBudgetMutation = useCreateBudget();

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

  // 处理添加新预算
  const handleAddBudget = async () => {
    // 验证必填字段
    if (!newBudget.name || !newBudget.target_amount) {
      alert('请填写预算名称和金额');
      return;
    }

    // 支出预算需要选择分类，储蓄目标不需要
    if (newBudget.type === 'expense' && !newBudget.category) {
      alert('请选择预算分类');
      return;
    }

    if (isNaN(newBudget.target_amount) || parseFloat(newBudget.target_amount) <= 0) {
      alert('请输入有效的金额');
      return;
    }

    try {
      await createBudgetMutation.mutateAsync({
        name: newBudget.name,
        target_amount: parseFloat(newBudget.target_amount),
        category: newBudget.type === 'saving' ? '储蓄' : newBudget.category,
        type: newBudget.type
      });

      // 重置表单
      setNewBudget({
        name: '',
        target_amount: '',
        category: '',
        type: 'expense'
      });
      setShowAddBudget(false);
    } catch (error) {
      alert('创建预算失败，请重试');
    }
  };

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBudget(prev => ({
      ...prev,
      [name]: value
    }));
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
      <button
        onClick={() => setShowAddBudget(true)}
        className="w-full bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-6 flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">添加新预算</span>
      </button>

      {/* 添加预算模态框 */}
      {showAddBudget && (
        <div className="absolute inset-0 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl animate-in fade-in zoom-in-95 duration-300">


            {/* 模态框头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">添加新预算</h3>
              <button
                onClick={() => setShowAddBudget(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* 模态框内容 */}
            <div className="p-6 space-y-6">
              {/* 预算名称 */}
              <div>
                <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
                  预算名称
                </label>
                <input
                  type="text"
                  name="name"
                  value={newBudget.name}
                  onChange={handleInputChange}
                  placeholder="例如：月度餐饮预算"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                />
              </div>

              {/* 预算类型 */}
              <div>
                <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
                  预算类型
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewBudget(prev => ({ ...prev, type: 'expense' }))}
                    className={`p-4 rounded-lg border-2 transition-colors duration-200 ${
                      newBudget.type === 'expense'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <span className="text-3xl block mb-2">💸</span>
                      <span className="text-base font-medium">支出预算</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewBudget(prev => ({ ...prev, type: 'saving' }))}
                    className={`p-4 rounded-lg border-2 transition-colors duration-200 ${
                      newBudget.type === 'saving'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <span className="text-3xl block mb-2">💰</span>
                      <span className="text-base font-medium">储蓄目标</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 分类选择 - 仅在支出预算时显示 */}
              {newBudget.type === 'expense' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    分类
                  </label>
                  {isLoadingCategories ? (
                    <div className="flex items-center justify-center py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-gray-500 dark:text-gray-400">加载分类...</span>
                    </div>
                  ) : categoriesError ? (
                    <div className="flex items-center py-2 px-3 border border-red-300 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-red-700 dark:text-red-300">加载分类失败</span>
                    </div>
                  ) : (
                    <select
                      name="category"
                      value={newBudget.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">请选择分类</option>
                      {categories?.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* 目标金额 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {newBudget.type === 'saving' ? '储蓄目标' : '预算金额'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">¥</span>
                  <input
                    type="number"
                    name="target_amount"
                    value={newBudget.target_amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* 模态框底部 */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAddBudget(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                取消
              </button>
              <button
                onClick={handleAddBudget}
                disabled={createBudgetMutation.isPending}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                {createBudgetMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>创建中...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>创建预算</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansPage;
