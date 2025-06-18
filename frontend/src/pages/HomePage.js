import React from 'react';
import { TrendingDown, TrendingUp, Wallet, Loader2, AlertCircle } from 'lucide-react';
import { useFinancialSummary } from '../hooks/useFinancial';
import { useRecentTransactions } from '../hooks/useTransactions';

const HomePage = () => {
  // 使用hooks获取数据
  const {
    data: financialSummary,
    isLoading: isLoadingSummary,
    error: summaryError
  } = useFinancialSummary();

  const {
    data: recentTransactions,
    isLoading: isLoadingTransactions,
    error: transactionsError
  } = useRecentTransactions();

  const formatAmount = (amount) => {
    const absAmount = Math.abs(amount);
    return `¥${absAmount.toLocaleString()}`;
  };

  // 加载状态组件
  const LoadingCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      <span className="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
    </div>
  );

  // 错误状态组件
  const ErrorCard = ({ message }) => (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center">
      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
      <span className="text-red-700 dark:text-red-300">{message}</span>
    </div>
  );

  return (
    <div className="p-4 space-y-6">
      {/* 财务摘要卡片区域 */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">财务概览</h1>

        {/* 财务摘要卡片 */}
        {isLoadingSummary ? (
          <LoadingCard />
        ) : summaryError ? (
          <ErrorCard message="获取财务摘要失败" />
        ) : financialSummary ? (
          <>
            {/* 收支卡片 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 本月支出 */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">本月支出</span>
                </div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatAmount(financialSummary.monthlyExpense)}
                </p>
              </div>

              {/* 本月收入 */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">本月收入</span>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatAmount(financialSummary.monthlyIncome)}
                </p>
              </div>
            </div>

            {/* 本月结余 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Wallet className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">本月结余</span>
              </div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatAmount(financialSummary.monthlyBalance)}
              </p>
            </div>
          </>
        ) : null}
      </div>

      {/* 最近交易列表 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">最近交易</h2>

        {isLoadingTransactions ? (
          <LoadingCard />
        ) : transactionsError ? (
          <ErrorCard message="获取交易记录失败" />
        ) : recentTransactions && recentTransactions.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {transaction.description}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {transaction.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.amount > 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{formatAmount(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {transaction.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">暂无交易记录</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
