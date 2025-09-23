// 知识库系统性能测试
import { embeddingService } from '../services/ai/embeddingService';
import { chatService } from '../services/ai/chatService';
import { contextService } from '../services/ai/contextService';

interface PerformanceMetrics {
  operation: string;
  duration: number;
  success: boolean;
  error?: string;
}

class PerformanceTest {
  private metrics: PerformanceMetrics[] = [];

  private async measureTime<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      this.metrics.push({
        operation,
        duration,
        success: true
      });
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.metrics.push({
        operation,
        duration,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  // 测试向量化性能
  async testEmbeddingPerformance(): Promise<void> {
    console.log('🔍 测试向量化性能...');
    
    const testTexts = [
      '这是一个简短的测试文本',
      '这是一个中等长度的测试文本，包含更多的内容和信息，用于测试向量化服务的性能表现。',
      '这是一个较长的测试文本，包含大量的内容和详细信息。它用于测试向量化服务在处理长文本时的性能表现，包括响应时间和准确性。这种测试对于评估系统在实际使用场景中的表现非常重要，特别是当用户上传大型文档时。'
    ];

    for (let i = 0; i < testTexts.length; i++) {
      try {
        await this.measureTime(`向量化测试-文本${i + 1}`, async () => {
          return await embeddingService.getEmbedding(testTexts[i]);
        });
      } catch (error) {
        console.error(`向量化测试失败 (文本${i + 1}):`, error);
      }
    }
  }

  // 测试批量向量化性能
  async testBatchEmbeddingPerformance(): Promise<void> {
    console.log('📦 测试批量向量化性能...');
    
    const batchTexts = Array.from({ length: 5 }, (_, i) => 
      `批量测试文本 ${i + 1}：这是用于批量向量化测试的示例文本。`
    );

    try {
      await this.measureTime('批量向量化测试', async () => {
        return await embeddingService.getBatchEmbeddings(batchTexts);
      });
    } catch (error) {
      console.error('批量向量化测试失败:', error);
    }
  }

  // 测试智能问答性能
  async testChatPerformance(): Promise<void> {
    console.log('💬 测试智能问答性能...');
    
    const testQuestions = [
      '你好，请介绍一下这个系统',
      '如何使用知识库功能？',
      '系统支持哪些文件格式？',
      '如何提高搜索的准确性？'
    ];

    for (let i = 0; i < testQuestions.length; i++) {
      try {
        await this.measureTime(`问答测试-问题${i + 1}`, async () => {
          return await chatService.chat(
            testQuestions[i],
            undefined,
            { userId: 'test_user' }
          );
        });
      } catch (error) {
        console.error(`问答测试失败 (问题${i + 1}):`, error);
      }
    }
  }

  // 测试上下文记忆性能
  async testContextPerformance(): Promise<void> {
    console.log('🧠 测试上下文记忆性能...');
    
    let contextId: string | undefined;
    
    try {
      // 创建对话上下文
      const context = await this.measureTime('创建对话上下文', async () => {
        return await contextService.createContext('test_user', '性能测试对话');
      });
      contextId = context.id;

      // 测试多轮对话
      const conversations = [
        '我想了解这个系统的功能',
        '刚才你提到的功能中，哪个最重要？',
        '能详细说明一下吗？'
      ];

      for (let i = 0; i < conversations.length; i++) {
        await this.measureTime(`上下文对话-轮次${i + 1}`, async () => {
          return await chatService.chat(
            conversations[i],
            contextId,
            { userId: 'test_user' }
          );
        });
      }

      // 获取对话历史
      await this.measureTime('获取对话历史', async () => {
        return await contextService.getContext(contextId!);
      });

    } catch (error) {
      console.error('上下文测试失败:', error);
    } finally {
      // 清理测试数据
      if (contextId) {
        try {
          await contextService.deleteContext(contextId);
        } catch (error) {
          console.warn('清理测试上下文失败:', error);
        }
      }
    }
  }

  // 测试文档处理性能
  async testDocumentProcessingPerformance(): Promise<void> {
    console.log('📄 测试文档处理性能...');
    
    const testDocument = {
      title: '性能测试文档',
      content: `这是一个用于性能测试的示例文档。
      
      ## 第一章：系统介绍
      本系统是一个基于智谱AI的智能知识库系统，具备文档向量化、语义搜索、智能问答等功能。
      
      ## 第二章：核心功能
      1. 文档向量化存储
      2. 语义搜索与检索
      3. 智能问答对话
      4. 上下文记忆功能
      
      ## 第三章：技术架构
      系统采用React + TypeScript前端，Supabase作为后端数据库，集成智谱AI的Embeddings和Chat API。
      
      这个文档包含足够的内容来测试文档处理的性能表现。`
    };

    try {
      await this.measureTime('文档处理测试', async () => {
        return await embeddingService.processDocument(
          'test_doc_id',
          testDocument.content,
          { title: testDocument.title, userId: 'test_user' }
        );
      });
    } catch (error) {
      console.error('文档处理测试失败:', error);
    }
  }

  // 运行所有性能测试
  async runAllTests(): Promise<void> {
    console.log('🚀 开始知识库系统性能测试...');
    console.log('=' .repeat(50));
    
    const startTime = performance.now();
    
    try {
      await this.testEmbeddingPerformance();
      await this.testBatchEmbeddingPerformance();
      await this.testChatPerformance();
      await this.testContextPerformance();
      await this.testDocumentProcessingPerformance();
    } catch (error) {
      console.error('性能测试过程中发生错误:', error);
    }
    
    const totalTime = performance.now() - startTime;
    
    console.log('\n' + '=' .repeat(50));
    console.log('📊 性能测试结果汇总');
    console.log('=' .repeat(50));
    
    this.generateReport(totalTime);
  }

  // 生成性能报告
  private generateReport(totalTime: number): void {
    const successfulTests = this.metrics.filter(m => m.success);
    const failedTests = this.metrics.filter(m => !m.success);
    
    console.log(`\n📈 总体统计:`);
    console.log(`  总测试时间: ${(totalTime / 1000).toFixed(2)}秒`);
    console.log(`  总测试数量: ${this.metrics.length}`);
    console.log(`  成功测试: ${successfulTests.length}`);
    console.log(`  失败测试: ${failedTests.length}`);
    console.log(`  成功率: ${((successfulTests.length / this.metrics.length) * 100).toFixed(1)}%`);
    
    if (successfulTests.length > 0) {
      const avgTime = successfulTests.reduce((sum, m) => sum + m.duration, 0) / successfulTests.length;
      const maxTime = Math.max(...successfulTests.map(m => m.duration));
      const minTime = Math.min(...successfulTests.map(m => m.duration));
      
      console.log(`\n⏱️  响应时间统计:`);
      console.log(`  平均响应时间: ${avgTime.toFixed(2)}ms`);
      console.log(`  最大响应时间: ${maxTime.toFixed(2)}ms`);
      console.log(`  最小响应时间: ${minTime.toFixed(2)}ms`);
    }
    
    console.log(`\n📋 详细测试结果:`);
    this.metrics.forEach((metric, index) => {
      const status = metric.success ? '✅' : '❌';
      const duration = metric.duration.toFixed(2);
      console.log(`  ${index + 1}. ${status} ${metric.operation}: ${duration}ms`);
      if (!metric.success && metric.error) {
        console.log(`     错误: ${metric.error}`);
      }
    });
    
    // 性能评估
    console.log(`\n🎯 性能评估:`);
    const avgResponseTime = successfulTests.length > 0 
      ? successfulTests.reduce((sum, m) => sum + m.duration, 0) / successfulTests.length 
      : 0;
    
    if (avgResponseTime <= 2000) {
      console.log(`  ✅ 平均响应时间 ${avgResponseTime.toFixed(2)}ms ≤ 2000ms (目标达成)`);
    } else {
      console.log(`  ⚠️  平均响应时间 ${avgResponseTime.toFixed(2)}ms > 2000ms (需要优化)`);
    }
    
    const successRate = (successfulTests.length / this.metrics.length) * 100;
    if (successRate >= 85) {
      console.log(`  ✅ 成功率 ${successRate.toFixed(1)}% ≥ 85% (目标达成)`);
    } else {
      console.log(`  ⚠️  成功率 ${successRate.toFixed(1)}% < 85% (需要改进)`);
    }
    
    if (failedTests.length > 0) {
      console.log(`\n❌ 失败的测试需要关注:`);
      failedTests.forEach(test => {
        console.log(`  - ${test.operation}: ${test.error}`);
      });
    }
  }
}

// 导出性能测试实例
export const performanceTest = new PerformanceTest();

// 如果直接运行此文件，执行性能测试
if (typeof window !== 'undefined' && (window as any).runPerformanceTest) {
  performanceTest.runAllTests().catch(console.error);
}