import React, { useState, useEffect, useCallback } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, TrendingUp, BarChart3, PieChart, Activity, Zap, RefreshCw, Wifi, WifiOff, Brain } from 'lucide-react';
import { message } from 'antd';
import { useWebSocket } from '@/utils/websocket';
import { zhipuAIService } from '@/services/ai/zhipuService';

interface DataQualityIssue {
  type: 'missing_values' | 'duplicates' | 'outliers' | 'inconsistent_format';
  column: string;
  count: number;
  percentage: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

interface DataHealthReport {
  overallScore: number;
  totalRows: number;
  totalColumns: number;
  issues: DataQualityIssue[];
  suggestions: {
    issue: string;
    method: string;
    confidence: number;
    description: string;
  }[];
}

interface EDAInsight {
  type: 'correlation' | 'distribution' | 'trend' | 'anomaly';
  title: string;
  description: string;
  confidence: number;
  visualization?: {
    type: 'histogram' | 'scatter' | 'heatmap' | 'line';
    data: any;
  };
}

const DataButler: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'health' | 'eda' | 'repair'>('upload');
  const [wsConnected, setWsConnected] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<{[key: string]: number}>({});
  
  const {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
    onConnect,
    onDisconnect,
    onError,
    isConnected
  } = useWebSocket();
  
  // 模拟数据健康报告
  const [healthReport, setHealthReport] = useState<DataHealthReport>({
    overallScore: 78,
    totalRows: 10000,
    totalColumns: 15,
    issues: [
      {
        type: 'missing_values',
        column: 'age',
        count: 150,
        percentage: 1.5,
        severity: 'medium',
        description: '年龄字段存在缺失值，可能影响分析结果'
      },
      {
        type: 'outliers',
        column: 'income',
        count: 45,
        percentage: 0.45,
        severity: 'low',
        description: '收入字段存在异常值，建议进一步检查'
      },
      {
        type: 'duplicates',
        column: 'user_id',
        count: 23,
        percentage: 0.23,
        severity: 'high',
        description: '用户ID存在重复，需要去重处理'
      }
    ],
    suggestions: [
      {
        issue: 'missing_values',
        method: 'mean_imputation',
        confidence: 0.85,
        description: '使用均值填充缺失的年龄数据'
      },
      {
        issue: 'duplicates',
        method: 'remove_duplicates',
        confidence: 0.95,
        description: '删除重复的用户ID记录'
      },
      {
        issue: 'outliers',
        method: 'iqr_filtering',
        confidence: 0.75,
        description: '使用IQR方法过滤收入异常值'
      }
    ]
  });

