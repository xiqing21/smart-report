import { supabase } from '../../lib/supabase';
import { mockGetEmbedding, isBrowserEnvironment, type MockEmbeddingResponse } from './mockAIService';

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



interface EmbeddingResponse {
  data: {
    embedding: number[];
    index: number;
    object: string;
  }[];
  model: string;
  object: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

interface DocumentChunk {
  content: string;
  metadata: {
    page?: number;
    section?: string;
    line?: number;
    [key: string]: any;
  };
}

class EmbeddingService {
  private apiKey: string;
  private baseUrl: string = 'https://open.bigmodel.cn/api/paas/v4';
  private model: string = 'embedding-2';

  constructor() {
    // 从环境变量获取智谱AI API密钥
    this.apiKey = import.meta.env.VITE_ZHIPU_API_KEY || '';
    if (!this.apiKey) {
      console.warn('智谱AI API密钥未配置，请在环境变量中设置 VITE_ZHIPU_API_KEY');
    }
  }

  /**
   * 获取文本的向量表示
   */
  async getEmbedding(text: string): Promise<number[]> {
    try {
      if (isBrowserEnvironment() || !zhipuClient) {
        // 浏览器环境使用模拟服务
        const response = await mockGetEmbedding(text);
        return response.data[0].embedding;
      } else {
        // 服务器环境使用真实API
        const response = await zhipuClient.embeddings.create({
          model: 'embedding-2',
          input: text
        });
        return response.data[0].embedding;
      }
    } catch (error) {
      console.error('获取向量失败:', error);
      // 降级处理：返回随机向量
      return Array.from({ length: 1024 }, () => Math.random() * 2 - 1);
    }
  }

  /**
   * 批量获取文本的向量表示
   */
  async getBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    // 分批处理，避免单次请求过大
    const batchSize = 10;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchPromises = batch.map(text => this.getEmbedding(text));
      
