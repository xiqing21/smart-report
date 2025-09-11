import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Progress, Tabs, Select, Input, Space, Tag, Tooltip, Modal, Slider, Switch, message } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StopOutlined, ReloadOutlined, SettingOutlined, EyeOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Play, Pause, Square, RotateCcw, Settings, Eye, Trash2, Edit3, Activity, Clock, CheckCircle, AlertCircle, XCircle, Wifi, WifiOff, Zap } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">数据处理监控</h1>
            <p className="text-gray-600">实时监控数据处理管道状态，支持交互式控制和参数调整</p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-2">
              {wsConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">实时连接</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600">离线模式</span>
                </>
              )}
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              刷新
            </button>
            <button 
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              onClick={() => setIsControlPanelVisible(true)}
            >
              <Settings className="w-4 h-4" />
              <span>控制面板</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 任务列表 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">处理任务</h2>
              <div className="space-y-4">
                {tasks.map(task => (
                  <div 
                    key={task.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTask === task.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTask(task.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{task.name}</h3>
                      {getStatusIcon(task.status)}
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>进度</span>
                        <span>{Math.round(task.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(task.status)}`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {task.startTime && `开始于 ${task.startTime.toLocaleTimeString()}`}
                      </span>
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTaskControl(task.id, task.status === 'running' ? 'pause' : 'play');
                          }}
                          className="p-1 rounded hover:bg-gray-200 transition-colors"
                        >
                          {task.status === 'running' ? 
                            <Pause className="w-4 h-4 text-gray-600" /> : 
                            <Play className="w-4 h-4 text-gray-600" />
                          }
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTaskControl(task.id, 'stop');
                          }}
                          className="p-1 rounded hover:bg-gray-200 transition-colors"
                        >
                          <Square className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 任务流可视化 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">任务流可视化</h2>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                  <span>参数设置</span>
                </button>
              </div>

              {selectedTaskData && (
                <div className="space-y-6">
                  {/* 节点流程图 */}
                  <div className="flex flex-col space-y-4">
                    {selectedTaskData.nodes.map((node, index) => (
                      <div key={node.id} className="flex items-center">
                        {/* 节点 */}
                        <div className={`flex-shrink-0 w-48 p-4 rounded-lg border-2 ${
                          node.status === 'running' ? 'border-blue-500 bg-blue-50' :
                          node.status === 'completed' ? 'border-green-500 bg-green-50' :
                          node.status === 'failed' ? 'border-red-500 bg-red-50' :
                          'border-gray-300 bg-gray-50'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{node.name}</h4>
                            {getStatusIcon(node.status)}
                          </div>
                          <div className="mb-2">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>进度</span>
                              <span>{Math.round(node.progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-300 ${getStatusColor(node.status)}`}
                                style={{ width: `${node.progress}%` }}
                              />
                            </div>
                          </div>
                          {node.duration && (
                            <div className="text-xs text-gray-500">
                              耗时: {node.duration}s
                            </div>
                          )}
                        </div>

                        {/* 连接线 */}
                        {index < selectedTaskData.nodes.length - 1 && (
                          <div className="flex-1 flex items-center justify-center mx-4">
                            <div className="w-full h-0.5 bg-gray-300"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full mx-2"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 实时日志 */}
                  <div className="mt-8">
                    <h3 className="text-md font-semibold text-gray-900 mb-4">实时日志</h3>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-48 overflow-y-auto">
                      <div>[{new Date().toLocaleTimeString()}] 数据清洗进行中...</div>
                      <div>[{new Date(Date.now() - 30000).toLocaleTimeString()}] 发现 15 个异常值</div>
                      <div>[{new Date(Date.now() - 60000).toLocaleTimeString()}] 数据验证完成，共处理 10,000 条记录</div>
                      <div>[{new Date(Date.now() - 90000).toLocaleTimeString()}] 开始加载数据文件: load_data.csv</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 控制面板 */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">交互式控制面板</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">任务控制</h3>
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    <Play className="w-4 h-4" />
                    <span>开始</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
                    <Pause className="w-4 h-4" />
                    <span>暂停</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                    <Square className="w-4 h-4" />
                    <span>停止</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">参数调整</h3>
                <div className="space-y-2">
                  <label className="block text-sm text-gray-600">批处理大小</label>
                  <input 
                    type="range" 
                    min="100" 
                    max="10000" 
                    defaultValue="1000"
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500">当前值: 1000</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">系统状态</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">CPU使用率</span>
                    <span className="text-gray-900">45%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">内存使用率</span>
                    <span className="text-gray-900">62%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">活跃任务</span>
                    <span className="text-gray-900">1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPipeline;