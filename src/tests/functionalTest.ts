// 知识库系统功能测试
import { embeddingService } from '../services/ai/embeddingService';
import { chatService } from '../services/ai/chatService';
import { contextService } from '../services/ai/contextService';

interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  duration: number;
}

class FunctionalTest {
  private results: TestResult[] = [];

  private async runTest(testName: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = performance.now();
    try {
      await testFn();
      const duration = performance.now() - startTime;
      this.results.push({
        testName,
        passed: true,
        message: '测试通过',
        duration
      });
      console.log(`✅ ${testName} - 通过 (${duration.toFixed(2)}ms)`);
    } catch (error) {
      const duration = performance.now() - startTime;
      const message = error instanceof Error ? error.message : String(error);
      this.results.push({
        testName,
        passed: false,
        message,
        duration
      });
      console.log(`❌ ${testName} - 失败: ${message} (${duration.toFixed(2)}ms)`);
    }
  }

  // 测试向量化服务
  async testEmbeddingService(): Promise<void> {
    console.log('\n🔍 测试向量化服务...');
    
    await this.runTest('单文本向量化', async () => {
      const text = '这是一个测试文本';
      const embedding = await embeddingService.getEmbedding(text);
      
      if (!Array.isArray(embedding)) {
        throw new Error('返回的向量不是数组格式');
      }
      
      if (embedding.length === 0) {
        throw new Error('返回的向量长度为0');
      }
      
      if (!embedding.every(val => typeof val === 'number')) {
        throw new Error('向量包含非数字值');
      }
    });

    await this.runTest('批量文本向量化', async () => {
      const texts = ['文本1', '文本2', '文本3'];
      const embeddings = await embeddingService.getBatchEmbeddings(texts);
      
      if (!Array.isArray(embeddings)) {
        throw new Error('返回的批量向量不是数组格式');
      }
      
      if (embeddings.length !== texts.length) {
        throw new Error(`返回向量数量(${embeddings.length})与输入文本数量(${texts.length})不匹配`);
      }
      
      embeddings.forEach((embedding, index) => {
        if (!Array.isArray(embedding)) {
          throw new Error(`第${index + 1}个向量不是数组格式`);
        }
        if (embedding.length === 0) {
          throw new Error(`第${index + 1}个向量长度为0`);
        }
      });
    });

    await this.runTest('文档处理', async () => {
      const title = '测试文档';
      const content = '这是一个用于测试的文档内容，包含多个段落和信息。';
      const userId = 'test_user';
      
      const result = await embeddingService.processDocument(title, content, userId);
      
      if (!result || typeof result !== 'object') {
        throw new Error('文档处理返回结果格式错误');
      }
    });
  }

  // 测试智能问答服务
  async testChatService(): Promise<void> {
    console.log('\n💬 测试智能问答服务...');
    
    await this.runTest('基础问答', async () => {
      const question = '你好，请介绍一下自己';
      const response = await chatService.answerQuestion(question, undefined, 'test_user');
      
      if (!response || typeof response.content !== 'string') {
        throw new Error('问答响应格式错误');
      }
      
      if (response.content.trim().length === 0) {
        throw new Error('问答响应内容为空');
      }
    });

    await this.runTest('带上下文问答', async () => {
      // 创建测试上下文
      const context = await contextService.createContext('test_user', '功能测试对话');
      
      try {
        const question = '请记住我的名字是张三';
        const response = await chatService.answerQuestion(question, context.id, 'test_user');
        
        if (!response || typeof response.content !== 'string') {
          throw new Error('带上下文问答响应格式错误');
        }
        
        // 测试上下文记忆
        const followUpQuestion = '我的名字是什么？';
        const followUpResponse = await chatService.answerQuestion(followUpQuestion, context.id, 'test_user');
        
        if (!followUpResponse || typeof followUpResponse.content !== 'string') {
          throw new Error('上下文记忆问答响应格式错误');
        }
        
      } finally {
        // 清理测试上下文
        await contextService.deleteContext(context.id);
      }
    });

    await this.runTest('知识检索问答', async () => {
      const question = '系统有哪些主要功能？';
      const response = await chatService.answerQuestion(question, undefined, 'test_user');
      
      if (!response || typeof response.content !== 'string') {
        throw new Error('知识检索问答响应格式错误');
      }
      
      if (response.content.trim().length === 0) {
        throw new Error('知识检索问答响应内容为空');
      }
    });
  }

