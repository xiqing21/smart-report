// AI服务管理器
// AI Service Manager with Load Balancing and Error Handling

import { AI_PROVIDERS, AI_CONFIG, getActiveProviders, getAPIKey, type AIProvider } from '../../config/ai-config';

// 请求和响应接口定义
export interface AIRequest {
  prompt: string;
  context?: string;
  systemPrompt?: string;
  parameters?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
}

export interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
  responseTime: number;
  cost?: number;
}

export interface AIError {
  code: string;
  message: string;
  provider: string;
  details?: any;
}

// 负载均衡器
class LoadBalancer {
  private requestCounts: Map<string, number> = new Map();
  private lastUsed: Map<string, number> = new Map();
  private failureCounts: Map<string, number> = new Map();

  selectProvider(providers: AIProvider[], strategy: string = AI_CONFIG.loadBalanceStrategy): AIProvider {
    const activeProviders = providers.filter(p => p.isActive && this.getFailureCount(p.name) < 5);
    
    if (activeProviders.length === 0) {
      throw new Error('No active AI providers available');
    }

    switch (strategy) {
      case 'priority':
        return this.selectByPriority(activeProviders);
      case 'round_robin':
        return this.selectRoundRobin(activeProviders);
      case 'least_used':
        return this.selectLeastUsed(activeProviders);
      default:
        return this.selectByPriority(activeProviders);
    }
  }

  private selectByPriority(providers: AIProvider[]): AIProvider {
    return providers.sort((a, b) => a.priority - b.priority)[0];
  }

  private selectRoundRobin(providers: AIProvider[]): AIProvider {
    const sortedProviders = providers.sort((a, b) => {
      const aLastUsed = this.lastUsed.get(a.name) || 0;
      const bLastUsed = this.lastUsed.get(b.name) || 0;
      return aLastUsed - bLastUsed;
    });
    
    const selected = sortedProviders[0];
    this.lastUsed.set(selected.name, Date.now());
    return selected;
  }

  private selectLeastUsed(providers: AIProvider[]): AIProvider {
    return providers.reduce((least, current) => {
      const leastCount = this.requestCounts.get(least.name) || 0;
      const currentCount = this.requestCounts.get(current.name) || 0;
      return currentCount < leastCount ? current : least;
    });
  }

  recordRequest(providerName: string): void {
    const count = this.requestCounts.get(providerName) || 0;
    this.requestCounts.set(providerName, count + 1);
  }

  recordFailure(providerName: string): void {
    const count = this.failureCounts.get(providerName) || 0;
    this.failureCounts.set(providerName, count + 1);
  }

  resetFailures(providerName: string): void {
    this.failureCounts.set(providerName, 0);
  }

  private getFailureCount(providerName: string): number {
    return this.failureCounts.get(providerName) || 0;
  }
}

// 缓存管理器
class CacheManager {
  private cache: Map<string, { data: AIResponse; timestamp: number }> = new Map();
  private readonly ttl: number;
  private readonly maxSize: number;

  constructor(ttl: number = AI_CONFIG.cacheConfig.ttl * 1000, maxSize: number = AI_CONFIG.cacheConfig.maxSize) {
    this.ttl = ttl;
    this.maxSize = maxSize;
  }

  get(key: string): AIResponse | null {
    if (!AI_CONFIG.cacheConfig.enabled) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set(key: string, data: AIResponse): void {
    if (!AI_CONFIG.cacheConfig.enabled) return;

    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, { data, timestamp: Date.now() });
  }

  generateKey(request: AIRequest, provider: string): string {
    const keyData = {
      prompt: request.prompt,
      context: request.context,
      systemPrompt: request.systemPrompt,
      parameters: request.parameters,
      provider
    };
    return btoa(JSON.stringify(keyData)).replace(/[+/=]/g, '');
  }

  clear(): void {
    this.cache.clear();
  }
}

// 监控管理器
class MonitoringManager {
  private requestLogs: Array<{
    timestamp: number;
    provider: string;
    request: AIRequest;
    response?: AIResponse;
    error?: AIError;
    duration: number;
  }> = [];

  logRequest(provider: string, request: AIRequest, response?: AIResponse, error?: AIError, duration: number = 0): void {
    if (!AI_CONFIG.monitoringConfig.logRequests) return;

    this.requestLogs.push({
      timestamp: Date.now(),
      provider,
      request: AI_CONFIG.monitoringConfig.logResponses ? request : { ...request, prompt: '[REDACTED]' },
      response: AI_CONFIG.monitoringConfig.logResponses ? response : undefined,
      error,
      duration
    });

    // 保持日志数量在合理范围内
    if (this.requestLogs.length > 1000) {
      this.requestLogs = this.requestLogs.slice(-500);
    }
  }

