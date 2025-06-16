import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const ReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  // Mock data for different time periods
  const reportData = {
    monthly: {
      title: '本月支出分类',
      categories: [
        { name: '餐饮', amount: 580, icon: '🍽', color: '#ef4444' },
        { name: '交通', amount: 320, icon: '🚗', color: '#3b82f6' },
        { name: '购物', amount: 234, icon: '🛍', color: '#10b981' },
        { name: '娱乐', amount: 100, icon: '🎮', color: '#8b5cf6' },
        { name: '医疗', amount: 80, icon: '💊', color: '#ec4899' },
        { name: '其他', amount: 45, icon: '📦', color: '#6b7280' }
      ]
    },
    quarterly: {
      title: '本季度支出分类',
      categories: [
        { name: '餐饮', amount: 1740, icon: '🍽', color: '#ef4444' },
        { name: '交通', amount: 960, icon: '🚗', color: '#3b82f6' },
        { name: '购物', amount: 702, icon: '🛍', color: '#10b981' },
        { name: '娱乐', amount: 300, icon: '🎮', color: '#8b5cf6' },
        { name: '医疗', amount: 240, icon: '💊', color: '#ec4899' },
        { name: '其他', amount: 135, icon: '📦', color: '#6b7280' }
      ]
    },
    yearly: {
      title: '本年度支出分类',
      categories: [
        { name: '餐饮', amount: 6960, icon: '🍽', color: '#ef4444' },
        { name: '交通', amount: 3840, icon: '🚗', color: '#3b82f6' },
        { name: '购物', amount: 2808, icon: '🛍', color: '#10b981' },
        { name: '娱乐', amount: 1200, icon: '🎮', color: '#8b5cf6' },
        { name: '医疗', amount: 960, icon: '💊', color: '#ec4899' },
        { name: '其他', amount: 540, icon: '📦', color: '#6b7280' }
      ]
    }
  };

  const currentData = reportData[selectedPeriod];
  const totalAmount = currentData.categories.reduce((sum, cat) => sum + cat.amount, 0);

  const formatAmount = (amount) => {
    return `¥${amount.toLocaleString()}`;
  };

  const getPercentage = (amount) => {
    return ((amount / totalAmount) * 100).toFixed(1);
  };

  const periods = [
    { id: 'monthly', label: '月度' },
    { id: 'quarterly', label: '季度' },
    { id: 'yearly', label: '年度' }
  ];

  // 自定义Tooltip组件
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
          <p className="font-medium text-gray-900 dark:text-white">
            {data.payload.icon} {data.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            金额: ¥{data.value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            占比: {((data.value / totalAmount) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // 自定义Label组件
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // 小于5%不显示标签

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="p-4 space-y-6">
      {/* 页面标题 */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">支出报表</h1>

      {/* 时间范围选择器 */}
      <div className="flex space-x-2">
        {periods.map((period) => (
          <button
            key={period.id}
            onClick={() => setSelectedPeriod(period.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              selectedPeriod === period.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* 图表区域 - 饼图占位符 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 text-center">
          {currentData.title}
        </h3>

        {/* 专业饼图 */}
        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={currentData.categories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={50}
                fill="#8884d8"
                dataKey="amount"
              >
                {currentData.categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 总金额显示 */}
        <div className="text-center mb-2">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatAmount(totalAmount)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">总支出</p>
        </div>
      </div>

      {/* 分类明细列表 */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">分类明细</h3>
        
        <div className="space-y-2">
          {currentData.categories.map((category, index) => (
            <div
              key={category.name}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getPercentage(category.amount)}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatAmount(category.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