  // 测试上下文服务
  async testContextService(): Promise<void> {
    console.log('\n🧠 测试上下文服务...');
    
    let testContextId: string | undefined;
    
    await this.runTest('创建对话上下文', async () => {
      const context = await contextService.createContext('test_user', '功能测试对话');
      
      if (!context || !context.id) {
        throw new Error('创建上下文失败，返回结果无效');
      }
      
      if (typeof context.id !== 'string' || context.id.trim().length === 0) {
        throw new Error('上下文ID格式错误');
      }
      
      testContextId = context.id;
    });

    if (testContextId) {
      await this.runTest('获取对话上下文', async () => {
        const context = await contextService.getContext(testContextId!);
        
        if (!context) {
          throw new Error('获取上下文失败，返回结果为空');
        }
        
        if (context.id !== testContextId) {
          throw new Error('获取的上下文ID不匹配');
        }
      });

      await this.runTest('添加对话消息', async () => {
        await contextService.addMessage(testContextId!, {
          role: 'user',
          content: '这是一条测试消息'
        });
        
        await contextService.addMessage(testContextId!, {
          role: 'assistant',
          content: '这是助手的回复'
        });
        
        // 验证消息是否添加成功
        const context = await contextService.getContext(testContextId!);
        if (!context.messages || context.messages.length < 2) {
          throw new Error('消息添加失败');
        }
      });

      await this.runTest('获取用户上下文列表', async () => {
        const contexts = await contextService.getUserContexts('test_user');
        
        if (!Array.isArray(contexts)) {
          throw new Error('用户上下文列表格式错误');
        }
        
        const testContext = contexts.find(c => c.id === testContextId);
        if (!testContext) {
          throw new Error('在用户上下文列表中未找到测试上下文');
        }
      });

      await this.runTest('删除对话上下文', async () => {
        await contextService.deleteContext(testContextId!);
        
        // 验证删除是否成功
        try {
          await contextService.getContext(testContextId!);
          throw new Error('上下文删除失败，仍然可以获取到');
        } catch (error) {
          // 预期的错误，表示删除成功
          if (error instanceof Error && error.message.includes('删除失败')) {
            throw error;
          }
        }
      });
    }
  }

  // 测试语义搜索功能
  async testSemanticSearch(): Promise<void> {
    console.log('\n🔎 测试语义搜索功能...');
    
    await this.runTest('语义搜索', async () => {
      const query = '系统功能介绍';
      const results = await embeddingService.semanticSearch(query, 'test_user', 5);
      
      if (!Array.isArray(results)) {
        throw new Error('搜索结果不是数组格式');
      }
      
      // 验证搜索结果结构
      results.forEach((result, index) => {
        if (!result || typeof result !== 'object') {
          throw new Error(`第${index + 1}个搜索结果格式错误`);
        }
        
        if (typeof result.similarity !== 'number') {
          throw new Error(`第${index + 1}个搜索结果缺少相似度分数`);
        }
        
        if (result.similarity < 0 || result.similarity > 1) {
          throw new Error(`第${index + 1}个搜索结果相似度分数超出范围[0,1]`);
        }
      });
    });
  }

  // 测试错误处理
  async testErrorHandling(): Promise<void> {
    console.log('\n⚠️  测试错误处理...');
    
    await this.runTest('空文本向量化处理', async () => {
      try {
        await embeddingService.getEmbedding('');
        throw new Error('应该抛出空文本错误');
      } catch (error) {
        if (error instanceof Error && error.message === '应该抛出空文本错误') {
          throw error;
        }
        // 预期的错误，测试通过
      }
    });

    await this.runTest('无效上下文ID处理', async () => {
      try {
        await contextService.getContext('invalid_context_id');
        throw new Error('应该抛出无效上下文ID错误');
      } catch (error) {
        if (error instanceof Error && error.message === '应该抛出无效上下文ID错误') {
          throw error;
        }
        // 预期的错误，测试通过
      }
    });
  }

