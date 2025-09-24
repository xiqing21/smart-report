import { embeddingService } from './embeddingService';
import { contextService } from './contextService';
import { supabase } from '../../lib/supabase';
import { mockChatCompletion, isBrowserEnvironment } from './mockAIService';
import type { ConversationContext, ContextMessage } from './contextService';

// 在浏览器环境中使用模拟服务，在服务器环境中使用真实API
let zhipuClient: any = null;

if (!isBrowserEnvironment()) {
  // 只在服务器环境中导入智谱AI SDK
  try {
    const { ZhipuAI } = require('zhipuai');
    zhipuClient = new ZhipuAI({
      apiKey: process.env.VITE_ZHIPU_API_KEY || ''
    });
  } catch (error) {
    console.warn('ZhipuAI SDK not available in browser environment');
  }
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sources?: {
    document_id: string;
    document_name: string;
    content: string;
    similarity: number;
  }[];
}

class ChatService {
  private apiKey: string;
  private model: string = 'glm-4';
  private maxRetrievalResults: number = 5;

  constructor() {
    // 从环境变量获取智谱AI API密钥
    this.apiKey = import.meta.env.VITE_ZHIPU_API_KEY || '';
    if (!this.apiKey) {
      console.warn('智谱AI API密钥未配置，请在环境变量中设置 VITE_ZHIPU_API_KEY');
    }
  }

