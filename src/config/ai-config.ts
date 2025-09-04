// AI服务配置文件
// AI Service Configuration

export interface AIProvider {
  name: string;
  displayName: string;
  apiKey: string;
  endpoint: string;
  model: string;
  priority: number;
  isActive: boolean;
  rateLimit: number; // 每小时请求限制
  costPerRequest: number; // 每次请求成本（美元）
  parameters: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
}

// AI服务提供商配置
export const AI_PROVIDERS: Record<string, AIProvider> = {
  qwen: {
    name: 'qwen',
    displayName: '阿里千问',
    apiKey: 'sk-7c12945ced9d4c7babbb4ca7f661d055',
    endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    model: 'qwen-turbo',
    priority: 1,
    isActive: true,
    rateLimit: 100,
    costPerRequest: 0.002,
    parameters: {
      temperature: 0.7,
      maxTokens: 2000,
      topP: 0.9
    }
  },
  kimi: {
    name: 'kimi',
    displayName: 'Kimi K2',
    apiKey: 'sk-WZQkZ6W8E47DkB8uATaey76Deo09lht0nJmA6wRugPvI0Gmr',
    endpoint: 'https://api.moonshot.cn/v1/chat/completions',
    model: 'moonshot-v1-8k',
    priority: 2,
    isActive: true,
    rateLimit: 80,
    costPerRequest: 0.003,
    parameters: {
      temperature: 0.7,
      maxTokens: 2000,
      topP: 0.9
    }
  },
  zhipu: {
    name: 'zhipu',
    displayName: '智谱GLM',
    apiKey: '105722980eb8400491bfe3a56c63f13a.NnceHUU3NlhCK55m',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'glm-4',
    priority: 3,
    isActive: true,
    rateLimit: 60,
    costPerRequest: 0.0025,
    parameters: {
      temperature: 0.7,
      maxTokens: 2000,
      topP: 0.9
    }
  },
  deepseek: {
    name: 'deepseek',
    displayName: 'DeepSeek',
    apiKey: 'sk-58ef49264a7e416c896b8ce12d4b2f04',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    priority: 4,
    isActive: true,
    rateLimit: 100,
    costPerRequest: 0.001,
    parameters: {
      temperature: 0.7,
      maxTokens: 2000,
      topP: 0.9
    }
  },
  gemini: {
    name: 'gemini',
    displayName: 'Google Gemini',
    apiKey: 'AIzaSyDtK7fq5OQCl7_dOWuI6F6TJZIpKUsa2ho',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    model: 'gemini-pro',
    priority: 5,
    isActive: true,
    rateLimit: 60,
    costPerRequest: 0.0015,
    parameters: {
      temperature: 0.7,
      maxTokens: 2000,
      topP: 0.9
    }
  }
};

// AI服务配置
export const AI_CONFIG = {
  // 默认提供商
  defaultProvider: 'qwen',
  
  // 负载均衡策略
  loadBalanceStrategy: 'priority', // 'priority' | 'round_robin' | 'least_used'
  
  // 重试配置
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000, // 毫秒
    backoffMultiplier: 2
  },
  
  // 超时配置
  timeoutConfig: {
    requestTimeout: 30000, // 30秒
    connectionTimeout: 10000 // 10秒
  },
  
  // 缓存配置
  cacheConfig: {
    enabled: true,
    ttl: 3600, // 1小时
    maxSize: 1000 // 最大缓存条目数
  },
  
  // 监控配置
  monitoringConfig: {
    logRequests: true,
    logResponses: false, // 出于隐私考虑默认关闭
    trackUsage: true,
    trackCosts: true
  }
};

// 智能体配置
export const AGENT_CONFIG = {
  // 数据采集智能体
  dataCollection: {
    name: '数据采集智能体',
    description: '负责数据获取、清洗和预处理',
    systemPrompt: `你是一个专业的数据采集智能体，负责电网数据的获取、清洗和预处理。
你的主要职责包括：
1. 分析数据源结构和格式
2. 识别数据质量问题
3. 执行数据清洗和标准化
4. 生成数据质量报告
请始终保持专业和准确。`,
    preferredProvider: 'qwen',
    parameters: {
      temperature: 0.3,
      maxTokens: 1500
    }
  },
  
  // 模式识别智能体
  patternRecognition: {
    name: '模式识别智能体',
    description: '识别数据中的模式和趋势',
    systemPrompt: `你是一个专业的模式识别智能体，专门分析电网数据中的模式和趋势。
你的主要职责包括：
1. 识别数据中的周期性模式
2. 发现异常趋势和变化点
3. 分析季节性和时间序列特征
4. 提供模式分析报告
请基于数据提供客观、准确的分析结果。`,
    preferredProvider: 'kimi',
    parameters: {
      temperature: 0.5,
      maxTokens: 2000
    }
  },
  
  // 预测建模智能体
  predictiveModeling: {
    name: '预测建模智能体',
    description: '构建预测模型，进行趋势预测',
    systemPrompt: `你是一个专业的预测建模智能体，专门为电网数据构建预测模型。
你的主要职责包括：
1. 选择合适的预测算法和模型
2. 进行模型训练和验证
3. 生成未来趋势预测
4. 评估预测准确性和置信度
请提供科学、可靠的预测分析。`,
    preferredProvider: 'zhipu',
    parameters: {
      temperature: 0.4,
      maxTokens: 2000
    }
  },
  
  // 异常检测智能体
  anomalyDetection: {
    name: '异常检测智能体',
    description: '检测数据异常和潜在风险',
    systemPrompt: `你是一个专业的异常检测智能体，专门检测电网数据中的异常和潜在风险。
你的主要职责包括：
1. 识别数据中的异常值和离群点
2. 分析异常的可能原因
3. 评估异常的严重程度和影响
4. 提供异常处理建议
请保持高度的敏感性和准确性。`,
    preferredProvider: 'deepseek',
    parameters: {
      temperature: 0.3,
      maxTokens: 1800
    }
  },
  
  // 报告生成智能体
  reportGeneration: {
    name: '报告生成智能体',
    description: '生成结构化分析报告',
    systemPrompt: `你是一个专业的报告生成智能体，负责将分析结果整合成结构化的专业报告。
你的主要职责包括：
1. 整合各智能体的分析结果
2. 生成清晰、专业的报告内容
3. 提供可行的建议和结论
4. 确保报告的逻辑性和可读性
请生成高质量、专业的分析报告。`,
    preferredProvider: 'gemini',
    parameters: {
      temperature: 0.6,
      maxTokens: 3000
    }
  }
};