  getStats(): {
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
    providerStats: Record<string, { requests: number; failures: number; avgResponseTime: number }>;
  } {
    const stats = {
      totalRequests: this.requestLogs.length,
      successRate: 0,
      averageResponseTime: 0,
      providerStats: {} as Record<string, { requests: number; failures: number; avgResponseTime: number }>
    };

    if (this.requestLogs.length === 0) return stats;

    const successfulRequests = this.requestLogs.filter(log => !log.error);
    stats.successRate = (successfulRequests.length / this.requestLogs.length) * 100;
    stats.averageResponseTime = successfulRequests.reduce((sum, log) => sum + log.duration, 0) / successfulRequests.length;

    // 按提供商统计
    for (const log of this.requestLogs) {
      if (!stats.providerStats[log.provider]) {
        stats.providerStats[log.provider] = { requests: 0, failures: 0, avgResponseTime: 0 };
      }
      
      stats.providerStats[log.provider].requests++;
      if (log.error) {
        stats.providerStats[log.provider].failures++;
      } else {
        stats.providerStats[log.provider].avgResponseTime += log.duration;
      }
    }

    // 计算平均响应时间
    for (const [provider, stat] of Object.entries(stats.providerStats)) {
      const successCount = stat.requests - stat.failures;
      if (successCount > 0) {
        stat.avgResponseTime = stat.avgResponseTime / successCount;
      }
    }

    return stats;
  }
}

// AI服务管理器主类
export class AIServiceManager {
  private loadBalancer: LoadBalancer;
  private cacheManager: CacheManager;
  private monitoringManager: MonitoringManager;

  constructor() {
    this.loadBalancer = new LoadBalancer();
    this.cacheManager = new CacheManager();
    this.monitoringManager = new MonitoringManager();
  }

