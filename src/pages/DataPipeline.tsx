import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Progress, Tabs, Select, Input, Space, Tag, Tooltip, Modal, Slider, Switch, message } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StopOutlined, ReloadOutlined, SettingOutlined, EyeOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Play, Pause, Square, RotateCcw, Settings, Eye, Trash2, Edit3, Activity, Clock, CheckCircle, AlertCircle, XCircle, Wifi, WifiOff, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWebSocket } from '@/utils/websocket';

interface TaskNode {
  id: string;
  name: string;
  type: 'input' | 'process' | 'output';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  duration?: number;
  error?: string;
}

interface ProcessingTask {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  nodes: TaskNode[];
  startTime?: Date;
  estimatedTime?: number;
}

const DataPipeline: React.FC = () => {
  const [tasks, setTasks] = useState<ProcessingTask[]>([
    {
      id: 'task-1',
      name: '电网负荷数据处理',
      status: 'running',
      progress: 65,
      startTime: new Date(Date.now() - 300000), // 5分钟前开始
      estimatedTime: 480000, // 8分钟预计完成
      nodes: [
        { id: 'node-1', name: '数据加载', type: 'input', status: 'completed', progress: 100, duration: 30 },
        { id: 'node-2', name: '数据验证', type: 'process', status: 'completed', progress: 100, duration: 45 },
        { id: 'node-3', name: '数据清洗', type: 'process', status: 'running', progress: 75, duration: 120 },
        { id: 'node-4', name: '特征工程', type: 'process', status: 'pending', progress: 0 },
        { id: 'node-5', name: '模型分析', type: 'process', status: 'pending', progress: 0 },
        { id: 'node-6', name: '结果生成', type: 'output', status: 'pending', progress: 0 }
      ]
    }
  ]);

  const [selectedTask, setSelectedTask] = useState<string | null>('task-1');
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isControlPanelVisible, setIsControlPanelVisible] = useState(false);
  const [controlParams, setControlParams] = useState({
    batchSize: 100,
    parallelism: 4,
    retryCount: 3,
    timeout: 30,
    enableLogging: true,
    enableMetrics: true
  });
  const [wsConnected, setWsConnected] = useState(false);
  
  const {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    pauseTask,
    resumeTask,
    cancelTask,
    restartTask,
    updateTaskParams,
    onConnect,
    onDisconnect,
    onError,
    isConnected,
    connectionInfo
  } = useWebSocket();

  // WebSocket连接管理
  useEffect(() => {
    // 连接WebSocket
    connect();
    
    // 监听连接状态
    const unsubscribeConnect = onConnect(() => {
      setWsConnected(true);
      message.success('实时通信已连接');
    });
    
    const unsubscribeDisconnect = onDisconnect(() => {
      setWsConnected(false);
      message.warning('实时通信已断开');
    });
    
    const unsubscribeError = onError((error) => {
      console.error('WebSocket error:', error);
      message.error('实时通信连接错误');
    });
    
    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeError();
      disconnect();
    };
  }, []);
  
  // 订阅任务更新
  useEffect(() => {
    if (!isConnected) return;
    
    const unsubscribeTaskUpdates = subscribe('task_updates', {
      onMessage: (data) => {
        console.log('Received task update:', data);
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === data.taskId ? {
              ...task,
              ...data.updates,
              lastUpdated: new Date().toLocaleTimeString()
            } : task
          )
        );
      }
    });
    
    const unsubscribeTaskControl = subscribe('task_control_response', {
      onMessage: (data) => {
        if (data.success) {
          message.success(`任务 ${data.action} 操作成功`);
        } else {
          message.error(`任务 ${data.action} 操作失败: ${data.error}`);
        }
      }
    });
    
    return () => {
      unsubscribeTaskUpdates();
      unsubscribeTaskControl();
    };
  }, [isConnected, subscribe]);
  
  // 模拟实时数据更新（当WebSocket未连接时的备用方案）
  useEffect(() => {
    if (isConnected) return; // 如果WebSocket已连接，不使用模拟数据
    
    const interval = setInterval(() => {
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.status === 'running') {
            const updatedNodes = task.nodes.map(node => {
              if (node.status === 'running' && node.progress < 100) {
                return { ...node, progress: Math.min(node.progress + Math.random() * 5, 100) };
              }
              return node;
            });
            
            const overallProgress = updatedNodes.reduce((sum, node) => sum + node.progress, 0) / updatedNodes.length;
            return { ...task, progress: overallProgress, nodes: updatedNodes };
          }
          return task;
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'running': return <Zap className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'paused': return <Pause className="w-5 h-5 text-yellow-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'running': return '运行中';
      case 'failed': return '失败';
      case 'paused': return '已暂停';
      case 'pending': return '待处理';
      default: return '未知';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-300';
    }
  };

  const handleTaskControl = useCallback((taskId: string, action: 'play' | 'pause' | 'stop') => {
    if (isConnected) {
      // 使用WebSocket发送任务控制命令
      switch (action) {
        case 'pause':
          pauseTask(taskId);
          break;
        case 'play':
          resumeTask(taskId);
          break;
        case 'stop':
          cancelTask(taskId);
          break;
        default:
          console.warn('Unknown task action:', action);
      }
    } else {
      // 备用方案：本地状态更新
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === taskId) {
            switch (action) {
              case 'play':
                return { ...task, status: 'running' as const };
              case 'pause':
                return { ...task, status: 'paused' as const };
              case 'stop':
                return { ...task, status: 'pending' as const, progress: 0 };
              default:
                return task;
            }
          }
          return task;
        })
      );
      message.info('离线模式：操作仅在本地生效');
    }
  }, [isConnected, pauseTask, resumeTask, cancelTask]);
  
  const handleParamsUpdate = useCallback(() => {
    if (selectedTask) {
      if (isConnected) {
        // 使用WebSocket更新任务参数
        updateTaskParams(selectedTask, controlParams);
      } else {
        // 备用方案：本地更新
        console.log('Updating task params (offline):', selectedTask, controlParams);
        message.info('离线模式：参数更新仅在本地生效');
      }
      setIsControlPanelVisible(false);
    }
  }, [selectedTask, controlParams, isConnected, updateTaskParams]);

  const selectedTaskData = tasks.find(task => task.id === selectedTask);

  return (
    <div className="p-8 min-h-screen bg-white text-gray-900">
      {/* 页面标题 - 玻璃拟态风格 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              数据处理监控
            </h1>
            <p className="text-gray-600 text-lg">实时监控数据处理流程，管理任务执行状态</p>
          </div>
          <div className="flex items-center gap-4">
            <motion.div
              animate={wsConnected ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-300"
            >
              <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className={`text-sm font-medium ${wsConnected ? 'text-green-700' : 'text-red-700'}`}>
                {wsConnected ? '实时连接' : '连接断开'}
              </span>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => setIsControlPanelVisible(true)}
            >
              <Settings className="w-5 h-5" />
              控制面板
            </motion.button>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 任务列表 - 玻璃拟态风格 */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card 
                  title={
                    <div className="flex items-center gap-3">
                      <Activity className="w-6 h-6 text-blue-600" />
                      <span className="text-xl font-semibold text-gray-900">
                        处理任务
                      </span>
                    </div>
                  }
                  className="bg-white border border-gray-200 rounded-2xl shadow-xl"
                  headStyle={{
                    background: 'transparent',
                    borderBottom: '1px solid #e5e7eb',
                    padding: '24px'
                  }}
                  bodyStyle={{
                    padding: '24px'
                  }}
                >
                  <div className="space-y-6">
                    {tasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                        className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:bg-gray-100 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <h3 className="font-semibold text-gray-900 text-lg">{task.name}</h3>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              task.status === 'running' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              task.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                              task.status === 'failed' ? 'bg-red-100 text-red-800 border border-red-200' :
                              'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            }`}>
                              {getStatusText(task.status)}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                task.status === 'paused' 
                                  ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200' 
                                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200'
                              }`}
                              onClick={() => handleTaskControl(task.id, task.status === 'paused' ? 'play' : 'pause')}
                            >
                              {task.status === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-800 border border-red-200 hover:bg-red-200 transition-all duration-200"
                              onClick={() => handleTaskControl(task.id, 'stop')}
                            >
                              <Square className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 transition-all duration-200"
                              onClick={() => handleTaskRestart(task.id)}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>处理进度</span>
                            <span className="font-semibold">{Math.round(task.progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <motion.div
                              className={`h-3 rounded-full ${
                                task.status === 'running' ? 'bg-blue-500' :
                                task.status === 'completed' ? 'bg-green-500' :
                                task.status === 'failed' ? 'bg-red-500' :
                                'bg-yellow-500'
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${task.progress}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          {task.nodes.map((node, nodeIndex) => (
                            <motion.div
                              key={node.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.5 + nodeIndex * 0.1 }}
                              className="flex items-center gap-3 px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all duration-200"
                            >
                              <div className={`w-2 h-2 rounded-full ${
                                node.status === 'completed' ? 'bg-green-500' :
                                node.status === 'running' ? 'bg-blue-500 animate-pulse' :
                                node.status === 'failed' ? 'bg-red-500' :
                                node.status === 'paused' ? 'bg-yellow-500' :
                                'bg-gray-400'
                              }`} />
                              <span className="text-sm font-medium text-gray-900">{node.name}</span>
                              <span className="text-xs text-gray-500 font-mono">{node.progress}%</span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>

        {/* 任务流可视化 - 玻璃拟态风格 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-2"
        >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  任务流可视化
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-200"
                >
                  <Settings className="w-4 h-4" />
                  <span>参数设置</span>
                </motion.button>
              </div>

              {selectedTaskData && (
                <div className="space-y-6">
                  {/* 节点流程图 */}
                  <div className="flex flex-col space-y-4">
                    {selectedTaskData.nodes.map((node, index) => (
                      <motion.div
                        key={node.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                        className="flex items-center"
                      >
                        {/* 节点 */}
                        <div className={`flex-shrink-0 w-48 p-4 rounded-xl border ${
                          node.status === 'running' ? 'border-blue-400/50 bg-blue-500/10 backdrop-blur-sm' :
                          node.status === 'completed' ? 'border-green-400/50 bg-green-500/10 backdrop-blur-sm' :
                          node.status === 'failed' ? 'border-red-400/50 bg-red-500/10 backdrop-blur-sm' :
                          'border-white/20 bg-white/5 backdrop-blur-sm'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white">{node.name}</h4>
                            <div className="transform scale-75">
                              {getStatusIcon(node.status)}
                            </div>
                          </div>
                          <div className="mb-2">
                            <div className="flex justify-between text-sm text-gray-300 mb-1">
                              <span>进度</span>
                              <span className="font-semibold">{Math.round(node.progress)}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                              <motion.div 
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  node.status === 'running' ? 'bg-gradient-to-r from-blue-400 to-purple-400' :
                                  node.status === 'completed' ? 'bg-gradient-to-r from-green-400 to-emerald-400' :
                                  node.status === 'failed' ? 'bg-gradient-to-r from-red-400 to-pink-400' :
                                  'bg-gradient-to-r from-gray-400 to-gray-500'
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${node.progress}%` }}
                                transition={{ duration: 0.8 }}
                              />
                            </div>
                          </div>
                          {node.duration && (
                            <div className="text-xs text-gray-400">
                              耗时: {node.duration}s
                            </div>
                          )}
                        </div>

                        {/* 连接线 */}
                        {index < selectedTaskData.nodes.length - 1 && (
                          <div className="flex-1 flex items-center justify-center mx-4">
                            <div className="w-full h-0.5 bg-gradient-to-r from-blue-400/30 to-purple-400/30"></div>
                            <motion.div 
                              className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-2"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* 实时日志 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="mt-8"
                  >
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
                      实时日志
                    </h3>
                    <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 font-mono text-sm h-48 overflow-y-auto">
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="text-green-400"
                      >
                        [{new Date().toLocaleTimeString()}] 数据清洗进行中...
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.0 }}
                        className="text-yellow-400"
                      >
                        [{new Date(Date.now() - 30000).toLocaleTimeString()}] 发现 15 个异常值
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.2 }}
                        className="text-blue-400"
                      >
                        [{new Date(Date.now() - 60000).toLocaleTimeString()}] 数据验证完成，共处理 10,000 条记录
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.4 }}
                        className="text-cyan-400"
                      >
                        [{new Date(Date.now() - 90000).toLocaleTimeString()}] 开始加载数据文件: load_data.csv
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* 控制面板 - 玻璃拟态风格 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
              交互式控制面板
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="space-y-4"
              >
                <h3 className="font-medium text-white text-lg">任务控制</h3>
                <div className="flex space-x-3">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Play className="w-4 h-4" />
                    <span>开始</span>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Pause className="w-4 h-4" />
                    <span>暂停</span>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Square className="w-4 h-4" />
                    <span>停止</span>
                  </motion.button>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="space-y-4"
              >
                <h3 className="font-medium text-white text-lg">参数调整</h3>
                <div className="space-y-3">
                  <label className="block text-sm text-gray-300 font-medium">批处理大小</label>
                  <input 
                    type="range" 
                    min="100" 
                    max="10000" 
                    defaultValue="1000"
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="text-xs text-blue-300 font-semibold">当前值: 1000</div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="space-y-4"
              >
                <h3 className="font-medium text-white text-lg">系统状态</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">CPU使用率</span>
                    <span className="text-green-400 font-semibold">45%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">内存使用率</span>
                    <span className="text-yellow-400 font-semibold">62%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">活跃任务</span>
                    <span className="text-blue-400 font-semibold">1</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DataPipeline;