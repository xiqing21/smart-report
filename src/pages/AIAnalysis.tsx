import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Button,
  Select,
  Input,
  Upload,
  Table,
  Progress,
  Tag,
  Tabs,
  Space,
  Statistic,
  Alert,
  Modal,
  Form,
  message,
  Divider,
  Typography,
  Tooltip,
  Badge
} from 'antd';
import {
  UploadOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  PlayCircleOutlined,
  StopOutlined,
  DownloadOutlined,
  SettingOutlined,
  BulbOutlined,
  RobotOutlined,
  FileTextOutlined,
  CloudUploadOutlined,
  ApiOutlined,
  TableOutlined,
  EyeOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
import { EnhancedButton, InteractiveCard, StatusTag, AnimatedProgress } from '../components/InteractiveEnhancements';
import { AnimatedStatistic } from '../components/AdvancedAnimations';
import { motion } from 'framer-motion';
import type { UploadProps } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

interface DataSource {
  id: string;
  name: string;
  type: 'file' | 'database' | 'api';
  status: 'connected' | 'disconnected' | 'error';
  size?: string;
  lastUpdated: string;
  records?: number;
  fileExtension?: string;
  fileName?: string;
}

interface AnalysisTask {
  id: string;
  name: string;
  dataSource: string;
  analysisType: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  progress: number;
  startTime: string;
  duration?: string;
  insights?: number;
}

const AIAnalysis: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analysis');
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [form] = Form.useForm();
  
  // 从路由状态获取分析完成状态
  const analysisCompleted = location.state?.analysisCompleted || false;
  const showResults = location.state?.showResults || false;

  useEffect(() => {
    if (showResults && analysisCompleted) {
      setActiveTab('results');
    }
  }, [showResults, analysisCompleted]);

  const [dataSources] = useState<DataSource[]>([
    {
      id: '1',
      name: '山西电网负荷数据.db',
      type: 'database',
      status: 'connected',
      size: '2.5GB',
      lastUpdated: '2024-01-15 14:30',
      records: 125420,
      fileExtension: 'db',
      fileName: '山西电网负荷数据'
    },
    {
      id: '2', 
      name: '设备运行状态数据.xlsx',
      type: 'file',
      status: 'connected',
      size: '1.2GB',
      lastUpdated: '2024-01-15 12:15',
      records: 89650,
      fileExtension: 'xlsx',
      fileName: '设备运行状态数据'
    },
    {
      id: '3',
      name: '能耗监测数据.csv',
      type: 'file',
      status: 'connected',
      size: '856MB',
      lastUpdated: '2024-01-15 10:20',
      records: 67890,
      fileExtension: 'csv',
      fileName: '能耗监测数据'
    },
    {
      id: '4',
      name: '实时监控API',
      type: 'api',
      status: 'disconnected',
      lastUpdated: '2024-01-14 18:45'
    }
  ]);

  const [analysisTasks] = useState<AnalysisTask[]>([
    {
      id: '1',
      name: '电网负荷趋势分析',
      dataSource: '山西电网负荷数据.db',
      analysisType: '趋势分析',
      status: 'completed',
      progress: 100,
      startTime: '2024-01-15 09:30',
      duration: '12分钟',
      insights: 8
    },
    {
      id: '2',
      name: '设备故障预测',
      dataSource: '设备运行状态数据.xlsx', 
      analysisType: '预测分析',
      status: 'running',
      progress: 65,
      startTime: '2024-01-15 14:20'
    },
    {
      id: '3',
      name: '能耗数据分析',
      dataSource: '能耗监测数据.csv',
      analysisType: '统计分析',
      status: 'pending',
      progress: 0,
      startTime: '2024-01-15 15:30'
    }
  ]);

  const handleStartAnalysis = () => {
    setAnalysisRunning(true);
    message.success('分析任务已启动');
    
    // 模拟分析过程
    setTimeout(() => {
      setAnalysisRunning(false);
      message.success('分析完成！正在跳转到结果页面...');
      
      // 自动跳转到分析结果页面
      setTimeout(() => {
        setActiveTab('results');
        // 更新路由状态以显示分析完成
        navigate('/analysis', {
          state: {
            analysisCompleted: true,
            showResults: true
          },
          replace: true
        });
      }, 1000);
    }, 3000);
  };

  const handleEditReport = () => {
    navigate('/editor', {
      state: {
        analysisData: {
          type: 'ai-analysis',
          template: selectedTemplate,
          data: {
            loadGrowth: 15.2,
            cleanEnergyRatio: 12.8,
            regions: [
              { name: '太原', load: '2,450 MW', growth: '+8.5%' },
              { name: '大同', load: '1,890 MW', growth: '+12.3%' },
              { name: '临汾', load: '1,650 MW', growth: '+6.7%' }
            ]
          }
        }
      }
    });
  };

  const handleDownloadReport = () => {
    message.success('报告下载已开始');
    // 实际下载逻辑
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setTemplateModalVisible(false);
    message.success('模板已选择');
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    action: '/api/upload',
    onChange(info) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
      } else if (status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'green';
      case 'disconnected': return 'red';
      case 'error': return 'orange';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return '已连接';
      case 'disconnected': return '未连接';
      case 'error': return '连接错误';
      default: return '未知';
    }
  };

  const dataSourceColumns = [
    {
      title: '数据源名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: DataSource) => {
        const getFileIcon = (extension?: string) => {
          switch (extension) {
            case 'xlsx':
            case 'xls':
              return <TableOutlined style={{ color: '#52c41a' }} />;
            case 'csv':
              return <FileTextOutlined style={{ color: '#1890ff' }} />;
            case 'db':
            case 'sql':
              return <DatabaseOutlined style={{ color: '#722ed1' }} />;
            default:
              return <FileTextOutlined />;
          }
        };

        return (
          <Space>
            {record.type === 'database' && <DatabaseOutlined />}
            {record.type === 'file' && getFileIcon(record.fileExtension)}
            {record.type === 'api' && <ApiOutlined />}
            <div>
              <Text strong>{record.fileName || text}</Text>
              {record.fileExtension && (
                <Tag color="blue" className="ml-2">
                  .{record.fileExtension}
                </Tag>
              )}
            </div>
          </Space>
        );
      }
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap = {
          database: '数据库',
          file: '文件',
          api: 'API接口'
        };
        return <Tag>{typeMap[type as keyof typeof typeMap]}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
          <>
            <StatusTag status={status === 'connected' ? 'completed' : 'pending'} />
            <span className="ml-2">{getStatusText(status)}</span>
          </>
        )
    },
    {
      title: '数据量',
      key: 'size',
      render: (record: DataSource) => (
        <Space direction="vertical" size={0}>
          <Text>{record.size || '-'}</Text>
          {record.records && <Text type="secondary">{record.records.toLocaleString()} 条记录</Text>}
        </Space>
      )
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated'
    },
    {
      title: '操作',
      key: 'action',
      render: (record: DataSource) => (
        <Space>
          <Tooltip title="预览数据">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => {
                setSelectedDataSource(record);
                setPreviewModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="配置">
            <Button 
              type="text" 
              icon={<SettingOutlined />}
              onClick={() => setConfigModalVisible(true)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Space>
      )
    }
  ];

  const taskColumns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '数据源',
      dataIndex: 'dataSource',
      key: 'dataSource'
    },
    {
      title: '分析类型',
      dataIndex: 'analysisType',
      key: 'analysisType',
      render: (type: string) => <Tag color="blue">{type}</Tag>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          running: { color: 'processing', text: '运行中' },
          completed: { color: 'success', text: '已完成' },
          failed: { color: 'error', text: '失败' },
          pending: { color: 'default', text: '等待中' }
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Badge status={config.color as any} text={config.text} />;
      }
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
         <AnimatedProgress percent={progress} />
       )
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime'
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: string) => duration || '-'
    },
    {
      title: '洞察数',
      dataIndex: 'insights',
      key: 'insights',
      render: (insights: number) => insights ? <Badge count={insights} color="green" /> : '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (record: AnalysisTask) => (
        <Space>
          {record.status === 'running' && (
            <Button type="text" danger icon={<StopOutlined />} size="small">
              停止
            </Button>
          )}
          {record.status === 'completed' && (
            <>
              <Button type="text" icon={<EyeOutlined />} size="small">
                查看
              </Button>
              <Button type="text" icon={<DownloadOutlined />} size="small">
                下载
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>AI 智能分析中心</Title>
        <Paragraph className="text-gray-600">
          基于先进的机器学习算法，为山西电网提供深度数据洞察和智能决策支持
        </Paragraph>
      </div>

      {/* 智能体协作动画展示 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <Card title="五大智能体协作状态" className="shadow-sm">
            <div className="relative" style={{ minHeight: '300px', padding: '20px' }}>
              {/* 协作连接线动画 */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none" 
                style={{ zIndex: 1 }}
              >
                {/* 数据流动路径 */}
                <defs>
                  <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1890ff" stopOpacity="0" />
                    <stop offset="50%" stopColor="#1890ff" stopOpacity="1" />
                    <stop offset="100%" stopColor="#1890ff" stopOpacity="0" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/> 
                    </feMerge>
                  </filter>
                </defs>
                
                {/* 连接线 */}
                <motion.path
                  d="M 100 150 Q 250 100 400 150 Q 550 200 700 150 Q 850 100 1000 150"
                  stroke="#1890ff"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                  filter="url(#glow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: analysisRunning ? 1 : 0.3,
                    opacity: analysisRunning ? 1 : 0.5,
                    strokeDashoffset: analysisRunning ? [0, -20] : 0
                  }}
                  transition={{ 
                    pathLength: { duration: 2, ease: "easeInOut" },
                    strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" }
                  }}
                />
                
                {/* 数据流动粒子 */}
                {analysisRunning && [
                  { x: 100, delay: 0 },
                  { x: 300, delay: 0.5 },
                  { x: 500, delay: 1 },
                  { x: 700, delay: 1.5 },
                  { x: 900, delay: 2 }
                ].map((particle, i) => (
                  <motion.circle
                    key={i}
                    r="4"
                    fill="url(#flowGradient)"
                    initial={{ cx: particle.x, cy: 150, opacity: 0 }}
                    animate={{
                      cx: [particle.x, particle.x + 200, particle.x + 400],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 2,
                      delay: particle.delay,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </svg>
              
              {/* 智能体卡片 */}
              <Row gutter={[16, 16]} className="relative" style={{ zIndex: 2 }}>
                {[
                  { 
                    name: '数据采集智能体', 
                    status: '运行中', 
                    color: '#52c41a', 
                    position: 0,
                    currentTask: analysisRunning ? '采集电网负荷数据' : '监控数据源状态',
                    processedCount: analysisRunning ? '1,247条记录' : '待机'
                  },
                  { 
                    name: '模式识别智能体', 
                    status: analysisRunning ? '分析中' : '待机', 
                    color: '#1890ff', 
                    position: 1,
                    currentTask: analysisRunning ? '识别负荷变化模式' : '等待数据输入',
                    processedCount: analysisRunning ? '发现3种模式' : '待机'
                  },
                  { 
                    name: '预测建模智能体', 
                    status: analysisRunning ? '建模中' : '待机', 
                    color: '#faad14', 
                    position: 2,
                    currentTask: analysisRunning ? '构建负荷预测模型' : '等待模式数据',
                    processedCount: analysisRunning ? '训练进度85%' : '待机'
                  },
                  { 
                    name: '异常检测智能体', 
                    status: analysisRunning ? '检测中' : '运行中', 
                    color: '#722ed1', 
                    position: 3,
                    currentTask: analysisRunning ? '检测负荷异常点' : '实时监控异常',
                    processedCount: analysisRunning ? '发现2个异常' : '正常运行'
                  },
                  { 
                    name: '报告生成智能体', 
                    status: analysisRunning ? '生成中' : '待机', 
                    color: '#eb2f96', 
                    position: 4,
                    currentTask: analysisRunning ? '生成分析报告' : '等待分析结果',
                    processedCount: analysisRunning ? '报告完成60%' : '待机'
                  }
                ].map((agent, index) => (
                  <Col span={4.8} key={index}>
                    <motion.div
                      initial={{ scale: 1, y: 0 }}
                      animate={{
                        scale: analysisRunning && agent.status.includes('中') ? [1, 1.05, 1] : 1,
                        y: analysisRunning && agent.status.includes('中') ? [0, -5, 0] : 0
                      }}
                      transition={{
                        duration: 2,
                        repeat: analysisRunning && agent.status.includes('中') ? Infinity : 0,
                        delay: index * 0.3
                      }}
                    >
                      <InteractiveCard hoverable className="text-center relative overflow-hidden">
                        {/* 工作状态光效 */}
                        {analysisRunning && agent.status.includes('中') && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r opacity-20"
                            style={{
                              background: `linear-gradient(45deg, transparent, ${agent.color}, transparent)`
                            }}
                            animate={{
                              x: [-100, 300]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        )}
                        
                        <div className="mb-2 relative">
                          <motion.div
                            animate={{
                              rotate: analysisRunning && agent.status.includes('中') ? 360 : 0
                            }}
                            transition={{
                              duration: 3,
                              repeat: analysisRunning && agent.status.includes('中') ? Infinity : 0,
                              ease: "linear"
                            }}
                          >
                            <RobotOutlined style={{ fontSize: '24px', color: agent.color }} />
                          </motion.div>
                        </div>
                        
                        <Text strong className="block mb-1">{agent.name}</Text>
                        <div>
                          <StatusTag 
                            status={agent.status.includes('中') ? 'processing' : 
                                   agent.status === '运行中' ? 'processing' : 'pending'} 
                          />
                          <span className="ml-2">{agent.status}</span>
                        </div>
                        <div className="mt-2">
                          <div className="text-xs text-gray-600 mb-1">当前任务:</div>
                          <Text className="text-xs" style={{ color: agent.color }}>
                            {agent.currentTask}
                          </Text>
                        </div>
                        <div className="mt-1">
                          <div className="text-xs text-gray-600 mb-1">处理状态:</div>
                          <Text className="text-xs font-medium" style={{ color: agent.color }}>
                            {agent.processedCount}
                          </Text>
                        </div>
                      </InteractiveCard>
                    </motion.div>
                  </Col>
                ))}
              </Row>
              
              {/* 协作状态提示 */}
              {analysisRunning && (
                <motion.div
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <Alert
                    message="智能体协作进行中"
                    description="五大智能体正在协同工作，实时处理和分析数据"
                    type="info"
                    showIcon
                    className="shadow-lg"
                  />
                </motion.div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={<span><BarChartOutlined />智能分析</span>} key="analysis">
            <Row gutter={[24, 24]}>
              <Col span={16}>
                <Card title="分析配置" className="h-full">
                  <Form form={form} layout="vertical">
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="数据源" name="dataSource">
                          <Select placeholder="选择数据源">
                            {dataSources.map(ds => (
                              <Option key={ds.id} value={ds.id}>{ds.name}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="分析类型" name="analysisType">
                          <Select placeholder="选择分析类型">
                            <Option value="trend">趋势分析</Option>
                            <Option value="behavior">行为分析</Option>
                            <Option value="prediction">预测分析</Option>
                            <Option value="correlation">关联分析</Option>
                            <Option value="clustering">聚类分析</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="报告类型" name="reportType">
                          <Select placeholder="选择报告类型">
                            <Option value="load">电网负荷分析</Option>
                            <Option value="equipment">设备状态分析</Option>
                            <Option value="efficiency">能效分析</Option>
                            <Option value="safety">安全风险评估</Option>
                            <Option value="optimization">优化建议</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="分析描述" name="description">
                          <TextArea rows={3} placeholder="描述分析目标和要求..." />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item label="报告模板" name="template">
                          <Select
                            placeholder="选择报告模板（可选）"
                            allowClear
                            onChange={(value) => setSelectedTemplate(value)}
                          >
                            <Option value="comprehensive">📊 综合分析报告</Option>
                            <Option value="load-analysis">⚡ 负荷分析专项报告</Option>
                            <Option value="equipment-health">🔧 设备健康评估报告</Option>
                            <Option value="energy-efficiency">💡 能效优化报告</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item>
                      <Space className="w-full" direction="vertical">
                        <EnhancedButton
                          type="primary"
                          size="large"
                          icon={<PlayCircleOutlined />}
                          loading={analysisRunning}
                          onClick={handleStartAnalysis}
                          variant="glow"
                          className="analysis-start-button"
                        >
                          {analysisRunning ? '分析中...' : '开始分析'}
                        </EnhancedButton>
                        <EnhancedButton
                          size="large"
                          icon={<FileTextOutlined />}
                          onClick={() => navigate('/templates')}
                          variant="bounce"
                        >
                          浏览更多模板
                        </EnhancedButton>
                      </Space>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="分析任务" className="h-full">
                  <Table
                    dataSource={analysisTasks}
                    columns={taskColumns.slice(0, 4)}
                    pagination={false}
                    size="small"
                    rowKey="id"
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><BulbOutlined />分析结果</span>} key="results">
            {showResults && analysisCompleted ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* 五大智能体协作完成展示 */}
                <Card className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 border-0">
                  <div className="text-center py-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="text-6xl mb-4"
                    >
                      🎉
                    </motion.div>
                    <Title level={2} className="text-green-600 mb-2">智能分析完成！</Title>
                    <Paragraph className="text-lg text-gray-600 mb-4">
                      五大智能体已成功协作完成山西电网数据分析，生成专业报告
                    </Paragraph>
                    
                    {/* 智能体协作展示 */}
                    <Row gutter={[16, 16]} className="mb-6">
                      {[
                        { name: '数据采集智能体', efficiency: 98.5, status: '✅ 完成' },
                        { name: '模式识别智能体', efficiency: 96.2, status: '✅ 完成' },
                        { name: '预测建模智能体', efficiency: 94.8, status: '✅ 完成' },
                        { name: '异常检测智能体', efficiency: 97.3, status: '✅ 完成' },
                        { name: '报告生成智能体', efficiency: 95.7, status: '✅ 完成' }
                      ].map((agent, index) => (
                        <Col span={4.8} key={index}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                          >
                            <Card className="text-center bg-white shadow-sm hover:shadow-md transition-shadow">
                              <RobotOutlined className="text-2xl text-blue-500 mb-2" />
                              <Text strong className="block text-sm mb-1">{agent.name}</Text>
                              <div className="text-green-600 text-xs mb-2">{agent.status}</div>
                              <Progress 
                                type="circle" 
                                size={40} 
                                percent={agent.efficiency} 
                                format={percent => `${percent}%`}
                                strokeColor="#52c41a"
                              />
                            </Card>
                          </motion.div>
                        </Col>
                      ))}
                    </Row>

                    {/* 操作按钮 */}
                    <Space size="large">
                      <EnhancedButton
                        type="primary"
                        size="large"
                        icon={<EditOutlined />}
                        onClick={handleEditReport}
                        variant="gradient"
                      >
                        立即编辑报告
                      </EnhancedButton>
                      <EnhancedButton
                          size="large"
                          icon={<FileTextOutlined />}
                          onClick={() => setTemplateModalVisible(true)}
                          variant="glow"
                        >
                          选择模板
                        </EnhancedButton>
                       <EnhancedButton
                          size="large"
                          icon={<EyeOutlined />}
                          onClick={() => navigate('/reports')}
                          variant="pulse"
                        >
                          查看报告
                        </EnhancedButton>
                       <EnhancedButton
                          size="large"
                          icon={<DownloadOutlined />}
                          onClick={handleDownloadReport}
                          variant="glow"
                        >
                          下载报告
                        </EnhancedButton>
                    </Space>
                  </div>
                </Card>

                {/* 分析完成提示 */}
                <Alert
                  message="分析完成"
                  description="基于 125,420 条电网数据，智能体协作识别出 12 个关键洞察，生成专业分析报告"
                  type="success"
                  showIcon
                  className="mb-6"
                />

                {/* 关键洞察 */}
                <Row gutter={[16, 16]} className="mb-6">
                  <Col span={12}>
                    <motion.div whileHover={{ scale: 1.02 }}>
                      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                        <Statistic
                          title="负荷增长趋势"
                          value={15.2}
                          suffix="%"
                          valueStyle={{ color: '#1890ff' }}
                          prefix={<LineChartOutlined />}
                        />
                        <Text className="text-gray-600">相比去年同期显著上升</Text>
                      </Card>
                    </motion.div>
                  </Col>
                  <Col span={12}>
                    <motion.div whileHover={{ scale: 1.02 }}>
                      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                        <Statistic
                          title="清洁能源占比提升"
                          value={12.8}
                          suffix="%"
                          valueStyle={{ color: '#52c41a' }}
                          prefix={<PieChartOutlined />}
                        />
                        <Text className="text-gray-600">新能源接入持续增长</Text>
                      </Card>
                    </motion.div>
                  </Col>
                </Row>

                {/* 数据详情 */}
                <Row gutter={[16, 16]} className="mb-6">
                  <Col span={16}>
                    <Card title="详细数据分析">
                      <Table
                        dataSource={[
                          { key: '1', region: '太原', load: '2,450 MW', growth: '+8.5%', status: '正常' },
                          { key: '2', region: '大同', load: '1,890 MW', growth: '+12.3%', status: '偏高' },
                          { key: '3', region: '临汾', load: '1,650 MW', growth: '+6.7%', status: '正常' }
                        ]}
                        columns={[
                          { title: '地区', dataIndex: 'region', key: 'region' },
                          { title: '当前负荷', dataIndex: 'load', key: 'load' },
                          { title: '增长率', dataIndex: 'growth', key: 'growth' },
                          { title: '状态', dataIndex: 'status', key: 'status',
                            render: (status: string) => (
                              <Tag color={status === '正常' ? 'green' : 'orange'}>{status}</Tag>
                            )
                          }
                        ]}
                        pagination={false}
                        size="small"
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card title="AI 建议">
                      <Space direction="vertical" className="w-full">
                        <Alert
                          message="太原地区负荷优化"
                          description="建议在峰值时段启动备用电源"
                          type="info"
                          showIcon
                          className="mb-2"
                        />
                        <Alert
                          message="临汾设备维护"
                          description="检测到异常波动，建议安排检修"
                          type="warning"
                          showIcon
                        />
                      </Space>
                    </Card>
                  </Col>
                </Row>

                {/* 快速操作面板 */}
                <Row gutter={[16, 16]} className="mb-6">
                  <Col span={24}>
                    <Card title="🚀 快速操作" className="shadow-sm">
                      <Row gutter={[16, 16]}>
                        <Col span={6}>
                          <EnhancedButton
                            icon={<FileTextOutlined />}
                            onClick={() => navigate('/templates')}
                            variant="bounce"
                            className="w-full h-16"
                          >
                            <div className="text-center">
                              <div>模板中心</div>
                              <Text type="secondary" className="text-xs">选择专业模板</Text>
                            </div>
                          </EnhancedButton>
                        </Col>
                        <Col span={6}>
                          <EnhancedButton
                            icon={<EditOutlined />}
                            onClick={() => navigate('/editor', {
                              state: {
                                analysisData: {
                                  type: 'ai-analysis-result',
                                  template: selectedTemplate || 'comprehensive',
                                  data: {
                                    title: '山西电网智能分析报告',
                                    analysisType: '综合分析',
                                    dataSource: '山西电网负荷数据.db',
                                    loadGrowth: 15.2,
                                    cleanEnergyRatio: 12.8,
                                    efficiency: 98.5,
                                    confidence: 95.2,
                                    regions: [
                                      { name: '太原', load: '2,450 MW', growth: '+8.5%', status: '正常' },
                                      { name: '大同', load: '1,890 MW', growth: '+12.3%', status: '正常' },
                                      { name: '临汾', load: '1,650 MW', growth: '+6.7%', status: '优化建议' }
                                    ],
                                    insights: [
                                      '太原地区负荷优化：建议在峰值时段启动备用电源',
                                      '临汾设备维护：检测到异常波动，建议安排检修',
                                      '整体能效提升：可通过智能调度提升3.2%效率'
                                    ]
                                  }
                                }
                              }
                            })}
                            variant="gradient"
                            className="w-full h-16"
                          >
                            <div className="text-center">
                              <div>基于分析创建报告</div>
                              <Text type="secondary" className="text-xs">导入分析结果</Text>
                            </div>
                          </EnhancedButton>
                        </Col>
                        <Col span={6}>
                          <EnhancedButton
                            icon={<EyeOutlined />}
                            onClick={() => navigate('/reports')}
                            variant="pulse"
                            className="w-full h-16"
                          >
                            <div className="text-center">
                              <div>报告管理</div>
                              <Text type="secondary" className="text-xs">查看所有报告</Text>
                            </div>
                          </EnhancedButton>
                        </Col>
                        <Col span={6}>
                          <EnhancedButton
                            icon={<RobotOutlined />}
                            onClick={() => navigate('/agent-monitor')}
                            variant="glow"
                            className="w-full h-16"
                          >
                            <div className="text-center">
                              <div>智能体监控</div>
                              <Text type="secondary" className="text-xs">实时状态监控</Text>
                            </div>
                          </EnhancedButton>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>

                {/* 分析统计 */}
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Card title="分析统计信息">
                      <Space size="large">
                        <Card className="text-center">
                          <Statistic title="数据准确度" value={98.5} suffix="%" />
                          <Progress percent={98.5} size="small" className="mt-2" />
                        </Card>
                        <Card className="text-center">
                          <Statistic title="置信度" value={95.2} suffix="%" />
                          <Progress percent={95.2} size="small" className="mt-2" />
                        </Card>
                        <Card className="text-center">
                          <div className="mb-2">
                            <Text strong>处理时间</Text>
                          </div>
                          <Text strong>5分钟</Text>
                        </Card>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <Title level={3} className="text-gray-500 mb-2">暂无分析结果</Title>
                <Paragraph className="text-gray-400 mb-4">
                  请先在智能分析页面启动分析任务
                </Paragraph>
                <EnhancedButton 
                  type="primary" 
                  onClick={() => setActiveTab('analysis')}
                  variant="gradient"
                >
                  开始分析
                </EnhancedButton>
              </div>
            )}
          </TabPane>

          <TabPane tab={<span><DatabaseOutlined />数据源管理</span>} key="datasource">
            <Row gutter={[16, 16]} className="mb-4">
              <Col span={24}>
                <Space>
                  <EnhancedButton type="primary" icon={<DatabaseOutlined />}>
                    添加数据库
                  </EnhancedButton>
                  <Upload {...uploadProps}>
                    <EnhancedButton icon={<UploadOutlined />}>
                      上传文件
                    </EnhancedButton>
                  </Upload>
                  <EnhancedButton icon={<ApiOutlined />}>
                    配置API
                  </EnhancedButton>
                </Space>
              </Col>
            </Row>
            <Table
              dataSource={dataSources}
              columns={dataSourceColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Data Source Config Modal */}
      <Modal
        title="数据库连接配置"
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setConfigModalVisible(false)}>
            取消
          </Button>,
          <Button key="test" type="default">
            测试连接
          </Button>,
          <Button key="save" type="primary">
            保存配置
          </Button>
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="数据库类型">
            <Select defaultValue="mysql">
              <Option value="mysql">MySQL</Option>
              <Option value="postgresql">PostgreSQL</Option>
              <Option value="oracle">Oracle</Option>
              <Option value="sqlserver">SQL Server</Option>
            </Select>
          </Form.Item>
          <Form.Item label="服务器地址">
            <Input placeholder="localhost" />
          </Form.Item>
          <Form.Item label="端口">
            <Input placeholder="3306" />
          </Form.Item>
          <Form.Item label="数据库名">
            <Input placeholder="database_name" />
          </Form.Item>
          <Form.Item label="用户名">
            <Input placeholder="username" />
          </Form.Item>
          <Form.Item label="密码">
            <Input.Password placeholder="password" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Data Preview Modal */}
      <Modal
        title={`数据预览 - ${selectedDataSource?.name}`}
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <Table
          dataSource={[
            { key: '1', timestamp: '2024-01-15 14:30:00', load: '2450.5', voltage: '220.1', current: '11.2' },
            { key: '2', timestamp: '2024-01-15 14:31:00', load: '2455.2', voltage: '219.8', current: '11.3' },
            { key: '3', timestamp: '2024-01-15 14:32:00', load: '2448.9', voltage: '220.3', current: '11.1' }
          ]}
          columns={[
            { title: '时间戳', dataIndex: 'timestamp', key: 'timestamp' },
            { title: '负荷(MW)', dataIndex: 'load', key: 'load' },
            { title: '电压(kV)', dataIndex: 'voltage', key: 'voltage' },
            { title: '电流(A)', dataIndex: 'current', key: 'current' }
          ]}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Modal>

      {/* Template Selection Modal */}
      <Modal
        title="选择报告模板"
        open={templateModalVisible}
        onCancel={() => setTemplateModalVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setTemplateModalVisible(false)}>
            取消
          </Button>
        ]}
      >
        <Row gutter={[16, 16]}>
          {[
            {
              id: 'comprehensive',
              name: '综合分析报告',
              description: '包含负荷分析、设备状态、能效评估等全面内容',
              preview: '📊 数据概览 + 📈 趋势分析 + 🔧 设备状态 + 💡 优化建议'
            },
            {
              id: 'load-analysis',
              name: '负荷分析专项报告',
              description: '专注于电网负荷变化趋势和峰谷分析',
              preview: '⚡ 负荷趋势 + 📊 峰谷分析 + 🎯 预测模型'
            },
            {
              id: 'equipment-health',
              name: '设备健康评估报告',
              description: '设备运行状态监测和故障预警分析',
              preview: '🔧 设备状态 + ⚠️ 故障预警 + 🛠️ 维护建议'
            },
            {
              id: 'energy-efficiency',
              name: '能效优化报告',
              description: '能源利用效率分析和优化方案',
              preview: '💡 能效分析 + 🌱 清洁能源 + 📈 优化方案'
            }
          ].map((template) => (
            <Col span={12} key={template.id}>
              <Card
                hoverable
                className={`cursor-pointer transition-all ${
                  selectedTemplate === template.id ? 'border-blue-500 shadow-lg' : ''
                }`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="mb-3">
                  <Text strong className="text-lg">{template.name}</Text>
                </div>
                <Paragraph className="text-gray-600 mb-3">
                  {template.description}
                </Paragraph>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <Text type="secondary">预览：{template.preview}</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>
    </div>
  );
};

export default AIAnalysis;