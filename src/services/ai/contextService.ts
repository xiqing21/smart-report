import { supabase } from '../../lib/supabase';

interface ContextMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ConversationContext {
  id: string;
  userId?: string;
  title: string;
  messages: ContextMessage[];
  summary?: string;
  keywords?: string[];
  createdAt: Date;
  updatedAt: Date;
  tokenCount: number;
  maxTokens: number;
}

interface ContextSummary {
  summary: string;
  keyPoints: string[];
  entities: string[];
  topics: string[];
}

class ContextService {
  private maxContextTokens: number = 8000;
  private maxMessagesInContext: number = 20;
  private summaryThreshold: number = 10; // 超过10条消息时开始总结

  constructor() {}

  /**
   * 创建新的对话上下文
   */
  async createContext(userId?: string, title?: string): Promise<ConversationContext> {
    const contextId = `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const context: ConversationContext = {
      id: contextId,
      userId,
      title: title || '新对话',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      tokenCount: 0,
      maxTokens: this.maxContextTokens
    };

    // 存储到数据库
    try {
      const { error } = await supabase
        .from('conversation_contexts')
        .insert({
          id: contextId,
          user_id: userId,
          title: context.title,
          messages: [],
          summary: null,
          keywords: [],
          token_count: 0,
          max_tokens: this.maxContextTokens,
          created_at: context.createdAt.toISOString(),
          updated_at: context.updatedAt.toISOString()
        });

      if (error) {
        console.error('创建对话上下文失败:', error);
      }
    } catch (error) {
      console.error('存储对话上下文到数据库失败:', error);
    }

    return context;
  }

  /**
   * 获取对话上下文
   */
  async getContext(contextId: string): Promise<ConversationContext | null> {
    try {
      const { data, error } = await supabase
        .from('conversation_contexts')
        .select('*')
        .eq('id', contextId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        messages: data.messages || [],
        summary: data.summary,
        keywords: data.keywords || [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        tokenCount: data.token_count || 0,
        maxTokens: data.max_tokens || this.maxContextTokens
      };
    } catch (error) {
      console.error('获取对话上下文失败:', error);
      return null;
    }
  }

  /**
   * 添加消息到上下文
   */
  async addMessage(
    contextId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Record<string, any>
  ): Promise<ConversationContext | null> {
    const context = await this.getContext(contextId);
    if (!context) {
      return null;
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newMessage: ContextMessage = {
      id: messageId,
      role,
      content,
      timestamp: new Date(),
      metadata
    };

    // 添加新消息
    context.messages.push(newMessage);
    context.updatedAt = new Date();
    
    // 估算token数量（简单估算：1个token约等于4个字符）
    const messageTokens = Math.ceil(content.length / 4);
    context.tokenCount += messageTokens;

    // 检查是否需要压缩上下文
    if (context.messages.length > this.summaryThreshold) {
      await this.compressContext(context);
    }

    // 更新数据库
    await this.updateContext(context);

    return context;
  }

  /**
   * 压缩上下文（保留最近的消息，总结较早的消息）
   */
  private async compressContext(context: ConversationContext): Promise<void> {
    if (context.messages.length <= this.maxMessagesInContext) {
      return;
    }

    // 保留最近的消息
    const recentMessages = context.messages.slice(-this.maxMessagesInContext / 2);
    const oldMessages = context.messages.slice(0, -this.maxMessagesInContext / 2);

    // 生成旧消息的总结
    if (oldMessages.length > 0) {
      const summary = await this.generateSummary(oldMessages);
      
      // 创建总结消息
      const summaryMessage: ContextMessage = {
        id: `summary_${Date.now()}`,
        role: 'system',
        content: `[对话总结] ${summary.summary}`,
        timestamp: new Date(),
        metadata: {
          type: 'summary',
          keyPoints: summary.keyPoints,
          entities: summary.entities,
          topics: summary.topics,
          compressedMessages: oldMessages.length
        }
      };

      // 更新上下文
      context.messages = [summaryMessage, ...recentMessages];
      context.summary = summary.summary;
      context.keywords = [...(context.keywords || []), ...summary.keyPoints];
      
      // 重新计算token数量
      context.tokenCount = context.messages.reduce((total, msg) => {
        return total + Math.ceil(msg.content.length / 4);
      }, 0);
    }
  }

  /**
   * 生成对话总结
   */
  private async generateSummary(messages: ContextMessage[]): Promise<ContextSummary> {
    // 这里可以调用AI服务生成总结，暂时使用简单的规则
    const userMessages = messages.filter(msg => msg.role === 'user');
    const assistantMessages = messages.filter(msg => msg.role === 'assistant');
    
    const topics = this.extractTopics(messages);
    const entities = this.extractEntities(messages);
    
    const summary = `用户与助手进行了${messages.length}轮对话，主要讨论了${topics.slice(0, 3).join('、')}等话题。`;
    
    return {
      summary,
      keyPoints: topics.slice(0, 5),
      entities: entities.slice(0, 10),
      topics: topics
    };
  }

  /**
   * 提取对话主题
   */
  private extractTopics(messages: ContextMessage[]): string[] {
    const content = messages.map(msg => msg.content).join(' ');
    
    // 简单的关键词提取（实际应用中可以使用更复杂的NLP技术）
    const keywords = content
      .split(/[\s，。！？；：、]/)
      .filter(word => word.length > 1)
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    return Object.entries(keywords)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * 提取实体
   */
  private extractEntities(messages: ContextMessage[]): string[] {
    const content = messages.map(msg => msg.content).join(' ');
    
    // 简单的实体提取（数字、日期、专有名词等）
    const entities: string[] = [];
    
    // 提取数字
    const numbers = content.match(/\d+/g) || [];
    entities.push(...numbers.slice(0, 5));
    
    // 提取可能的专有名词（大写字母开头的词）
    const properNouns = content.match(/[A-Z][a-z]+/g) || [];
    entities.push(...properNouns.slice(0, 5));
    
    return [...new Set(entities)];
  }

  /**
   * 更新上下文到数据库
   */
  private async updateContext(context: ConversationContext): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversation_contexts')
        .update({
          messages: context.messages,
          summary: context.summary,
          keywords: context.keywords,
          token_count: context.tokenCount,
          updated_at: context.updatedAt.toISOString()
        })
        .eq('id', context.id);

      if (error) {
        console.error('更新对话上下文失败:', error);
      }
    } catch (error) {
      console.error('更新对话上下文到数据库失败:', error);
    }
  }

  /**
   * 获取用户的对话上下文列表
   */
  async getUserContexts(userId: string, limit: number = 20): Promise<ConversationContext[]> {
    try {
      const { data, error } = await supabase
        .from('conversation_contexts')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`获取用户对话上下文列表失败: ${error.message}`);
      }

      return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        title: item.title,
        messages: item.messages || [],
        summary: item.summary,
        keywords: item.keywords || [],
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        tokenCount: item.token_count || 0,
        maxTokens: item.max_tokens || this.maxContextTokens
      }));
    } catch (error) {
      console.error('获取用户对话上下文列表失败:', error);
      return [];
    }
  }

  /**
   * 删除对话上下文
   */
  async deleteContext(contextId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('conversation_contexts')
        .delete()
        .eq('id', contextId);

      if (error) {
        console.error('删除对话上下文失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('删除对话上下文失败:', error);
      return false;
    }
  }

  /**
   * 获取上下文的有效消息（用于AI对话）
   */
  getContextMessages(context: ConversationContext): ContextMessage[] {
    // 过滤掉系统总结消息，只返回用户和助手的对话
    return context.messages.filter(msg => 
      msg.role !== 'system' || msg.metadata?.type !== 'summary'
    );
  }

  /**
   * 清理过期的对话上下文
   */
  async cleanupExpiredContexts(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { data, error } = await supabase
        .from('conversation_contexts')
        .delete()
        .lt('updated_at', cutoffDate.toISOString())
        .select('id');

      if (error) {
        console.error('清理过期对话上下文失败:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('清理过期对话上下文失败:', error);
      return 0;
    }
  }
}

// 导出单例实例
export const contextService = new ContextService();
export type { ConversationContext, ContextMessage, ContextSummary };