  async callAI(request: AIRequest, preferredProvider?: string): Promise<AIResponse> {
    const startTime = Date.now();
    let lastError: AIError | null = null;

    // 尝试使用首选提供商
    if (preferredProvider && AI_PROVIDERS[preferredProvider]?.isActive) {
      try {
        const response = await this.makeRequest(AI_PROVIDERS[preferredProvider], request);
        this.monitoringManager.logRequest(preferredProvider, request, response, undefined, Date.now() - startTime);
        return response;
      } catch (error) {
        lastError = this.createAIError(error, preferredProvider);
        this.loadBalancer.recordFailure(preferredProvider);
        this.monitoringManager.logRequest(preferredProvider, request, undefined, lastError, Date.now() - startTime);
      }
    }

    // 使用负载均衡选择提供商
    const activeProviders = getActiveProviders();
    const maxRetries = AI_CONFIG.retryConfig.maxRetries;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const provider = this.loadBalancer.selectProvider(activeProviders);
        const response = await this.makeRequest(provider, request);
        
        this.loadBalancer.recordRequest(provider.name);
        this.loadBalancer.resetFailures(provider.name);
        this.monitoringManager.logRequest(provider.name, request, response, undefined, Date.now() - startTime);
        
        return response;
      } catch (error) {
        lastError = this.createAIError(error, 'unknown');
        
        if (attempt < maxRetries - 1) {
          await this.delay(AI_CONFIG.retryConfig.retryDelay * Math.pow(AI_CONFIG.retryConfig.backoffMultiplier, attempt));
        }
      }
    }

    // 所有重试都失败了
    if (lastError) {
      this.monitoringManager.logRequest('failed', request, undefined, lastError, Date.now() - startTime);
      throw lastError;
    }

    throw new Error('All AI providers failed');
  }

  private async makeRequest(provider: AIProvider, request: AIRequest): Promise<AIResponse> {
    // 检查缓存
    const cacheKey = this.cacheManager.generateKey(request, provider.name);
    const cachedResponse = this.cacheManager.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    const startTime = Date.now();
    let response: AIResponse;

    switch (provider.name) {
      case 'qwen':
        response = await this.callQwen(provider, request);
        break;
      case 'kimi':
        response = await this.callKimi(provider, request);
        break;
      case 'zhipu':
        response = await this.callZhipu(provider, request);
        break;
      case 'deepseek':
        response = await this.callDeepSeek(provider, request);
        break;
      case 'gemini':
        response = await this.callGemini(provider, request);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider.name}`);
    }

    response.responseTime = Date.now() - startTime;
    response.provider = provider.name;
    response.cost = provider.costPerRequest;

    // 缓存响应
    this.cacheManager.set(cacheKey, response);

    return response;
  }

  private async callQwen(provider: AIProvider, request: AIRequest): Promise<AIResponse> {
    const apiKey = getAPIKey(provider.name);
    if (!apiKey) {
      throw new Error(`API key not found for provider: ${provider.name}`);
    }
    
    const requestBody = {
      model: provider.model,
      input: {
        messages: [
          ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
          ...(request.context ? [{ role: 'user', content: request.context }] : []),
          { role: 'user', content: request.prompt }
        ]
      },
      parameters: {
        temperature: request.parameters?.temperature ?? provider.parameters.temperature,
        max_tokens: request.parameters?.maxTokens ?? provider.parameters.maxTokens,
        top_p: request.parameters?.topP ?? provider.parameters.topP
      }
    };

    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(AI_CONFIG.timeoutConfig.requestTimeout)
    });

    if (!response.ok) {
      throw new Error(`Qwen API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.output.text,
      usage: {
        promptTokens: data.usage.input_tokens || 0,
        completionTokens: data.usage.output_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      },
      model: provider.model,
      provider: provider.name,
      responseTime: 0
    };
  }

  private async callKimi(provider: AIProvider, request: AIRequest): Promise<AIResponse> {
    const apiKey = getAPIKey(provider.name);
    if (!apiKey) {
      throw new Error(`API key not found for provider: ${provider.name}`);
    }
    
    const requestBody = {
      model: provider.model,
      messages: [
        ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
        ...(request.context ? [{ role: 'user', content: request.context }] : []),
        { role: 'user', content: request.prompt }
      ],
      temperature: request.parameters?.temperature ?? provider.parameters.temperature,
      max_tokens: request.parameters?.maxTokens ?? provider.parameters.maxTokens,
      top_p: request.parameters?.topP ?? provider.parameters.topP
    };

    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(AI_CONFIG.timeoutConfig.requestTimeout)
    });

    if (!response.ok) {
      throw new Error(`Kimi API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      },
      model: provider.model,
      provider: provider.name,
      responseTime: 0
    };
  }

  private async callZhipu(provider: AIProvider, request: AIRequest): Promise<AIResponse> {
    const apiKey = getAPIKey(provider.name);
    if (!apiKey) {
      throw new Error(`API key not found for provider: ${provider.name}`);
    }
    
    const requestBody = {
      model: provider.model,
      messages: [
        ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
        ...(request.context ? [{ role: 'user', content: request.context }] : []),
        { role: 'user', content: request.prompt }
      ],
      temperature: request.parameters?.temperature ?? provider.parameters.temperature,
      max_tokens: request.parameters?.maxTokens ?? provider.parameters.maxTokens,
      top_p: request.parameters?.topP ?? provider.parameters.topP
    };

    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(AI_CONFIG.timeoutConfig.requestTimeout)
    });

    if (!response.ok) {
      throw new Error(`Zhipu API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      },
      model: provider.model,
      provider: provider.name,
      responseTime: 0
    };
  }

  private async callDeepSeek(provider: AIProvider, request: AIRequest): Promise<AIResponse> {
    const apiKey = getAPIKey(provider.name);
    if (!apiKey) {
      throw new Error(`API key not found for provider: ${provider.name}`);
    }
    
    const requestBody = {
      model: provider.model,
      messages: [
        ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
        ...(request.context ? [{ role: 'user', content: request.context }] : []),
        { role: 'user', content: request.prompt }
      ],
      temperature: request.parameters?.temperature ?? provider.parameters.temperature,
      max_tokens: request.parameters?.maxTokens ?? provider.parameters.maxTokens,
      top_p: request.parameters?.topP ?? provider.parameters.topP
    };

    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(AI_CONFIG.timeoutConfig.requestTimeout)
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      },
      model: provider.model,
      provider: provider.name,
      responseTime: 0
    };
  }

  private async callGemini(provider: AIProvider, request: AIRequest): Promise<AIResponse> {
    const apiKey = getAPIKey(provider.name);
    if (!apiKey) {
      throw new Error(`API key not found for provider: ${provider.name}`);
    }
    
    const requestBody = {
      contents: [{
        parts: [{
          text: [request.systemPrompt, request.context, request.prompt].filter(Boolean).join('\n\n')
        }]
      }],
      generationConfig: {
        temperature: request.parameters?.temperature ?? provider.parameters.temperature,
        maxOutputTokens: request.parameters?.maxTokens ?? provider.parameters.maxTokens,
        topP: request.parameters?.topP ?? provider.parameters.topP
      }
    };

    const response = await fetch(`${provider.endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(AI_CONFIG.timeoutConfig.requestTimeout)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.candidates[0].content.parts[0].text,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0
      },
      model: provider.model,
      provider: provider.name,
      responseTime: 0
    };
  }

  private createAIError(error: any, provider: string): AIError {
    return {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'Unknown error occurred',
      provider,
      details: error
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 公共方法
  getStats() {
    return this.monitoringManager.getStats();
  }

  clearCache(): void {
    this.cacheManager.clear();
  }

  // 健康检查
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    const activeProviders = getActiveProviders();

    for (const provider of activeProviders) {
      try {
        await this.makeRequest(provider, {
          prompt: 'Hello',
          parameters: { maxTokens: 10 }
        });
        results[provider.name] = true;
      } catch (error) {
        results[provider.name] = false;
      }
    }

    return results;
  }
}

// 导出单例实例
export const aiServiceManager = new AIServiceManager();