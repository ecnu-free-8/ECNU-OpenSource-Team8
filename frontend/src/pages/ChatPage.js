import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { useSendMessage } from '../hooks/useAI';

const ChatPage = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: '你好！我是智能记账助手，你可以直接告诉我开支情况，比如"今天午饭花了25元"，我会帮你记录。',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 使用AI hooks
  const sendMessageMutation = useSendMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 自动聚焦输入框
    inputRef.current?.focus();
  }, []);

  // 这个函数已经被新的API调用替代，保留作为备用
  // const simulateAIResponse = (userMessage) => { ... }

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const messageText = inputText;

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // 清空输入框
    setInputText('');

      // 添加"正在思考"的临时消息
    const thinkingMessage = {
      id: Date.now() + 0.5,
      type: 'ai',
      content: '正在思考中...',
      isThinking: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, thinkingMessage]);

    // 发送AI请求
    try {
      const response = await sendMessageMutation.mutateAsync(messageText);

      // 移除"正在思考"消息，添加实际回复
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isThinking);
        const aiData = response.data;
        const newMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: aiData.data || aiData.response || aiData,
          intent: aiData.intent,
          transaction_id: aiData.transaction_id,
          budget_id: aiData.budget_id,
          timestamp: new Date()
        };
        return [...filtered, newMessage];
      });
    } catch (error) {
      // 移除"正在思考"消息，显示错误消息
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isThinking);
        const errorMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: '抱歉，我现在无法处理您的请求，请稍后再试。',
          timestamp: new Date()
        };
        return [...filtered, errorMessage];
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const TransactionCard = ({ transaction }) => (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">💰</span>
          <span className="font-medium text-blue-900 dark:text-blue-100">
            金额：¥{transaction.amount}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-4 mt-2 text-sm text-blue-700 dark:text-blue-300">
        <div className="flex items-center space-x-1">
          <span>🏷</span>
          <span>分类：{transaction.category}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>⏰</span>
          <span>时间：{transaction.time}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <Bot className="w-6 h-6 text-blue-500" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">智能助手</h1>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-sm md:max-w-md lg:max-w-lg ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className={`px-4 py-2 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>

                {/* 根据意图类型显示不同的状态指示 */}
                {message.type === 'ai' && message.intent === 'RECORD_TRANSACTION' && message.transaction_id && (
                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-xs text-green-700 dark:text-green-300">
                      <p>✅ 交易已记录 (ID: {message.transaction_id})</p>
                    </div>
                  </div>
                )}

                {message.type === 'ai' && message.intent === 'SET_BUDGET' && message.budget_id && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-xs text-blue-700 dark:text-blue-300">
                      <p>🎯 预算已设置 (ID: {message.budget_id})</p>
                    </div>
                  </div>
                )}

                {/* 兼容旧的交易记录卡片 */}
                {message.transaction && (
                  <TransactionCard transaction={message.transaction} />
                )}
              </div>
              
              <div className={`flex items-center mt-1 space-x-2 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                {message.type === 'ai' && <Bot className="w-4 h-4 text-gray-400" />}
                {message.type === 'user' && <User className="w-4 h-4 text-gray-400" />}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {/* AI正在输入指示器 */}
        {sendMessageMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入你的开支或问题..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || sendMessageMutation.isPending}
            className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 rounded-full transition-colors duration-200"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