// 分析类型配置
export const ANALYSIS_TYPES = {
  trend: {
    name: '趋势分析',
    description: '分析数据的长期趋势和变化规律',
    agents: ['dataCollection', 'patternRecognition', 'predictiveModeling', 'reportGeneration'],
    estimatedDuration: 180 // 秒
  },
  prediction: {
    name: '预测分析',
    description: '基于历史数据预测未来趋势',
    agents: ['dataCollection', 'patternRecognition', 'predictiveModeling', 'reportGeneration'],
    estimatedDuration: 240
  },
  statistical: {
    name: '统计分析',
    description: '进行描述性统计和相关性分析',
    agents: ['dataCollection', 'patternRecognition', 'reportGeneration'],
    estimatedDuration: 120
  },
  anomaly: {
    name: '异常分析',
    description: '检测和分析数据中的异常情况',
    agents: ['dataCollection', 'anomalyDetection', 'reportGeneration'],
    estimatedDuration: 150
  },
  comparison: {
    name: '对比分析',
    description: '对比不同时期或不同指标的数据',
    agents: ['dataCollection', 'patternRecognition', 'reportGeneration'],
    estimatedDuration: 160
  }
};

// 导出配置验证函数
export function validateAIConfig(): boolean {
  try {
    // 检查所有提供商是否有有效的API密钥
    for (const [key, provider] of Object.entries(AI_PROVIDERS)) {
      if (!provider.apiKey || provider.apiKey.length < 10) {
        console.warn(`AI Provider ${key} has invalid API key`);
        return false;
      }
    }
    
    // 检查默认提供商是否存在
    if (!AI_PROVIDERS[AI_CONFIG.defaultProvider]) {
      console.error(`Default provider ${AI_CONFIG.defaultProvider} not found`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('AI Config validation failed:', error);
    return false;
  }
}

// 获取活跃的AI提供商
export function getActiveProviders(): AIProvider[] {
  return Object.values(AI_PROVIDERS)
    .filter(provider => provider.isActive)
    .sort((a, b) => a.priority - b.priority);
}

// 根据优先级获取提供商
export function getProviderByPriority(priority: number): AIProvider | null {
  return Object.values(AI_PROVIDERS)
    .find(provider => provider.priority === priority && provider.isActive) || null;
}

// 获取智能体配置
export function getAgentConfig(agentType: string) {
  return AGENT_CONFIG[agentType as keyof typeof AGENT_CONFIG] || null;
}

// 获取分析类型配置
export function getAnalysisTypeConfig(analysisType: string) {
  return ANALYSIS_TYPES[analysisType as keyof typeof ANALYSIS_TYPES] || null;
}

// 环境变量配置（用于生产环境）
export const ENV_CONFIG = {
  // 是否使用环境变量中的API密钥
  useEnvKeys: process.env.NODE_ENV === 'production',
  
  // 环境变量映射
  envKeyMapping: {
    qwen: 'VITE_QWEN_API_KEY',
    kimi: 'VITE_KIMI_API_KEY',
    zhipu: 'VITE_ZHIPU_API_KEY',
    deepseek: 'VITE_DEEPSEEK_API_KEY',
    gemini: 'VITE_GEMINI_API_KEY'
  }
};

// 获取API密钥（支持环境变量）
export function getAPIKey(providerName: string): string {
  if (ENV_CONFIG.useEnvKeys) {
    const envKey = ENV_CONFIG.envKeyMapping[providerName as keyof typeof ENV_CONFIG.envKeyMapping];
    const envValue = import.meta.env[envKey];
    if (envValue) {
      return envValue;
    }
  }
  
  const apiKey = AI_PROVIDERS[providerName]?.apiKey;
  if (!apiKey) {
    throw new Error(`API key not found for provider: ${providerName}`);
  }
  
  return apiKey;
}

// 导出类型定义
export type AIProviderName = keyof typeof AI_PROVIDERS;
export type AgentType = keyof typeof AGENT_CONFIG;
export type AnalysisType = keyof typeof ANALYSIS_TYPES;