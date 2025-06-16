import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';

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
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

  const simulateAIResponse = (userMessage) => {
    setIsTyping(true);
    
    // 模拟AI处理时间
    setTimeout(() => {
      let aiResponse;
      
      // 简单的意图识别和响应生成
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('花了') || lowerMessage.includes('买') || lowerMessage.includes('支出')) {
        // 记录开支的响应
        const amountMatch = userMessage.match(/(\d+)元?/);
        const amount = amountMatch ? amountMatch[1] : '25';
        
        let category = '其他';
        if (lowerMessage.includes('午饭') || lowerMessage.includes('晚饭') || lowerMessage.includes('早饭') || lowerMessage.includes('餐') || lowerMessage.includes('吃')) {
          category = '餐饮';
        } else if (lowerMessage.includes('地铁') || lowerMessage.includes('公交') || lowerMessage.includes('打车') || lowerMessage.includes('交通')) {
          category = '交通';
        } else if (lowerMessage.includes('买') || lowerMessage.includes('购物')) {
          category = '购物';
        } else if (lowerMessage.includes('电影') || lowerMessage.includes('游戏') || lowerMessage.includes('娱乐')) {
          category = '娱乐';
        }

        aiResponse = {
          type: 'transaction_record',
          content: '好的，已记录这笔开支：',
          transaction: {
            amount: amount,
            category: category,
            description: userMessage.includes('午饭') ? '午饭' : userMessage.includes('咖啡') ? '咖啡' : '消费',
            time: '刚刚'
          }
        };
      } else if (lowerMessage.includes('多少钱') || lowerMessage.includes('花了多少') || lowerMessage.includes('查询')) {
        // 查询相关的响应
        aiResponse = {
          type: 'query_response',
          content: '根据您的记录，本月您已经花费了 ¥2,580，主要支出在餐饮(¥580)和交通(¥320)方面。'
        };
      } else if (lowerMessage.includes('预算') || lowerMessage.includes('计划')) {
        // 预算设置的响应
        aiResponse = {
          type: 'budget_response',
          content: '好的，我已经帮您设置了预算计划。您可以在"计划"页面查看和管理所有预算。'
        };
      } else {
        // 默认响应
        aiResponse = {
          type: 'general',
          content: '我可以帮您记录开支、查询消费情况或设置预算。请告诉我您想要做什么，比如："今天买咖啡花了18元" 或 "这个月花了多少钱？"'
        };
      }

      const newMessage = {
        id: Date.now(),
        type: 'ai',
        ...aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // 1-2秒的随机延迟
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // 模拟AI响应
    simulateAIResponse(inputText);
    
    // 清空输入框
    setInputText('');
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
            <div className={`max-w-xs lg:max-w-md ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className={`px-4 py-2 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                
                {/* 交易记录卡片 */}
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
        {isTyping && (
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
            disabled={!inputText.trim()}
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
