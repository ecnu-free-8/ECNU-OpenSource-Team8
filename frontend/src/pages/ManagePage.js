import React, { useState } from 'react';
import { Edit3, Tag, Plus, Trash2, Save, X, Loader2, AlertCircle, User } from 'lucide-react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';
import { useCreateTransaction } from '../hooks/useTransactions';
import UserProfile from '../components/UserProfile';

const ManagePage = () => {
  const [activeTab, setActiveTab] = useState('manual'); // 'manual', 'categories', or 'profile'

  // 使用hooks获取分类数据
  const { data: categories, isLoading: isLoadingCategories, error: categoriesError } = useCategories();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const createTransactionMutation = useCreateTransaction();
  
  // 手动记账表单状态
  const [manualForm, setManualForm] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense' // 'expense' or 'income'
  });

  // 分类管理状态
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#6b7280' });
  const [showAddCategory, setShowAddCategory] = useState(false);

  // 默认图标映射 - 根据分类名称自动分配图标
  const getDefaultIcon = (categoryName) => {
    const iconMap = {
      '餐饮': '🍽️',
      '交通': '🚗',
      '购物': '🛍️',
      '娱乐': '🎮',
      '医疗': '💊',
      '教育': '📚',
      '住房': '🏠',
      '储蓄': '💰',
      '工资': '💼',
      '投资': '📈',
      '礼品': '🎁',
      '旅行': '✈️',
      '运动': '⚽',
      '美容': '💄',
      '宠物': '🐕',
      '通讯': '📱',
      '水电': '💡',
      '保险': '🛡️',
      '其他': '📦'
    };

    // 如果找到匹配的图标就返回，否则返回默认图标
    return iconMap[categoryName] || '📦';
  };

  const tabs = [
    { id: 'manual', label: '记账', icon: Edit3 },
    { id: 'categories', label: '分类', icon: Tag },
    { id: 'profile', label: '用户', icon: User }
  ];

  // 手动记账处理
  // 分类映射函数 - 将用户输入的分类映射到标准分类
  const mapCategory = (inputCategory) => {
    const categoryMap = {
      '游戏': '娱乐',
      '打游戏': '娱乐',
      '电子游戏': '娱乐',
      '手游': '娱乐',
      '网游': '娱乐'
    };
    return categoryMap[inputCategory] || inputCategory;
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.amount || !manualForm.category) {
      alert('请填写所有必填字段');
      return;
    }

    try {
      // 映射分类
      const mappedCategory = mapCategory(manualForm.category);
      console.log(`[DEBUG] 分类映射: ${manualForm.category} -> ${mappedCategory}`);
      
      // 调用API保存数据
      await createTransactionMutation.mutateAsync({
        amount: manualForm.type === 'expense' ? -parseFloat(manualForm.amount) : parseFloat(manualForm.amount),
        category: mappedCategory,
        description: manualForm.description,
        date: manualForm.date,
        type: manualForm.type
      });

      alert('记账成功！');

      // 重置表单
      setManualForm({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        type: 'expense'
      });
    } catch (error) {
      alert('记账失败，请重试');
    }
  };

  // 分类管理处理
  const handleAddCategory = async () => {
    if (!newCategory.name) {
      alert('请填写分类名称');
      return;
    }

    try {
      // 后端只需要name字段，其他字段由后端或前端处理
      await createCategoryMutation.mutateAsync({
        name: newCategory.name
      });

      setNewCategory({ name: '', color: '#6b7280' });
      setShowAddCategory(false);
    } catch (error) {
      alert('创建分类失败，请重试');
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory({ ...category });
  };

  const handleSaveCategory = async () => {
    try {
      // 自动更新图标
      const updatedCategory = {
        ...editingCategory,
        icon: getDefaultIcon(editingCategory.name)
      };

      await updateCategoryMutation.mutateAsync({
        id: editingCategory.id,
        data: updatedCategory
      });
      setEditingCategory(null);
    } catch (error) {
      alert('更新分类失败，请重试');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('确定要删除这个分类吗？')) {
      try {
        await deleteCategoryMutation.mutateAsync(id);
      } catch (error) {
        alert('删除分类失败，请重试');
      }
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* 页面标题 */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">管理</h1>

      {/* 标签切换 */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 手动记账表单 */}
      {activeTab === 'manual' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">手动记账</h2>
          
          <form onSubmit={handleManualSubmit} className="space-y-4">
            {/* 收支类型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                类型
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="expense"
                    checked={manualForm.type === 'expense'}
                    onChange={(e) => setManualForm({...manualForm, type: e.target.value})}
                    className="mr-2"
                  />
                  <span className="text-red-600 dark:text-red-400">支出</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="income"
                    checked={manualForm.type === 'income'}
                    onChange={(e) => setManualForm({...manualForm, type: e.target.value})}
                    className="mr-2"
                  />
                  <span className="text-green-600 dark:text-green-400">收入</span>
                </label>
              </div>
            </div>

            {/* 金额 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                金额 *
              </label>
              <input
                type="number"
                step="0.01"
                value={manualForm.amount}
                onChange={(e) => setManualForm({...manualForm, amount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入金额"
              />
            </div>

            {/* 分类 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                分类 *
              </label>
              {isLoadingCategories ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>加载分类...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={manualForm.category}
                    onChange={(e) => setManualForm({...manualForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">请选择分类</option>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={manualForm.category}
                    onChange={(e) => setManualForm({...manualForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="或手动输入分类（如：游戏）"
                  />
                </div>
              )}
            </div>

            {/* 描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                描述
              </label>
              <input
                type="text"
                value={manualForm.description}
                onChange={(e) => setManualForm({...manualForm, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入描述（可选）"
              />
            </div>

            {/* 日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                日期
              </label>
              <input
                type="date"
                value={manualForm.date}
                onChange={(e) => setManualForm({...manualForm, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={createTransactionMutation.isPending}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {createTransactionMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  保存中...
                </>
              ) : (
                '保存记录'
              )}
            </button>
          </form>
        </div>
      )}

      {/* 分类管理 */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          {/* 添加新分类按钮 */}
          <button
            onClick={() => setShowAddCategory(true)}
            className="w-full bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-4 flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">添加新分类</span>
          </button>

          {/* 添加分类表单 */}
          {showAddCategory && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">添加新分类</h3>
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="分类名称"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {newCategory.name && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>预览图标:</span>
                      <span className="text-lg">{getDefaultIcon(newCategory.name)}</span>
                      <span>{newCategory.name}</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddCategory}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setShowAddCategory(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 分类列表 */}
          {isLoadingCategories ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
              <span className="text-gray-600 dark:text-gray-400">加载分类...</span>
            </div>
          ) : categoriesError ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 dark:text-red-300">获取分类失败</span>
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="space-y-2">
              {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                {editingCategory && editingCategory.id === category.id ? (
                  // 编辑模式
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {editingCategory.name && (
                        <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>预览图标:</span>
                          <span className="text-lg">{getDefaultIcon(editingCategory.name)}</span>
                          <span>{editingCategory.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveCategory}
                        className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md transition-colors duration-200"
                      >
                        <Save className="w-4 h-4" />
                        <span>保存</span>
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="flex items-center space-x-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                        <span>取消</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  // 显示模式
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{category.icon}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors duration-200"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">暂无分类</p>
            </div>
          )}
        </div>
      )}

      {/* 用户信息 */}
      {activeTab === 'profile' && (
        <UserProfile />
      )}
    </div>
  );
};

export default ManagePage;