  // 运行所有功能测试
  async runAllTests(): Promise<void> {
    console.log('🧪 开始知识库系统功能测试...');
    console.log('=' .repeat(50));
    
    const startTime = performance.now();
    
    try {
      await this.testEmbeddingService();
      await this.testChatService();
      await this.testContextService();
      await this.testSemanticSearch();
      await this.testErrorHandling();
    } catch (error) {
      console.error('功能测试过程中发生未捕获的错误:', error);
    }
    
    const totalTime = performance.now() - startTime;
    
    console.log('\n' + '=' .repeat(50));
    console.log('📊 功能测试结果汇总');
    console.log('=' .repeat(50));
    
    this.generateReport(totalTime);
  }

  // 生成测试报告
  private generateReport(totalTime: number): void {
    const passedTests = this.results.filter(r => r.passed);
    const failedTests = this.results.filter(r => !r.passed);
    
    console.log(`\n📈 总体统计:`);
    console.log(`  总测试时间: ${(totalTime / 1000).toFixed(2)}秒`);
    console.log(`  总测试数量: ${this.results.length}`);
    console.log(`  通过测试: ${passedTests.length}`);
    console.log(`  失败测试: ${failedTests.length}`);
    console.log(`  通过率: ${((passedTests.length / this.results.length) * 100).toFixed(1)}%`);
    
    if (passedTests.length > 0) {
      const avgTime = passedTests.reduce((sum, r) => sum + r.duration, 0) / passedTests.length;
      console.log(`  平均测试时间: ${avgTime.toFixed(2)}ms`);
    }
    
    console.log(`\n📋 详细测试结果:`);
    this.results.forEach((result, index) => {
      const status = result.passed ? '✅' : '❌';
      const duration = result.duration.toFixed(2);
      console.log(`  ${index + 1}. ${status} ${result.testName}: ${duration}ms`);
      if (!result.passed) {
        console.log(`     失败原因: ${result.message}`);
      }
    });
    
    // 功能完整性评估
    console.log(`\n🎯 功能完整性评估:`);
    const passRate = (passedTests.length / this.results.length) * 100;
    
    if (passRate === 100) {
      console.log(`  ✅ 所有功能测试通过 (100%)`);
    } else if (passRate >= 90) {
      console.log(`  ✅ 功能基本完整 (${passRate.toFixed(1)}%)`);
    } else if (passRate >= 70) {
      console.log(`  ⚠️  功能部分缺失 (${passRate.toFixed(1)}%)`);
    } else {
      console.log(`  ❌ 功能严重缺失 (${passRate.toFixed(1)}%)`);
    }
    
    if (failedTests.length > 0) {
      console.log(`\n❌ 需要修复的功能:`);
      failedTests.forEach(test => {
        console.log(`  - ${test.testName}: ${test.message}`);
      });
    }
    
    // 核心功能检查
    const coreFeatures = [
      '单文本向量化',
      '基础问答',
      '创建对话上下文',
      '语义搜索'
    ];
    
    const coreFeatureResults = coreFeatures.map(feature => {
      const result = this.results.find(r => r.testName === feature);
      return { feature, passed: result?.passed || false };
    });
    
    const coreFeaturesPassed = coreFeatureResults.filter(r => r.passed).length;
    
    console.log(`\n🔧 核心功能状态:`);
    coreFeatureResults.forEach(({ feature, passed }) => {
      const status = passed ? '✅' : '❌';
      console.log(`  ${status} ${feature}`);
    });
    
    if (coreFeaturesPassed === coreFeatures.length) {
      console.log(`\n🎉 所有核心功能正常工作！`);
    } else {
      console.log(`\n⚠️  ${coreFeatures.length - coreFeaturesPassed}个核心功能需要修复`);
    }
  }
}

// 导出功能测试实例
export const functionalTest = new FunctionalTest();

// 如果直接运行此文件，执行功能测试
if (typeof window !== 'undefined' && (window as any).runFunctionalTest) {
  functionalTest.runAllTests().catch(console.error);
}