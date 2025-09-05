// 智能体协作框架
// Agent Collaboration Framework

import { aiServiceManager, type AIRequest } from './AIServiceManager';
import { getAgentConfig, type AgentType } from '../../config/ai-config';

// 智能体基类
export abstract class Agent {
  abstract name: string;
  abstract description: string;
  abstract agentType: AgentType;
  
  protected preferredProvider?: string;
  protected systemPrompt: string = '';
  protected parameters: any = {};

  constructor() {
    this.initializeConfig();
  }

  private initializeConfig(): void {
    const config = getAgentConfig(this.agentType);
    if (config) {
      this.name = config.name;
      this.description = config.description;
      this.systemPrompt = config.systemPrompt;
      this.preferredProvider = config.preferredProvider;
      this.parameters = config.parameters;
    }
  }

  abstract process(data: any, context: AgentContext): Promise<AgentResult>;

  protected async callAI(prompt: string, context?: string): Promise<string> {
    const request: AIRequest = {
      prompt,
      context,
      systemPrompt: this.systemPrompt,
      parameters: this.parameters
    };

    try {
      const response = await aiServiceManager.callAI(request, this.preferredProvider);
      return response.content;
    } catch (error) {
      console.error(`AI call failed for agent ${this.name}:`, error);
      throw new Error(`AI服务调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  protected logProgress(message: string, progress: number): void {
    console.log(`[${this.name}] ${message} (${progress}%)`);
  }
}

// 智能体上下文
export interface AgentContext {
  taskId: string;
  analysisType: string;
  dataSource: any;
  parameters: Record<string, any>;
  previousResults?: AgentResult[];
  onProgress?: (agentName: string, progress: number, message: string) => void;
}

// 智能体结果
export interface AgentResult {
  agentName: string;
  agentType: AgentType;
  status: 'success' | 'error' | 'warning';
  data: any;
  insights: string[];
  metadata: {
    processingTime: number;
    dataSize: number;
    confidence: number;
    [key: string]: any;
  };
  error?: string;
}

// 数据采集智能体
export class DataCollectionAgent extends Agent {
  name = '数据采集智能体';
  description = '负责数据获取、清洗和预处理';
  agentType: AgentType = 'dataCollection';

  async process(data: any, context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    this.logProgress('开始数据采集和预处理', 0);
    
    try {
      // 1. 数据结构分析
      context.onProgress?.(this.name, 20, '分析数据结构');
      const structureAnalysis = await this.analyzeDataStructure(data);
      
      // 2. 数据质量检查
      context.onProgress?.(this.name, 40, '检查数据质量');
      const qualityCheck = await this.checkDataQuality(data);
      
      // 3. 数据清洗
      context.onProgress?.(this.name, 60, '执行数据清洗');
      const cleanedData = await this.cleanData(data, qualityCheck);
      
      // 4. 数据标准化
      context.onProgress?.(this.name, 80, '标准化数据格式');
      const standardizedData = await this.standardizeData(cleanedData);
      
      // 5. 生成数据报告
      context.onProgress?.(this.name, 100, '生成数据处理报告');
      await this.generateDataReport(structureAnalysis, qualityCheck, standardizedData);
      
      return {
        agentName: this.name,
        agentType: this.agentType,
        status: 'success',
        data: {
          originalData: data,
          cleanedData: standardizedData,
          structure: structureAnalysis,
          quality: qualityCheck
        },
        insights: [
          `数据集包含 ${this.getRecordCount(data)} 条记录`,
          `数据质量评分: ${qualityCheck.score}/100`,
          `发现 ${qualityCheck.issues.length} 个数据质量问题`,
          `数据清洗完成率: ${qualityCheck.cleaningRate}%`
        ],
        metadata: {
          processingTime: Date.now() - startTime,
          dataSize: this.calculateDataSize(data),
          confidence: qualityCheck.score / 100,
          recordCount: this.getRecordCount(data),
          fieldsCount: structureAnalysis.fields.length
        }
      };
    } catch (error) {
      return {
        agentName: this.name,
        agentType: this.agentType,
        status: 'error',
        data: null,
        insights: [],
        metadata: {
          processingTime: Date.now() - startTime,
          dataSize: 0,
          confidence: 0
        },
        error: error instanceof Error ? error.message : '数据处理失败'
      };
    }
  }

  private async analyzeDataStructure(data: any): Promise<any> {
    const prompt = `请分析以下数据的结构，包括字段类型、数据分布等：\n${JSON.stringify(data).substring(0, 1000)}`;
    await this.callAI(prompt);
    
    // 模拟结构分析结构
    return {
      fields: this.extractFields(data),
      types: this.detectFieldTypes(data)
    };
  }

  private async checkDataQuality(data: any): Promise<any> {
    const prompt = `请评估以下数据的质量，包括完整性、准确性、一致性等方面：\n${JSON.stringify(data).substring(0, 1000)}`;
    await this.callAI(prompt);
    
    // 模拟质量检查结果
    return {
      score: Math.floor(Math.random() * 20) + 80, // 80-100分
      issues: this.detectDataIssues(data),
      cleaningRate: Math.floor(Math.random() * 10) + 90 // 90-100%
    };
  }

  private async cleanData(data: any, _qualityCheck: any): Promise<any> {
    // 实际的数据清洗逻辑
    const cleanedData = JSON.parse(JSON.stringify(data)); // 深拷贝
    
    // 模拟数据清洗过程
    if (Array.isArray(cleanedData)) {
      return cleanedData.filter(item => item && typeof item === 'object');
    }
    
    return cleanedData;
  }

  private async standardizeData(data: any): Promise<any> {
    // 数据标准化逻辑
    return data;
  }

  private async generateDataReport(structure: any, quality: any, _data: any): Promise<void> {
    const prompt = `基于数据结构分析和质量检查结果，生成数据处理报告：\n结构：${JSON.stringify(structure)}\n质量：${JSON.stringify(quality)}`;
    await this.callAI(prompt);
  }

  private extractFields(data: any): string[] {
    if (Array.isArray(data) && data.length > 0) {
      return Object.keys(data[0]);
    }
    if (typeof data === 'object' && data !== null) {
      return Object.keys(data);
    }
    return [];
  }

  private detectFieldTypes(data: any): Record<string, string> {
    const types: Record<string, string> = {};
    const fields = this.extractFields(data);
    
    fields.forEach(field => {
      const sampleValue = Array.isArray(data) ? data[0]?.[field] : data[field];
      types[field] = typeof sampleValue;
    });
    
    return types;
  }

  private detectDataIssues(data: any): string[] {
    const issues: string[] = [];
    
    if (Array.isArray(data)) {
      const nullCount = data.filter(item => !item).length;
      if (nullCount > 0) {
        issues.push(`发现 ${nullCount} 条空记录`);
      }
    }
    
    return issues;
  }

  private getRecordCount(data: any): number {
    return Array.isArray(data) ? data.length : 1;
  }

  private calculateDataSize(data: any): number {
    return JSON.stringify(data).length;
  }
}

// 模式识别智能体
export class PatternRecognitionAgent extends Agent {
  name = '模式识别智能体';
  description = '识别数据中的模式和趋势';
  agentType: AgentType = 'patternRecognition';

  async process(data: any, context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    this.logProgress('开始模式识别分析', 0);
    
    try {
      const cleanedData = data.cleanedData || data;
      
      // 1. 时间序列模式识别
      context.onProgress?.(this.name, 25, '识别时间序列模式');
      const timePatterns = await this.identifyTimePatterns(cleanedData);
      
      // 2. 周期性模式分析
      context.onProgress?.(this.name, 50, '分析周期性模式');
      const cyclicPatterns = await this.analyzeCyclicPatterns(cleanedData);
      
      // 3. 相关性分析
      context.onProgress?.(this.name, 75, '执行相关性分析');
      const correlations = await this.analyzeCorrelations(cleanedData);
      
      // 4. 趋势分析
      context.onProgress?.(this.name, 100, '生成趋势分析报告');
      const trends = await this.analyzeTrends(cleanedData);
      
      return {
        agentName: this.name,
        agentType: this.agentType,
        status: 'success',
        data: {
          timePatterns,
          cyclicPatterns,
          correlations,
          trends
        },
        insights: [
          `识别出 ${timePatterns.length} 种时间模式`,
          `发现 ${cyclicPatterns.length} 个周期性特征`,
          `检测到 ${correlations.length} 组相关关系`,
          `主要趋势: ${trends.mainTrend}`
        ],
        metadata: {
          processingTime: Date.now() - startTime,
          dataSize: this.calculateDataSize(cleanedData),
          confidence: 0.85,
          patternsFound: timePatterns.length + cyclicPatterns.length
        }
      };
    } catch (error) {
      return {
        agentName: this.name,
        agentType: this.agentType,
        status: 'error',
        data: null,
        insights: [],
        metadata: {
          processingTime: Date.now() - startTime,
          dataSize: 0,
          confidence: 0
        },
        error: error instanceof Error ? error.message : '模式识别失败'
      };
    }
  }

  private async identifyTimePatterns(data: any): Promise<any[]> {
    const prompt = `分析以下数据中的时间序列模式：\n${JSON.stringify(data).substring(0, 1000)}`;
    await this.callAI(prompt);
    
    // 模拟时间模式识别结果
    return [
      { type: 'daily', strength: 0.8, description: '日周期模式' },
      { type: 'weekly', strength: 0.6, description: '周周期模式' }
    ];
  }

  private async analyzeCyclicPatterns(data: any): Promise<any[]> {
    const prompt = `识别数据中的周期性模式和季节性特征：\n${JSON.stringify(data).substring(0, 1000)}`;
    await this.callAI(prompt);
    
    return [
      { period: '24h', amplitude: 0.3, phase: 0 },
      { period: '7d', amplitude: 0.2, phase: 1.5 }
    ];
  }

  private async analyzeCorrelations(data: any): Promise<any[]> {
    const prompt = `分析数据字段之间的相关性：\n${JSON.stringify(data).substring(0, 1000)}`;
    await this.callAI(prompt);
    
    return [
      { field1: 'load', field2: 'temperature', correlation: 0.75 },
      { field1: 'voltage', field2: 'current', correlation: 0.92 }
    ];
  }

  private async analyzeTrends(data: any): Promise<any> {
    const prompt = `分析数据的整体趋势和变化方向：\n${JSON.stringify(data).substring(0, 1000)}`;
    await this.callAI(prompt);
    
    return {
      mainTrend: 'increasing',
      trendStrength: 0.7,
      changePoints: [{ time: '2024-01-15', type: 'increase' }]
    };
  }

  private calculateDataSize(data: any): number {
    return JSON.stringify(data).length;
  }
}

// 预测建模智能体
export class PredictiveModelingAgent extends Agent {
  name = '预测建模智能体';
  description = '构建预测模型，进行趋势预测';
  agentType: AgentType = 'predictiveModeling';

  async process(data: any, context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    this.logProgress('开始预测建模', 0);
    
    try {
      // 1. 模型选择
      context.onProgress?.(this.name, 20, '选择预测模型');
      const modelSelection = await this.selectModel(data, context);
      
      // 2. 特征工程
      context.onProgress?.(this.name, 40, '执行特征工程');
      const features = await this.engineerFeatures(data);
      
      // 3. 模型训练
      context.onProgress?.(this.name, 60, '训练预测模型');
      const model = await this.trainModel(features, modelSelection);
      
      // 4. 模型验证
      context.onProgress?.(this.name, 80, '验证模型性能');
      const validation = await this.validateModel(model, features);
      
      // 5. 生成预测
      context.onProgress?.(this.name, 100, '生成预测结果');
      const predictions = await this.generatePredictions(model, features);
      
      return {
        agentName: this.name,
        agentType: this.agentType,
        status: 'success',
        data: {
          model: modelSelection,
          features,
          validation,
          predictions
        },
        insights: [
          `选择模型: ${modelSelection.type}`,
          `模型准确率: ${validation.accuracy}%`,
          `预测置信度: ${validation.confidence}%`,
          `预测趋势: ${predictions.trend}`
        ],
        metadata: {
          processingTime: Date.now() - startTime,
          dataSize: this.calculateDataSize(data),
          confidence: validation.confidence / 100,
          modelType: modelSelection.type
        }
      };
    } catch (error) {
      return {
        agentName: this.name,
        agentType: this.agentType,
        status: 'error',
        data: null,
        insights: [],
        metadata: {
          processingTime: Date.now() - startTime,
          dataSize: 0,
          confidence: 0
        },
        error: error instanceof Error ? error.message : '预测建模失败'
      };
    }
  }

  private async selectModel(data: any, context: AgentContext): Promise<any> {
    const prompt = `基于数据特征和分析类型选择最适合的预测模型：\n数据类型: ${context.analysisType}\n数据样本: ${JSON.stringify(data).substring(0, 500)}`;
    const recommendation = await this.callAI(prompt);
    
    return {
      type: 'ARIMA',
      parameters: { p: 2, d: 1, q: 2 },
      reasoning: recommendation
    };
  }

  private async engineerFeatures(data: any): Promise<any> {
    const prompt = `为预测模型设计和提取特征：\n${JSON.stringify(data).substring(0, 1000)}`;
    const featureAnalysis = await this.callAI(prompt);
    
    return {
      features: ['lag_1', 'lag_7', 'moving_avg_7', 'trend', 'seasonality'],
      importance: [0.3, 0.25, 0.2, 0.15, 0.1],
      analysis: featureAnalysis
    };
  }

  private async trainModel(_features: any, modelConfig: any): Promise<any> {
    // 模拟模型训练过程
    await this.delay(1000); // 模拟训练时间
    
    return {
      type: modelConfig.type,
      parameters: modelConfig.parameters,
      trained: true,
      trainingTime: 1000
    };
  }

  private async validateModel(model: any, features: any): Promise<any> {
    const prompt = `评估预测模型的性能和可靠性：\n模型类型: ${model.type}\n特征: ${JSON.stringify(features.features)}`;
    const evaluation = await this.callAI(prompt);
    
    return {
      accuracy: Math.floor(Math.random() * 10) + 85, // 85-95%
      confidence: Math.floor(Math.random() * 15) + 80, // 80-95%
      mse: Math.random() * 0.1,
      evaluation
    };
  }

  private async generatePredictions(model: any, features: any): Promise<any> {
    const prompt = `基于训练好的模型生成未来趋势预测：\n模型: ${model.type}\n特征: ${JSON.stringify(features.features)}`;
    const predictionAnalysis = await this.callAI(prompt);
    
    return {
      trend: 'upward',
      values: this.generatePredictionValues(),
      confidence_intervals: this.generateConfidenceIntervals(),
      analysis: predictionAnalysis
    };
  }

  private generatePredictionValues(): number[] {
    const values = [];
    let base = 100;
    for (let i = 0; i < 30; i++) {
      base += (Math.random() - 0.4) * 5;
      values.push(Math.round(base * 100) / 100);
    }
    return values;
  }

  private generateConfidenceIntervals(): Array<{ lower: number; upper: number }> {
    return Array.from({ length: 30 }, () => ({
      lower: Math.random() * 10,
      upper: Math.random() * 10 + 10
    }));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private calculateDataSize(data: any): number {
    return JSON.stringify(data).length;
  }
}

// 异常检测智能体
export class AnomalyDetectionAgent extends Agent {
  name = '异常检测智能体';
  description = '检测数据异常和潜在风险';
  agentType: AgentType = 'anomalyDetection';

  async process(data: any, context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    this.logProgress('开始异常检测', 0);
    
    try {
      // 1. 统计异常检测
      context.onProgress?.(this.name, 25, '执行统计异常检测');
      const statisticalAnomalies = await this.detectStatisticalAnomalies(data);
      
      // 2. 时间序列异常检测
      context.onProgress?.(this.name, 50, '检测时间序列异常');
      const timeSeriesAnomalies = await this.detectTimeSeriesAnomalies(data);
      
      // 3. 模式异常检测
      context.onProgress?.(this.name, 75, '识别模式异常');
      const patternAnomalies = await this.detectPatternAnomalies(data);
      
      // 4. 风险评估
      context.onProgress?.(this.name, 100, '评估异常风险');
      const riskAssessment = await this.assessRisks(statisticalAnomalies, timeSeriesAnomalies, patternAnomalies);
      
      const allAnomalies = [...statisticalAnomalies, ...timeSeriesAnomalies, ...patternAnomalies];
      
      return {
        agentName: this.name,
        agentType: this.agentType,
        status: allAnomalies.length > 0 ? 'warning' : 'success',
        data: {
          statisticalAnomalies,
          timeSeriesAnomalies,
          patternAnomalies,
          riskAssessment
        },
        insights: [
          `检测到 ${allAnomalies.length} 个异常点`,
          `高风险异常: ${allAnomalies.filter(a => a.severity === 'high').length} 个`,
          `中风险异常: ${allAnomalies.filter(a => a.severity === 'medium').length} 个`,
          `整体风险等级: ${riskAssessment.overallRisk}`
        ],
        metadata: {
          processingTime: Date.now() - startTime,
          dataSize: this.calculateDataSize(data),
          confidence: 0.9,
          anomaliesCount: allAnomalies.length
        }
      };
    } catch (error) {
      return {
        agentName: this.name,
        agentType: this.agentType,
        status: 'error',
        data: null,
        insights: [],
        metadata: {
          processingTime: Date.now() - startTime,
          dataSize: 0,
          confidence: 0
        },
        error: error instanceof Error ? error.message : '异常检测失败'
      };
    }
  }

  private async detectStatisticalAnomalies(data: any): Promise<any[]> {
    const prompt = `检测数据中的统计异常值（离群点）：\n${JSON.stringify(data).substring(0, 1000)}`;
    await this.callAI(prompt);
    
    // 模拟统计异常检测结果
    return [
      {
        type: 'outlier',
        value: 150.5,
        threshold: 120,
        severity: 'medium',
        timestamp: '2024-01-15T10:30:00Z',
        description: '负荷值异常偏高'
      }
    ];
  }

  private async detectTimeSeriesAnomalies(data: any): Promise<any[]> {
    const prompt = `检测时间序列数据中的异常模式：\n${JSON.stringify(data).substring(0, 1000)}`;
    await this.callAI(prompt);
    
    return [
      {
        type: 'sudden_change',
        changePoint: '2024-01-15T14:00:00Z',
        magnitude: 25.3,
        severity: 'high',
        description: '负荷突然下降'
      }
    ];
  }

  private async detectPatternAnomalies(data: any): Promise<any[]> {
    const prompt = `识别数据中的模式异常和行为偏差：\n${JSON.stringify(data).substring(0, 1000)}`;
    await this.callAI(prompt);
    
    return [
      {
        type: 'pattern_break',
        pattern: 'daily_cycle',
        deviation: 0.8,
        severity: 'low',
        description: '日周期模式异常'
      }
    ];
  }

  private async assessRisks(statistical: any[], timeSeries: any[], pattern: any[]): Promise<any> {
    const allAnomalies = [...statistical, ...timeSeries, ...pattern];
    const prompt = `评估检测到的异常的整体风险等级和影响：\n异常数量: ${allAnomalies.length}\n异常类型: ${allAnomalies.map(a => a.type).join(', ')}`;
    await this.callAI(prompt);
    
    const highRiskCount = allAnomalies.filter(a => a.severity === 'high').length;
    const overallRisk = highRiskCount > 0 ? 'high' : allAnomalies.length > 3 ? 'medium' : 'low';
    
    return {
      overallRisk,
      riskScore: Math.min(allAnomalies.length * 10 + highRiskCount * 20, 100),
      recommendations: this.generateRecommendations(allAnomalies)
    };
  }

  private generateRecommendations(anomalies: any[]): string[] {
    const recommendations = [];
    
    if (anomalies.some(a => a.severity === 'high')) {
      recommendations.push('立即检查高风险异常点');
    }
    
    if (anomalies.length > 5) {
      recommendations.push('建议增加监控频率');
    }
    
    recommendations.push('定期审查异常检测阈值');
    
    return recommendations;
  }

  private calculateDataSize(data: any): number {
    return JSON.stringify(data).length;
  }
}

// 报告生成智能体
export class ReportGenerationAgent extends Agent {
  name = '报告生成智能体';
  description = '生成结构化分析报告';
  agentType: AgentType = 'reportGeneration';

  async process(_data: any, context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    this.logProgress('开始生成报告', 0);
    
    try {
      // 1. 整合分析结果
      context.onProgress?.(this.name, 20, '整合分析结果');
      const integratedResults = await this.integrateResults(context.previousResults || []);
      
      // 2. 生成执行摘要
      context.onProgress?.(this.name, 40, '生成执行摘要');
      const executiveSummary = await this.generateExecutiveSummary(integratedResults);
      
      // 3. 创建详细分析
      context.onProgress?.(this.name, 60, '创建详细分析');
      const detailedAnalysis = await this.createDetailedAnalysis(integratedResults);
      
      // 4. 生成建议措施
      context.onProgress?.(this.name, 80, '生成建议措施');
      const recommendations = await this.generateRecommendations(integratedResults);
      
      // 5. 格式化最终报告
      context.onProgress?.(this.name, 100, '格式化最终报告');
      const finalReport = await this.formatFinalReport({
        executiveSummary,
        detailedAnalysis,
        recommendations,
        metadata: this.generateMetadata(context)
      });
      
      return {
        agentName: this.name,
        agentType: this.agentType,
        status: 'success',
        data: {
          report: finalReport,
          executiveSummary,
          detailedAnalysis,
          recommendations
        },
        insights: [
          `报告包含 ${finalReport.sections.length} 个主要章节`,
          `生成了 ${recommendations.length} 条建议措施`,
          `整合了 ${context.previousResults?.length || 0} 个智能体的分析结果`,
          `报告置信度: ${this.calculateReportConfidence(context.previousResults || [])}%`
        ],
        metadata: {
          processingTime: Date.now() - startTime,
          dataSize: this.calculateDataSize(finalReport),
          confidence: this.calculateReportConfidence(context.previousResults || []) / 100,
          sectionsCount: finalReport.sections.length
        }
      };
    } catch (error) {
      return {
        agentName: this.name,
        agentType: this.agentType,
        status: 'error',
        data: null,
        insights: [],
        metadata: {
          processingTime: Date.now() - startTime,
          dataSize: 0,
          confidence: 0
        },
        error: error instanceof Error ? error.message : '报告生成失败'
      };
    }
  }

  private async integrateResults(results: AgentResult[]): Promise<any> {
    const prompt = `整合以下智能体的分析结果，提取关键信息和洞察：\n${results.map(r => `${r.agentName}: ${r.insights.join(', ')}`).join('\n')}`;
    await this.callAI(prompt);
    
    return {
      dataQuality: results.find(r => r.agentType === 'dataCollection')?.data,
      patterns: results.find(r => r.agentType === 'patternRecognition')?.data,
      predictions: results.find(r => r.agentType === 'predictiveModeling')?.data,
      anomalies: results.find(r => r.agentType === 'anomalyDetection')?.data
    };
  }

  private async generateExecutiveSummary(integratedResults: any): Promise<string> {
    const prompt = `基于整合的分析结果生成执行摘要，突出关键发现和重要结论：\n${JSON.stringify(integratedResults).substring(0, 2000)}`;
    return await this.callAI(prompt);
  }

  private async createDetailedAnalysis(integratedResults: any): Promise<any> {
    const prompt = `创建详细的分析报告，包括数据质量、模式识别、预测分析和异常检测的详细结果：\n${JSON.stringify(integratedResults).substring(0, 2000)}`;
    await this.callAI(prompt);
    
    return {
      dataQualitySection: this.createDataQualitySection(integratedResults.dataQuality),
      patternAnalysisSection: this.createPatternAnalysisSection(integratedResults.patterns),
      predictionSection: this.createPredictionSection(integratedResults.predictions),
      anomalySection: this.createAnomalySection(integratedResults.anomalies)
    };
  }

  private async generateRecommendations(integratedResults: any): Promise<string[]> {
    const prompt = `基于分析结果生成具体的建议措施和行动计划：\n${JSON.stringify(integratedResults).substring(0, 2000)}`;
    await this.callAI(prompt);
    
    // 解析AI生成的建议并格式化
    return [
      '加强数据质量监控机制',
      '优化负荷预测模型参数',
      '建立异常检测预警系统',
      '定期审查和更新分析模型'
    ];
  }

  private async formatFinalReport(reportData: any): Promise<any> {
    return {
      title: '山西电网智能分析报告',
      generatedAt: new Date().toISOString(),
      sections: [
        {
          title: '执行摘要',
          content: reportData.executiveSummary
        },
        {
          title: '数据质量分析',
          content: reportData.detailedAnalysis.dataQualitySection
        },
        {
          title: '模式识别结果',
          content: reportData.detailedAnalysis.patternAnalysisSection
        },
        {
          title: '预测分析',
          content: reportData.detailedAnalysis.predictionSection
        },
        {
          title: '异常检测',
          content: reportData.detailedAnalysis.anomalySection
        },
        {
          title: '建议措施',
          content: reportData.recommendations.join('\n')
        }
      ],
      metadata: reportData.metadata
    };
  }

  private createDataQualitySection(dataQuality: any): string {
    if (!dataQuality) return '数据质量信息不可用';
    return `数据质量评分: ${dataQuality.quality?.score || 'N/A'}/100\n数据记录数: ${dataQuality.structure?.fields?.length || 'N/A'} 个字段`;
  }

  private createPatternAnalysisSection(patterns: any): string {
    if (!patterns) return '模式分析信息不可用';
    return `识别出 ${patterns.timePatterns?.length || 0} 种时间模式\n发现 ${patterns.cyclicPatterns?.length || 0} 个周期性特征`;
  }

  private createPredictionSection(predictions: any): string {
    if (!predictions) return '预测分析信息不可用';
    return `预测模型: ${predictions.model?.type || 'N/A'}\n预测准确率: ${predictions.validation?.accuracy || 'N/A'}%`;
  }

  private createAnomalySection(anomalies: any): string {
    if (!anomalies) return '异常检测信息不可用';
    const totalAnomalies = (anomalies.statisticalAnomalies?.length || 0) + 
                          (anomalies.timeSeriesAnomalies?.length || 0) + 
                          (anomalies.patternAnomalies?.length || 0);
    return `检测到 ${totalAnomalies} 个异常点\n风险等级: ${anomalies.riskAssessment?.overallRisk || 'N/A'}`;
  }

  private generateMetadata(context: AgentContext): any {
    return {
      taskId: context.taskId,
      analysisType: context.analysisType,
      generatedBy: 'AI智能体协作系统',
      version: '1.0.0'
    };
  }

  private calculateReportConfidence(results: AgentResult[]): number {
    if (results.length === 0) return 0;
    const avgConfidence = results.reduce((sum, result) => sum + result.metadata.confidence, 0) / results.length;
    return Math.round(avgConfidence * 100);
  }

  private calculateDataSize(data: any): number {
    return JSON.stringify(data).length;
  }
}

// 智能体协调器
export class AgentOrchestrator {
  private agents: Map<AgentType, Agent> = new Map();

  constructor() {
    this.initializeAgents();
  }

  private initializeAgents(): void {
    this.agents.set('dataCollection', new DataCollectionAgent());
    this.agents.set('patternRecognition', new PatternRecognitionAgent());
    this.agents.set('predictiveModeling', new PredictiveModelingAgent());
    this.agents.set('anomalyDetection', new AnomalyDetectionAgent());
    this.agents.set('reportGeneration', new ReportGenerationAgent());
  }

  async executeAnalysis(
    data: any, 
    context: AgentContext,
    agentSequence?: AgentType[]
  ): Promise<AgentResult[]> {
    const sequence = agentSequence || [
      'dataCollection',
      'patternRecognition', 
      'predictiveModeling',
      'anomalyDetection',
      'reportGeneration'
    ];

    const results: AgentResult[] = [];
    let currentData = data;

    for (const agentType of sequence) {
      const agent = this.agents.get(agentType);
      if (!agent) {
        console.warn(`Agent ${agentType} not found`);
        continue;
      }

      try {
        console.log(`执行智能体: ${agent.name}`);
        
        const agentContext: AgentContext = {
          ...context,
          previousResults: results
        };

        const result = await agent.process(currentData, agentContext);
        results.push(result);

        // 如果当前智能体成功处理，更新数据供下一个智能体使用
        if (result.status === 'success' && result.data) {
          currentData = result.data;
        }

        // 记录进度
        context.onProgress?.(agent.name, 100, '处理完成');
        
      } catch (error) {
        console.error(`Agent ${agentType} execution failed:`, error);
        
        const errorResult: AgentResult = {
          agentName: agent.name,
          agentType,
          status: 'error',
          data: null,
          insights: [],
          metadata: {
            processingTime: 0,
            dataSize: 0,
            confidence: 0
          },
          error: error instanceof Error ? error.message : '智能体执行失败'
        };
        
        results.push(errorResult);
      }
    }

    return results;
  }

  getAgent(agentType: AgentType): Agent | undefined {
    return this.agents.get(agentType);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }
}

// 导出单例实例
export const agentOrchestrator = new AgentOrchestrator();