  /**
   * 调用智谱AI聊天API（带上下文支持）
   */
  private async callChatAPI(
    messages: { role: string; content: string }[],
    contextId?: string
  ): Promise<string> {
    try {
      let contextMessages: ContextMessage[] = [];
      
      // 如果提供了上下文ID，获取历史对话
      if (contextId) {
        const context = await contextService.getContext(contextId);
        if (context) {
          contextMessages = contextService.getContextMessages(context);
        }
      }

      // 构建完整的对话消息
      const chatMessages = [
        // 添加历史上下文消息
        ...contextMessages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        })),
        // 添加当前消息
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        }))
      ];

      let response: any;
      if (isBrowserEnvironment() || !zhipuClient) {
        // 浏览器环境使用模拟服务
        response = await mockChatCompletion(chatMessages);
      } else {
        // 服务器环境使用真实API
        response = await zhipuClient.chat.completions.create({
          model: this.model,
          messages: chatMessages,
          temperature: 0.7,
          max_tokens: 2000,
        });
      }

      const responseContent = response.choices?.[0]?.message?.content || '抱歉，我无法生成回答。';

      // 如果有上下文ID，保存对话到上下文
      if (contextId) {
        // 保存用户消息
        for (const msg of messages) {
          if (msg.role === 'user') {
            await contextService.addMessage(contextId, msg.role, msg.content);
          }
        }
        // 保存助手回复
        await contextService.addMessage(contextId, 'assistant', responseContent);
      }

      return responseContent;
    } catch (error) {
      console.error('调用智谱AI聊天API失败:', error);
      throw error;
    }
  }

  /**
   * 创建新对话（使用上下文服务）
   */
  async createConversation(userId?: string, title?: string): Promise<ConversationContext> {
    try {
      const context = await contextService.createContext(userId, title);
      return {
        id: context.id,
        messages: [],
        userId: context.userId,
        title: context.title,
        createdAt: context.createdAt,
        updatedAt: context.updatedAt
      };
    } catch (error) {
      console.error('创建对话失败:', error);
      throw error;
    }
  }

  /**
   * 获取对话历史（使用上下文服务）
   */
  async getConversation(conversationId: string): Promise<ConversationContext | null> {
    try {
      const context = await contextService.getContext(conversationId);
      if (!context) {
        return null;
      }

      // 转换上下文消息格式为ChatMessage格式
      const messages = context.messages
        .filter(msg => msg.role !== 'system' || msg.metadata?.type !== 'summary')
        .map(msg => ({
          id: `msg_${msg.timestamp.getTime()}`,
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
          timestamp: msg.timestamp
        }));

      return {
        id: context.id,
        messages,
        userId: context.userId,
        title: context.title,
        createdAt: context.createdAt,
        updatedAt: context.updatedAt
      };
    } catch (error) {
      console.error('获取对话失败:', error);
      return null;
    }
  }

  /**
   * 获取用户的对话列表（使用上下文服务）
   */
  async getUserConversations(userId: string, limit: number = 20): Promise<ConversationContext[]> {
    try {
      const contexts = await contextService.getUserContexts(userId, limit);
      
      return contexts.map(context => ({
        id: context.id,
        messages: context.messages.map(msg => ({
          id: `msg_${msg.timestamp.getTime()}`,
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
          timestamp: msg.timestamp
        })),
        userId: context.userId,
        title: context.title,
        createdAt: context.createdAt,
        updatedAt: context.updatedAt
      }));
    } catch (error) {
      console.error('获取用户对话列表失败:', error);
      return [];
    }
  }

  /**
   * 构建RAG提示词
   */
  private buildRAGPrompt(query: string, context: string): string {
    return `你是一个智能助手，请基于以下提供的上下文信息来回答用户的问题。如果上下文信息不足以回答问题，请诚实地说明。

上下文信息：
${context}

用户问题：${query}

请基于上述上下文信息回答问题，并在回答中明确引用相关的信息来源。如果上下文信息不足，请说明需要更多信息。`;
  }

  /**
   * 智能问答（RAG检索增强生成）
   */
  async chat(
    query: string,
    conversationId?: string,
    options: {
      userId?: string;
      useRAG?: boolean;
      maxSources?: number;
      temperature?: number;
    } = {}
  ): Promise<{
    response: string;
    sources: {
      document_id: string;
      document_name: string;
      content: string;
      similarity: number;
    }[];
    conversationId: string;
  }> {
    const {
      userId,
      useRAG = true,
      maxSources = this.maxRetrievalResults,
      temperature = 0.7
    } = options;

    try {
      let conversation: ConversationContext;
      
      // 获取或创建对话
      if (conversationId) {
        const existingConv = await this.getConversation(conversationId);
        if (existingConv) {
          conversation = existingConv;
        } else {
          conversation = await this.createConversation(userId, '智能问答');
        }
      } else {
        conversation = await this.createConversation(userId, '智能问答');
      }

      let sources: any[] = [];
      let contextInfo = '';

      // RAG检索增强
      if (useRAG) {
        try {
          const searchResults = await embeddingService.semanticSearch(query, {
            limit: maxSources,
            threshold: 0.7,
            userId
          });

          sources = searchResults.map(result => ({
            document_id: result.document_id,
            document_name: result.document_name,
            content: result.content,
            similarity: result.similarity
          }));

          // 构建上下文信息
          if (sources.length > 0) {
            contextInfo = sources
              .map((source, index) => 
                `[文档${index + 1}: ${source.document_name}]\n${source.content}`
              )
              .join('\n\n');
          }
        } catch (error) {
          console.error('RAG检索失败:', error);
          // 继续执行，但不使用RAG
        }
      }

      // 构建消息历史
      const messages: { role: string; content: string }[] = [];

      // 添加系统提示
      if (useRAG && contextInfo) {
        messages.push({
          role: 'system',
          content: '你是一个智能助手，请基于提供的上下文信息来回答用户的问题。如果上下文信息不足以回答问题，请诚实地说明。'
        });
      }

      // 添加历史对话（保留最近的几轮对话）
      const recentMessages = conversation.messages.slice(-6); // 保留最近3轮对话
      for (const msg of recentMessages) {
        if (msg.role !== 'system') {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      }

      // 添加当前问题
      if (useRAG && contextInfo) {
        const ragPrompt = this.buildRAGPrompt(query, contextInfo);
        messages.push({
          role: 'user',
          content: ragPrompt
        });
      } else {
        messages.push({
          role: 'user',
          content: query
        });
      }

      // 调用AI生成回答
      const response = await this.callChatAPI(messages);

      // 保存对话记录
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: query,
        timestamp: new Date()
      };

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        sources: sources.length > 0 ? sources : undefined
      };

      conversation.messages.push(userMessage, assistantMessage);
      conversation.updatedAt = new Date();

      // 更新数据库
      try {
        await supabase
          .from('conversation_contexts')
          .update({
            messages: conversation.messages,
            updated_at: conversation.updatedAt.toISOString()
          })
          .eq('id', conversation.id);
      } catch (error) {
        console.error('更新对话记录失败:', error);
      }

      return {
        response,
        sources,
        conversationId: conversation.id
      };

    } catch (error) {
      console.error('智能问答失败:', error);
      throw error;
    }
  }

  /**
   * 删除对话
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      return await contextService.deleteContext(conversationId);
    } catch (error) {
      console.error('删除对话失败:', error);
      return false;
    }
  }

  /**
   * 清理过期对话
   */
  async cleanupExpiredConversations(daysOld: number = 30): Promise<number> {
    try {
      return await contextService.cleanupExpiredContexts(daysOld);
    } catch (error) {
      console.error('清理过期对话失败:', error);
      return 0;
    }
  }

  /**
   * 更新对话标题
   */
  async updateConversationTitle(conversationId: string, title: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversation_contexts')
        .update({ 
          title,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (error) {
        throw new Error(`更新对话标题失败: ${error.message}`);
      }
    } catch (error) {
      console.error('更新对话标题失败:', error);
      throw error;
    }
  }

  /**
   * 清空对话历史
   */
  async clearConversation(conversationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversation_contexts')
        .update({ 
          messages: [],
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (error) {
        throw new Error(`清空对话失败: ${error.message}`);
      }
    } catch (error) {
      console.error('清空对话失败:', error);
      throw error;
    }
  }

  /**
   * 获取聊天统计信息
   */
  async getChatStats(userId?: string): Promise<{
    totalConversations: number;
    totalMessages: number;
    avgMessagesPerConversation: number;
  }> {
    try {
      let query = supabase
        .from('conversation_contexts')
        .select('messages');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`获取聊天统计失败: ${error.message}`);
      }

      const totalConversations = data?.length || 0;
      const totalMessages = data?.reduce((sum, conv) => sum + (conv.messages?.length || 0), 0) || 0;
      const avgMessagesPerConversation = totalConversations > 0 ? totalMessages / totalConversations : 0;

      return {
        totalConversations,
        totalMessages,
        avgMessagesPerConversation: Math.round(avgMessagesPerConversation * 100) / 100
      };
    } catch (error) {
      console.error('获取聊天统计失败:', error);
      return {
        totalConversations: 0,
        totalMessages: 0,
        avgMessagesPerConversation: 0
      };
    }
  }
}

export const chatService = new ChatService();
export default chatService;
export type { ChatMessage, ConversationContext };