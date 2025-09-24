import { embeddingService } from './ai/embeddingService';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface ProcessingProgress {
  documentId: string;
  stage: 'parsing' | 'chunking' | 'embedding' | 'storing' | 'completed' | 'failed';
  progress: number;
  message: string;
  error?: string;
}

interface DocumentMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
  userId?: string;
  tags?: string[];
  description?: string;
}

class DocumentProcessor {
  private progressCallbacks: Map<string, (progress: ProcessingProgress) => void> = new Map();

  /**
   * 注册进度回调
   */
  onProgress(documentId: string, callback: (progress: ProcessingProgress) => void): void {
    this.progressCallbacks.set(documentId, callback);
  }

  /**
   * 移除进度回调
   */
  removeProgressCallback(documentId: string): void {
    this.progressCallbacks.delete(documentId);
  }

  /**
   * 发送进度更新
   */
  private updateProgress(progress: ProcessingProgress): void {
    const callback = this.progressCallbacks.get(progress.documentId);
    if (callback) {
      callback(progress);
    }
  }

  /**
   * 解析PDF文件内容
   */
  private async parsePDF(file: File): Promise<string> {
    // 注意：这里需要使用PDF.js或类似库来解析PDF
    // 由于浏览器环境限制，这里提供一个简化的实现
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // 这里应该使用PDF.js来解析PDF内容
          // 暂时返回文件名作为内容（实际项目中需要集成PDF.js）
          // const arrayBuffer = e.target?.result as ArrayBuffer;
          
          // 简化实现：返回文件基本信息
          const content = `PDF文档: ${file.name}\n文件大小: ${file.size} bytes\n\n[注意：这是PDF解析的占位符实现，实际项目中需要集成PDF.js库来提取真实的文本内容]`;
          resolve(content);
        } catch (error) {
          reject(new Error(`PDF解析失败: ${error}`));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * 解析Word文档内容
   */
  private async parseWord(file: File): Promise<string> {
    // 注意：这里需要使用mammoth.js或类似库来解析Word文档
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // 这里应该使用mammoth.js来解析Word内容
          // 暂时返回文件名作为内容（实际项目中需要集成mammoth.js）
          // const arrayBuffer = e.target?.result as ArrayBuffer;
          
          // 简化实现：返回文件基本信息
          const content = `Word文档: ${file.name}\n文件大小: ${file.size} bytes\n\n[注意：这是Word解析的占位符实现，实际项目中需要集成mammoth.js库来提取真实的文本内容]`;
          resolve(content);
        } catch (error) {
          reject(new Error(`Word文档解析失败: ${error}`));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * 解析文本文件内容
   */
  private async parseText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('文本文件读取失败'));
      reader.readAsText(file, 'utf-8');
    });
  }

  /**
   * 解析Markdown文件内容
   */
  private async parseMarkdown(file: File): Promise<string> {
    return this.parseText(file); // Markdown本质上是文本文件
  }

  /**
   * 解析JSON文件内容
   */
  private async parseJSON(file: File): Promise<string> {
    const content = await this.parseText(file);
    try {
      // 验证JSON格式并格式化
      const jsonData = JSON.parse(content);
      return JSON.stringify(jsonData, null, 2);
    } catch (error) {
      throw new Error(`JSON文件格式错误: ${error}`);
    }
  }

  /**
   * 根据文件类型解析内容
   */
  private async parseFileContent(file: File): Promise<string> {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    try {
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        return await this.parsePDF(file);
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileType === 'application/msword' ||
        fileName.endsWith('.docx') ||
        fileName.endsWith('.doc')
      ) {
        return await this.parseWord(file);
      } else if (
        fileType.startsWith('text/') ||
        fileName.endsWith('.txt') ||
        fileName.endsWith('.md') ||
        fileName.endsWith('.markdown')
      ) {
        if (fileName.endsWith('.md') || fileName.endsWith('.markdown')) {
          return await this.parseMarkdown(file);
        } else {
          return await this.parseText(file);
        }
      } else if (
        fileType === 'application/json' ||
        fileName.endsWith('.json')
      ) {
        return await this.parseJSON(file);
      } else {
        throw new Error(`不支持的文件类型: ${fileType || '未知'}`);
      }
    } catch (error) {
      throw new Error(`文件解析失败: ${error}`);
    }
  }

  /**
   * 验证文件
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    // 检查文件大小（50MB限制）
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `文件大小超过限制（最大50MB），当前文件大小: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      };
    }

    // 检查文件类型
    const supportedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'text/markdown',
      'application/json'
    ];

    const supportedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.md', '.markdown', '.json'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = supportedExtensions.some(ext => fileName.endsWith(ext));
    const hasValidType = supportedTypes.includes(file.type.toLowerCase());

    if (!hasValidType && !hasValidExtension) {
      return {
        valid: false,
        error: `不支持的文件类型。支持的格式: PDF, Word文档, 文本文件, Markdown, JSON`
      };
    }

    return { valid: true };
  }

  /**
   * 处理单个文档
   */
  async processDocument(
    file: File,
    metadata: Partial<DocumentMetadata> = {}
  ): Promise<string> {
    // 生成文档ID - 使用UUID格式以匹配数据库schema
    const documentId = uuidv4();

    try {
      // 1. 验证文件
      this.updateProgress({
        documentId,
        stage: 'parsing',
        progress: 0,
        message: '验证文件...'
      });

      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // 2. 创建文档记录
      const documentMetadata: DocumentMetadata = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'unknown',
        uploadedAt: new Date(),
        ...metadata
      };

      const { error: insertError } = await (supabase
        .from('documents') as any)
        .insert({
          id: documentId,
          name: documentMetadata.fileName,
          type: documentMetadata.fileType,
          size: documentMetadata.fileSize,
          status: 'processing',
          user_id: documentMetadata.userId,
          metadata: {
            tags: documentMetadata.tags || [],
            description: documentMetadata.description
          },
          upload_time: documentMetadata.uploadedAt.toISOString()
        });

      if (insertError) {
        throw new Error(`创建文档记录失败: ${insertError.message}`);
      }

      // 3. 解析文件内容
      this.updateProgress({
        documentId,
        stage: 'parsing',
        progress: 20,
        message: '解析文件内容...'
      });

      const content = await this.parseFileContent(file);

      if (!content || content.trim().length === 0) {
        throw new Error('文件内容为空或无法解析');
      }

      // 4. 处理文档向量化
      this.updateProgress({
        documentId,
        stage: 'embedding',
        progress: 50,
        message: '开始向量化处理...'
      });

      await embeddingService.processDocument(documentId, content, {
        fileName: documentMetadata.fileName,
        fileType: documentMetadata.fileType,
        fileSize: documentMetadata.fileSize,
        tags: documentMetadata.tags,
        description: documentMetadata.description
      });

      // 5. 完成处理
      this.updateProgress({
        documentId,
        stage: 'completed',
        progress: 100,
        message: '文档处理完成'
      });

      return documentId;

    } catch (error) {
      console.error(`处理文档失败:`, error);
      
      // 更新错误状态
      this.updateProgress({
        documentId,
        stage: 'failed',
        progress: 0,
        message: '处理失败',
        error: error instanceof Error ? error.message : '未知错误'
      });

      // 清理失败的记录
      try {
        await supabase
          .from('documents')
          .delete()
          .eq('id', documentId);
      } catch (cleanupError) {
        console.error('清理失败记录时出错:', cleanupError);
      }

      throw error;
    } finally {
      // 清理进度回调
      setTimeout(() => {
        this.removeProgressCallback(documentId);
      }, 5000); // 5秒后清理
    }
  }

  /**
   * 批量处理文档
   */
  async processBatchDocuments(
    files: File[],
    metadata: Partial<DocumentMetadata> = {}
  ): Promise<{
    successful: string[];
    failed: { file: string; error: string }[];
  }> {
    const successful: string[] = [];
    const failed: { file: string; error: string }[] = [];

    // 限制并发数量
    const concurrency = 3;
    const batches: File[][] = [];
    
    for (let i = 0; i < files.length; i += concurrency) {
      batches.push(files.slice(i, i + concurrency));
    }

    for (const batch of batches) {
      const promises = batch.map(async (file) => {
        try {
          const documentId = await this.processDocument(file, metadata);
          successful.push(documentId);
        } catch (error) {
          failed.push({
            file: file.name,
            error: error instanceof Error ? error.message : '未知错误'
          });
        }
      });

      await Promise.all(promises);
      
      // 批次间添加延迟
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return { successful, failed };
  }

  /**
   * 删除文档及其向量数据
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      // 1. 删除向量数据
      await embeddingService.deleteDocumentVectors(documentId);

      // 2. 删除文档记录
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) {
        throw new Error(`删除文档记录失败: ${error.message}`);
      }

      console.log(`文档 ${documentId} 已完全删除`);
    } catch (error) {
      console.error(`删除文档 ${documentId} 失败:`, error);
      throw error;
    }
  }

  /**
   * 获取文档列表
   */
  async getDocuments(options: {
    userId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    documents: any[];
    total: number;
  }> {
    const { userId, status, limit = 20, offset = 0 } = options;

    try {
      let query = supabase
        .from('documents')
        .select('*', { count: 'exact' })
        .order('upload_time', { ascending: false })
        .range(offset, offset + limit - 1);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`获取文档列表失败: ${error.message}`);
      }

      return {
        documents: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('获取文档列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取支持的文件类型信息
   */
  getSupportedFileTypes(): {
    types: string[];
    extensions: string[];
    maxSize: string;
    description: string;
  } {
    return {
      types: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
        'text/markdown',
        'application/json'
      ],
      extensions: ['.pdf', '.doc', '.docx', '.txt', '.md', '.markdown', '.json'],
      maxSize: '50MB',
      description: '支持PDF、Word文档、文本文件、Markdown和JSON格式'
    };
  }
}

export const documentProcessor = new DocumentProcessor();
export default documentProcessor;
export type { ProcessingProgress, DocumentMetadata };