  // 模拟EDA洞察
  const [edaInsights, setEdaInsights] = useState<EDAInsight[]>([
    {
      type: 'correlation',
      title: '年龄与收入正相关',
      description: '年龄和收入之间存在强正相关关系（r=0.65），年龄越大收入越高',
      confidence: 0.89,
      visualization: {
        type: 'scatter',
        data: { correlation: 0.65 }
      }
    },
    {
      type: 'distribution',
      title: '性别分布相对均衡',
      description: '数据集中男性占52%，女性占48%，性别分布较为均衡',
      confidence: 0.95,
      visualization: {
        type: 'histogram',
        data: { male: 52, female: 48 }
      }
    },
    {
      type: 'trend',
      title: '收入呈正态分布',
      description: '收入数据呈现正态分布特征，均值为65000，标准差为15000',
      confidence: 0.82,
      visualization: {
        type: 'histogram',
        data: { mean: 65000, std: 15000 }
      }
    }
  ]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      if (isConnected) {
        // 通过WebSocket通知服务器文件上传完成
        send({
          type: 'file_uploaded',
          payload: {
            fileId: Date.now(),
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
          }
        });
      } else {
        // 离线模式直接进行本地分析
        message.info('离线模式：使用本地分析');
      }
      
      setActiveTab('health');
      startAnalysis();
    }
  }, [isConnected, send]);

  const performAIAnalysis = useCallback(async (file: File) => {
    try {
      setIsAnalyzing(true);
      
      // 读取文件内容
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      // 准备分析请求
      const analysisRequest = {
        dataSource: file.name,
        analysisType: 'statistical',
        dataContent: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          content: fileContent.substring(0, 5000) // 限制内容长度避免API超限
        },
        parameters: {
          temperature: 0.3,
          maxTokens: 2000
        }
      };

      // 调用智谱AI进行分析
      const result = await zhipuAIService.executeMultiAgentAnalysis(
        analysisRequest,
        (progress) => {
          console.log('AI分析进度:', progress);
          // 可以在这里更新进度显示
        }
      );

      if (result.success && result.data) {
        // 解析AI分析结果并更新UI
        const analysisData = result.data;
        
        // 生成数据质量报告
        const newHealthReport: DataHealthReport = {
          overallScore: Math.round(result.data.confidence * 100),
          totalRows: Math.floor(Math.random() * 5000) + 1000, // 模拟数据行数
          totalColumns: Math.floor(Math.random() * 20) + 5, // 模拟数据列数
          issues: [
            {
              type: 'missing_values',
              column: '数据列',
              count: Math.floor(Math.random() * 100),
              percentage: Math.random() * 5,
              severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
              description: analysisData.insights[0] || 'AI检测到数据质量问题'
            }
          ],
          suggestions: [
            {
              issue: 'data_quality',
              method: 'ai_analysis',
              confidence: result.data.confidence,
              description: analysisData.recommendations[0] || '基于AI分析的改进建议'
            }
          ]
        };
        
        setHealthReport(newHealthReport);
        
        // 生成EDA洞察
        const newEdaInsights: EDAInsight[] = [
          {
            type: 'correlation',
            title: 'AI数据模式分析',
            description: analysisData.analysis || '基于智谱AI的深度数据分析结果',
            confidence: result.data.confidence,
            visualization: {
              type: 'scatter',
              data: { aiAnalysis: true, confidence: result.data.confidence }
            }
          }
        ];
        
        setEdaInsights(newEdaInsights);
        
        message.success('AI数据分析完成！');
      } else {
        message.error('AI分析失败: ' + (result.error || '未知错误'));
      }
    } catch (error) {
      console.error('AI分析错误:', error);
      message.error('数据分析失败，请检查文件格式或稍后重试');
    } finally {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }
  }, []);

  const startAnalysis = useCallback(() => {
    setIsAnalyzing(true);
    
    if (isConnected && uploadedFile) {
      // 通过WebSocket请求分析
      send({
        type: 'analyze_file',
        payload: { fileName: uploadedFile.name }
      });
    }
    
    // 如果有上传的文件，使用AI进行分析
    if (uploadedFile) {
      performAIAnalysis(uploadedFile);
    } else {
      // 模拟分析过程（离线模式或备用方案）
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisComplete(true);
      }, 3000);
    }
  }, [isConnected, send, uploadedFile, performAIAnalysis]);
  
  // WebSocket连接管理
  useEffect(() => {
    // 连接WebSocket
    connect();
    
    // 监听连接状态
    const unsubscribeConnect = onConnect(() => {
      setWsConnected(true);
      if (typeof message !== 'undefined') {
        message.success('AI数据管家实时服务已连接');
      }
    });
    
    const unsubscribeDisconnect = onDisconnect(() => {
      setWsConnected(false);
      if (typeof message !== 'undefined') {
        message.warning('AI数据管家实时服务已断开');
      }
    });
    
    const unsubscribeError = onError((error) => {
      console.error('WebSocket error:', error);
      if (typeof message !== 'undefined') {
        message.error('实时服务连接错误');
      }
    });
    
    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeError();
      disconnect();
    };
  }, []);
  
  // 订阅数据分析更新
  useEffect(() => {
    if (!isConnected) return;
    
    const unsubscribeAnalysisUpdates = subscribe('data_analysis_updates', {
      onMessage: (data) => {
        console.log('Received analysis update:', data);
        
        switch (data.type) {
          case 'health_report':
            setHealthReport(data.result);
            break;
          case 'eda_results':
            setEdaInsights(data.result);
            break;
          case 'analysis_progress':
            setAnalysisProgress(prev => ({
              ...prev,
              [data.fileId]: data.progress
            }));
            break;
        }
      }
    });
    
    return () => {
      unsubscribeAnalysisUpdates();
    };
  }, [isConnected, subscribe]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'low': return <AlertTriangle className="w-4 h-4 text-blue-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">AI数据管家</h1>
              <p className="text-gray-600">智能数据质量评估、EDA分析和修复建议</p>
            </div>
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-2">
                {wsConnected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">AI服务在线</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">离线模式</span>
                  </>
                )}
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Brain className="w-4 h-4" />
                <span>AI助手</span>
              </button>
            </div>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'upload', name: '数据上传', icon: Upload },
                { id: 'health', name: '健康报告', icon: Activity },
                { id: 'eda', name: 'EDA分析', icon: BarChart3 },
                { id: 'repair', name: '智能修复', icon: Zap }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* 数据上传标签页 */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">上传数据文件</h3>
              <p className="text-gray-600 mb-6">支持 CSV、Excel、JSON 格式文件，最大 100MB</p>
              
              <div className="max-w-md mx-auto">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileText className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">点击上传</span> 或拖拽文件到此处
                    </p>
                    <p className="text-xs text-gray-500">CSV, XLSX, JSON (最大 100MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.json"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {uploadedFile && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-900 font-medium">{uploadedFile.name}</span>
                    <span className="text-blue-600">({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 数据健康报告标签页 */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            {isAnalyzing ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <RefreshCw className="mx-auto h-12 w-12 text-blue-500 animate-spin mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">正在分析数据质量...</h3>
                <p className="text-gray-600">请稍候，AI正在检测数据质量问题</p>
              </div>
            ) : (
              <>
                {/* 总体健康评分 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">数据健康评分</h2>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${getScoreColor(healthReport.overallScore)}`}>
                          {healthReport.overallScore}
                        </div>
                        <div className="text-sm text-gray-500">总分 100</div>
                      </div>
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        healthReport.overallScore >= 80 ? 'bg-green-100' :
                        healthReport.overallScore >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        {healthReport.overallScore >= 80 ? 
                          <CheckCircle className="w-8 h-8 text-green-600" /> :
                          <AlertTriangle className="w-8 h-8 text-yellow-600" />
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{healthReport.totalRows.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">总行数</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{healthReport.totalColumns}</div>
                      <div className="text-sm text-gray-600">总列数</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{healthReport.issues.length}</div>
                      <div className="text-sm text-gray-600">发现问题</div>
                    </div>
                  </div>
                </div>

                {/* 问题详情 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">数据质量问题</h3>
                  <div className="space-y-4">
                    {healthReport.issues.map((issue, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {getSeverityIcon(issue.severity)}
                            <div>
                              <h4 className="font-medium text-gray-900">{issue.column} 字段</h4>
                              <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{issue.count} 条</div>
                            <div className="text-sm text-gray-500">{issue.percentage}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* EDA分析标签页 */}
        {activeTab === 'eda' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">探索性数据分析 (EDA)</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {edaInsights.map((insight, index) => (
                  <div key={index} className="p-6 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {insight.type === 'correlation' && <TrendingUp className="w-5 h-5 text-blue-500" />}
                        {insight.type === 'distribution' && <BarChart3 className="w-5 h-5 text-green-500" />}
                        {insight.type === 'trend' && <Activity className="w-5 h-5 text-purple-500" />}
                        {insight.type === 'anomaly' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                        <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                      </div>
                      <span className="text-sm text-gray-500">{Math.round(insight.confidence * 100)}% 置信度</span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{insight.description}</p>
                    
                    {/* 简化的可视化占位符 */}
                    <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <PieChart className="w-8 h-8 mx-auto mb-2" />
                        <div className="text-sm">图表可视化</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 智能修复标签页 */}
        {activeTab === 'repair' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">智能修复建议</h2>
            
            <div className="space-y-4">
              {healthReport.suggestions.map((suggestion, index) => (
                <div key={index} className="p-6 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{suggestion.method.replace('_', ' ').toUpperCase()}</h3>
                      <p className="text-gray-600">{suggestion.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-2">置信度</div>
                      <div className="font-semibold text-blue-600">{Math.round(suggestion.confidence * 100)}%</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">自动修复可用</span>
                    </div>
                    <div className="space-x-2">
                      <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        预览
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        应用修复
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">批量修复</span>
              </div>
              <p className="text-blue-800 text-sm mb-4">应用所有推荐的修复策略，预计可提升数据质量评分至 92 分</p>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                一键修复所有问题
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataButler;