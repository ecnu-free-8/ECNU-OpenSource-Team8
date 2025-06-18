import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../api/services';

/**
 * AI助手消息发送
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: aiApi.sendMessage,
    onSuccess: (response, message) => {
      console.log('✅ AI消息发送成功:', { message, response: response.data });
      
      // 如果AI响应包含交易记录，刷新相关数据
      if (response.data.type === 'transaction_record') {
        // 刷新交易列表
        queryClient.invalidateQueries({
          queryKey: ['transactions']
        });
        
        // 刷新财务摘要
        queryClient.invalidateQueries({
          queryKey: ['financial', 'summary']
        });
        
        // 刷新预算数据
        queryClient.invalidateQueries({
          queryKey: ['budgets']
        });
      }
    },
    onError: (error) => {
      console.error('❌ AI消息发送失败:', error);
    }
  });
};
