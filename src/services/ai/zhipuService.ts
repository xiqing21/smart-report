// 智谱AI服务
import { AI_PROVIDERS, AGENT_CONFIG } from '../../config/ai-config';

export interface AIAnalysisRequest {
  dataSource: string;
  analysisType: string;
  dataContent: any;
  parameters?: {
    temperature?: number;
    maxTokens?: number;
  };
}

export interface AIAnalysisResponse {
  success: boolean;
  data?: {
    analysis: string;
    insights: string[];
    recommendations: string[];
    confidence: number;
    metadata: {
      model: string;
      timestamp: string;
      processingTime: number;
    };
  };
  error?: string;
}

export interface AgentProgress {
  agentName: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  message: string;
  result?: any;
}

class ZhipuAIService {
  private apiKey: string;
  private endpoint: string;
  private model: string;

  constructor() {
    const provider = AI_PROVIDERS.zhipu;
    this.apiKey = import.meta.env.VITE_ZHIPU_API_KEY || provider.apiKey;
    this.endpoint = provider.endpoint;
    this.model = provider.model;
  }

  // 调用智谱AI API
  private async callZhipuAPI(prompt: string, parameters?: any): Promise<string> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: parameters?.temperature || 0.7,
          max_tokens: parameters?.maxTokens || 2000,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '分析结果为空';
    } catch (error) {
      console.error('智谱AI API调用错误:', error);
      throw error;
    }
  }

  // 执行单个智能体分析
  private async executeAgent(
    agentType: string, 
    dataContent: any, 
    onProgress?: (progress: AgentProgress) => void
  ): Promise<string> {
    const agentConfig = AGENT_CONFIG[agentType as keyof typeof AGENT_CONFIG];
    if (!agentConfig) {
      throw new Error(`未找到智能体配置: ${agentType}`);
    }

    onProgress?.({
      agentName: agentConfig.name,
      status: 'running',
      progress: 0,
      message: '正在分析数据...'
    });

    // 构建分析提示词
    const prompt = `${agentConfig.systemPrompt}

请分析以下数据：
${JSON.stringify(dataContent, null, 2)}

请提供详细的分析结果。`;

    try {
      const result = await this.callZhipuAPI(prompt, agentConfig.parameters);
      
      onProgress?.({
        agentName: agentConfig.name,
        status: 'completed',
        progress: 100,
        message: '分析完成',
        result
      });

      return result;
    } catch (error) {
      onProgress?.({
        agentName: agentConfig.name,
        status: 'error',
        progress: 0,
        message: `分析失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
      throw error;
    }
  }

  // 执行多智能体协作分析
  async executeMultiAgentAnalysis(
    request: AIAnalysisRequest,
    onProgress?: (progress: AgentProgress) => void
  ): Promise<AIAnalysisResponse> {
    const startTime = Date.now();
    
    try {
      // 根据分析类型确定需要的智能体
      const analysisConfig = {
        trend: ['dataCollection', 'patternRecognition', 'predictiveModeling', 'reportGeneration'],
        prediction: ['dataCollection', 'patternRecognition', 'predictiveModeling', 'reportGeneration'],
        statistical: ['dataCollection', 'patternRecognition', 'reportGeneration'],
        anomaly: ['dataCollection', 'anomalyDetection', 'reportGeneration'],
        comparison: ['dataCollection', 'patternRecognition', 'reportGeneration']
      };

      const agents = analysisConfig[request.analysisType as keyof typeof analysisConfig] || 
                    analysisConfig.trend;

      const results: { [key: string]: string } = {};
      
      // 依次执行各个智能体
      for (let i = 0; i < agents.length; i++) {
        const agentType = agents[i];
        const result = await this.executeAgent(agentType, request.dataContent, onProgress);
        results[agentType] = result;
        
        // 模拟处理时间
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 生成最终分析报告
      const finalAnalysis = results.reportGeneration || Object.values(results).join('\n\n');
      
      // 提取洞察和建议
      const insights = this.extractInsights(finalAnalysis);
      const recommendations = this.extractRecommendations(finalAnalysis);

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          analysis: finalAnalysis,
          insights,
          recommendations,
          confidence: 0.85,
          metadata: {
            model: this.model,
            timestamp: new Date().toISOString(),
            processingTime
          }
        }
      };
    } catch (error) {
      console.error('多智能体分析失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '分析失败'
      };
    }
  }

  // 提取洞察
  private extractInsights(analysis: string): string[] {
    const insights: string[] = [];
    
    // 简单的关键词提取逻辑
    const keywordPatterns = [
      /发现.*?趋势/g,
      /显示.*?模式/g,
      /表明.*?特征/g,
      /呈现.*?规律/g
    ];

    keywordPatterns.forEach(pattern => {
      const matches = analysis.match(pattern);
      if (matches) {
        insights.push(...matches);
      }
    });

    return insights.slice(0, 5); // 最多返回5个洞察
  }

  // 提取建议
  private extractRecommendations(analysis: string): string[] {
    const recommendations: string[] = [];
    
    // 简单的建议提取逻辑
    const recommendationPatterns = [
      /建议.*?[。！]/g,
      /应该.*?[。！]/g,
      /需要.*?[。！]/g,
      /可以.*?[。！]/g
    ];

    recommendationPatterns.forEach(pattern => {
      const matches = analysis.match(pattern);
      if (matches) {
        recommendations.push(...matches);
      }
    });

    return recommendations.slice(0, 5); // 最多返回5个建议
  }
}

export const zhipuAIService = new ZhipuAIService();
export default zhipuAIService;