      try {
        const batchEmbeddings = await Promise.all(batchPromises);
        embeddings.push(...batchEmbeddings);
        
        // 添加延迟避免API限流
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`批次 ${Math.floor(i / batchSize) + 1} 处理失败:`, error);
        throw error;
      }
    }
    
    return embeddings;
  }

  /**
   * 将文档内容分块
   */
  chunkDocument(content: string, options: {
    chunkSize?: number;
    overlap?: number;
    preserveParagraphs?: boolean;
  } = {}): DocumentChunk[] {
    const {
      chunkSize = 1000,
      overlap = 200,
      preserveParagraphs = true
    } = options;

    const chunks: DocumentChunk[] = [];
    
    if (preserveParagraphs) {
      // 按段落分割
      const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      let currentChunk = '';
      let chunkIndex = 0;
      
      for (const paragraph of paragraphs) {
        const trimmedParagraph = paragraph.trim();
        
        // 如果当前段落加上现有块超过大小限制
        if (currentChunk.length + trimmedParagraph.length > chunkSize && currentChunk.length > 0) {
          chunks.push({
            content: currentChunk.trim(),
            metadata: {
              section: `chunk_${chunkIndex}`,
              chunkIndex
            }
          });
          
          // 保留重叠部分
          const overlapText = currentChunk.slice(-overlap);
          currentChunk = overlapText + '\n\n' + trimmedParagraph;
          chunkIndex++;
        } else {
          currentChunk += (currentChunk ? '\n\n' : '') + trimmedParagraph;
        }
      }
      
      // 添加最后一个块
      if (currentChunk.trim().length > 0) {
        chunks.push({
          content: currentChunk.trim(),
          metadata: {
            section: `chunk_${chunkIndex}`,
            chunkIndex
          }
        });
      }
    } else {
      // 简单的字符分割
      for (let i = 0; i < content.length; i += chunkSize - overlap) {
        const chunk = content.slice(i, i + chunkSize);
        if (chunk.trim().length > 0) {
          chunks.push({
            content: chunk.trim(),
            metadata: {
              section: `chunk_${Math.floor(i / (chunkSize - overlap))}`,
              chunkIndex: Math.floor(i / (chunkSize - overlap))
            }
          });
        }
      }
    }
    
    return chunks;
  }

  /**
   * 处理文档并存储到向量数据库
   */
  async processDocument(documentId: string, content: string, metadata: Record<string, any> = {}): Promise<void> {
    try {
      // 1. 分块处理文档
      const chunks = this.chunkDocument(content, {
        chunkSize: 1000,
        overlap: 200,
        preserveParagraphs: true
      });

      console.log(`文档 ${documentId} 分块完成，共 ${chunks.length} 个块`);

      // 2. 获取所有块的向量表示
      const texts = chunks.map(chunk => chunk.content);
      const embeddings = await this.getBatchEmbeddings(texts);

      console.log(`文档 ${documentId} 向量化完成`);

      // 3. 存储到数据库
      const chunkData = chunks.map((chunk, index) => ({
        document_id: documentId,
        chunk_index: index,
        content: chunk.content,
        embedding: JSON.stringify(embeddings[index]), // Supabase需要JSON格式
        metadata: {
          ...chunk.metadata,
          ...metadata
        }
      }));

      const { error } = await supabase
        .from('document_chunks')
        .insert(chunkData);

      if (error) {
        throw new Error(`存储文档块失败: ${error.message}`);
      }

      console.log(`文档 ${documentId} 存储完成，共 ${chunks.length} 个向量块`);

      // 4. 更新文档状态
      await supabase
        .from('documents')
        .update({
          status: 'completed',
          chunks: chunks.length,
          vectors: chunks.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

    } catch (error) {
      console.error(`处理文档 ${documentId} 失败:`, error);
      
      // 更新文档状态为失败
      await supabase
        .from('documents')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);
      
      throw error;
    }
  }

  /**
   * 语义搜索
   */
  async semanticSearch(query: string, options: {
    limit?: number;
    threshold?: number;
    userId?: string;
  } = {}): Promise<{
    id: string;
    document_id: string;
    document_name: string;
    content: string;
    similarity: number;
    metadata: Record<string, any>;
  }[]> {
    const { limit = 10, threshold = 0.7, userId } = options;

    try {
      // 1. 获取查询的向量表示
      const queryEmbedding = await this.getEmbedding(query);

      // 2. 调用数据库函数进行相似度搜索
      const { data, error } = await supabase
        .rpc('search_documents', {
          query_embedding: JSON.stringify(queryEmbedding),
          match_threshold: threshold,
          match_count: limit,
          filter_user_id: userId || null
        });

      if (error) {
        throw new Error(`语义搜索失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('语义搜索失败:', error);
      throw error;
    }
  }

  /**
   * 删除文档的所有向量数据
   */
  async deleteDocumentVectors(documentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('document_chunks')
        .delete()
        .eq('document_id', documentId);

      if (error) {
        throw new Error(`删除文档向量失败: ${error.message}`);
      }

      console.log(`文档 ${documentId} 的向量数据已删除`);
    } catch (error) {
      console.error(`删除文档 ${documentId} 向量失败:`, error);
      throw error;
    }
  }

  /**
   * 获取文档统计信息
   */
  async getDocumentStats(userId?: string): Promise<{
    totalDocuments: number;
    completedDocuments: number;
    totalVectors: number;
    totalChunks: number;
  }> {
    try {
      let query = supabase
        .from('documents')
        .select('status, chunks, vectors');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`获取文档统计失败: ${error.message}`);
      }

      const stats = {
        totalDocuments: data?.length || 0,
        completedDocuments: data?.filter(doc => doc.status === 'completed').length || 0,
        totalVectors: data?.reduce((sum, doc) => sum + (doc.vectors || 0), 0) || 0,
        totalChunks: data?.reduce((sum, doc) => sum + (doc.chunks || 0), 0) || 0
      };

      return stats;
    } catch (error) {
      console.error('获取文档统计失败:', error);
      throw error;
    }
  }
}

export const embeddingService = new EmbeddingService();
export default embeddingService;