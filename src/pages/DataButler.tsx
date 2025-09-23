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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      {/* 页面标题 - 玻璃拟态风格 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              AI数据管家
            </h1>
            <p className="text-gray-300 text-lg">智能数据质量检测、异常识别与自动修复</p>
          </div>
          <motion.div
            animate={wsConnected ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={`flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-sm border ${
              wsConnected 
                ? 'bg-green-500/10 text-green-300 border-green-500/30' 
                : 'bg-red-500/10 text-red-300 border-red-500/30'
            }`}
          >
            {wsConnected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            <span className="font-medium">{wsConnected ? '在线模式' : '离线模式'}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* 标签页导航 - 玻璃拟态风格 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex space-x-2 bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
          {[
            { key: 'upload', label: '数据上传', icon: Upload },
            { key: 'health', label: '健康检测', icon: Activity },
            { key: 'eda', label: 'EDA分析', icon: BarChart3 },
            { key: 'repair', label: '智能修复', icon: Zap }
          ].map(({ key, label, icon: Icon }) => (
            <motion.button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === key
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-5 h-5" />
              {label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* 数据上传标签页 - 玻璃拟态风格 */}
      {activeTab === 'upload' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl"
        >
          <div className="text-center">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <Upload className="mx-auto h-12 w-12 text-blue-300 mb-4" />
            </motion.div>
            <h3 className="text-lg font-medium text-white mb-2">上传数据文件</h3>
            <p className="text-blue-200 mb-6">支持 CSV、Excel、JSON 格式文件，最大 100MB</p>
            
            <div className="max-w-md mx-auto">
              <motion.label
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300/50 rounded-xl cursor-pointer bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileText className="w-8 h-8 mb-2 text-blue-300" />
                  <p className="mb-2 text-sm text-blue-200">
                    <span className="font-semibold text-white">点击上传</span> 或拖拽文件到此处
                  </p>
                  <p className="text-xs text-blue-300">CSV, XLSX, JSON (最大 100MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.json"
                />
              </motion.label>
            </div>
          </div>
        </motion.div>
      )}

      {/* 健康检测标签页 */}
      {activeTab === 'health' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-6"
        >
          {/* 健康检测卡片 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-green-400" />
              数据健康检测
            </h3>
            
            {isAnalyzing ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-blue-200">正在进行数据健康检测...</p>
              </div>
            ) : analysisComplete && healthReport ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-sm text-gray-300 mb-1">总体评分</div>
                    <div className={`text-2xl font-bold ${getScoreColor(healthReport.overallScore)}`}>
                      {healthReport.overallScore}/100
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-sm text-gray-300 mb-1">问题数量</div>
                    <div className="text-2xl font-bold text-orange-400">
                      {healthReport.issues?.length || 0}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-sm text-gray-300 mb-1">修复建议</div>
                    <div className="text-2xl font-bold text-green-400">
                      {healthReport.recommendations?.length || 0}
                    </div>
                  </div>
                </div>
                
                {healthReport.issues && healthReport.issues.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">检测到的问题</h4>
                    <div className="space-y-2">
                      {healthReport.issues.map((issue, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(issue.severity)}`}>
                          <div className="flex items-center gap-2 mb-1">
                            {getSeverityIcon(issue.severity)}
                            <span className="font-medium">{issue.title}</span>
                          </div>
                          <p className="text-sm opacity-80">{issue.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>请先上传数据文件以开始健康检测</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* EDA分析标签页 */}
      {activeTab === 'eda' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              探索性数据分析
            </h3>
            
            {edaInsights && edaInsights.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {edaInsights.map((insight, index) => (
                  <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                      <h4 className="font-medium text-white">{insight.title}</h4>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{insight.description}</p>
                    <div className="text-xs text-blue-300">{insight.details}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>请先上传数据文件以开始EDA分析</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* 智能修复标签页 */}
      {activeTab === 'repair' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-purple-400" />
              智能修复建议
            </h3>
            
            {healthReport?.recommendations && healthReport.recommendations.length > 0 ? (
              <div className="space-y-3">
                {healthReport.recommendations.map((recommendation, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white mb-1">{recommendation.title}</h4>
                        <p className="text-sm text-gray-300 mb-2">{recommendation.description}</p>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors duration-200"
                            onClick={() => applyFix(recommendation)}
                          >
                            应用修复
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors duration-200"
                          >
                            查看详情
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>请先进行数据健康检测以获取修复建议</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DataButler;