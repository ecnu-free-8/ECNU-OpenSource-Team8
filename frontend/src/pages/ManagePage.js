import React, { useState } from 'react';
import { Edit3, Tag, Plus, Trash2, Save, X, Loader2, AlertCircle } from 'lucide-react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';
import { useCreateTransaction } from '../hooks/useTransactions';

const ManagePage = () => {
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'categories'

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
  const [newCategory, setNewCategory] = useState({ name: '', icon: '', color: '#6b7280' });
  const [showAddCategory, setShowAddCategory] = useState(false);

  const tabs = [
    { id: 'manual', label: '手动记账', icon: Edit3 },
    { id: 'categories', label: '分类管理', icon: Tag }
  ];

  // 手动记账处理
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.amount || !manualForm.category || !manualForm.description) {
      alert('请填写所有必填字段');
      return;
    }

    try {
      // 调用API保存数据
      await createTransactionMutation.mutateAsync({
        amount: manualForm.type === 'expense' ? -parseFloat(manualForm.amount) : parseFloat(manualForm.amount),
        category: manualForm.category,
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
    if (!newCategory.name || !newCategory.icon) {
      alert('请填写分类名称和图标');
      return;
    }

    try {
      await createCategoryMutation.mutateAsync({
        ...newCategory,
        type: 'expense' // 默认为支出分类
      });

      setNewCategory({ name: '', icon: '', color: '#6b7280' });
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
      await updateCategoryMutation.mutateAsync({
        id: editingCategory.id,
        data: editingCategory
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
              )}
            </div>

            {/* 描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                描述 *
              </label>
              <input
                type="text"
                value={manualForm.description}
                onChange={(e) => setManualForm({...manualForm, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入描述"
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
                <input
                  type="text"
                  placeholder="分类名称"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="图标 (如: 🍽)"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                    <input
                      type="text"
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={editingCategory.icon}
                      onChange={(e) => setEditingCategory({...editingCategory, icon: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
    </div>
  );
};

export default ManagePage;
