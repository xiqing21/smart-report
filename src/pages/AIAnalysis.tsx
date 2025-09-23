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
  // message,
  Typography,
  Tooltip,
  Badge,
  App,
  List,
  Divider,
  Checkbox
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
  ApiOutlined,
  TableOutlined,
  EyeOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
import { EnhancedButton, StatusTag, AnimatedProgress } from '../components/InteractiveEnhancements';
import AgentProgressModal from '../components/AgentProgressModal';
import { zhipuAIService } from '../services/ai/zhipuService';
import { supabase } from '../lib/supabase';

import { motion } from 'framer-motion';
import type { UploadProps } from 'antd';

const { Title, Text, Paragraph } = Typography;
// const { TabPane } = Tabs; // Deprecated, using items prop instead
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
  // 数据质量相关字段
  qualityScore?: number;
  healthStatus?: 'excellent' | 'good' | 'fair' | 'poor';
  issueCount?: number;
  lastQualityCheck?: string;
  hasEDAReport?: boolean;
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

// 数据质量相关接口
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

const AIAnalysis: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState('datasource');
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [agentModalVisible, setAgentModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  // 从路由状态获取分析完成状态
  const analysisCompleted = location.state?.analysisCompleted || false;
  const showResults = location.state?.showResults || false;
  
  // 数据质量相关状态
  const [healthReportModalVisible, setHealthReportModalVisible] = useState(false);
  const [edaModalVisible, setEdaModalVisible] = useState(false);
  const [repairModalVisible, setRepairModalVisible] = useState(false);
  const [selectedDataSourceForHealth, setSelectedDataSourceForHealth] = useState<DataSource | null>(null);
  const [isQualityChecking, setIsQualityChecking] = useState(false);

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
      fileName: '山西电网负荷数据',
      qualityScore: 92,
      healthStatus: 'excellent',
      issueCount: 2,
      lastQualityCheck: '2024-01-15 14:25',
      hasEDAReport: true
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
      fileName: '设备运行状态数据',
      qualityScore: 78,
      healthStatus: 'good',
      issueCount: 5,
      lastQualityCheck: '2024-01-15 12:10',
      hasEDAReport: true
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
      fileName: '能耗监测数据',
      qualityScore: 65,
      healthStatus: 'fair',
      issueCount: 8,
      lastQualityCheck: '2024-01-15 10:15',
      hasEDAReport: false
    },
    {
      id: '4',
      name: '实时监控API',
      type: 'api',
      status: 'disconnected',
      lastUpdated: '2024-01-14 18:45',
      qualityScore: 45,
      healthStatus: 'poor',
      issueCount: 12,
      lastQualityCheck: '2024-01-14 18:40',
      hasEDAReport: false
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

  // 模拟数据健康报告
  const [healthReports] = useState<{[key: string]: DataHealthReport}>({
    '1': {
      overallScore: 92,
      totalRows: 125420,
      totalColumns: 15,
      issues: [
        {
          type: 'missing_values',
          column: 'voltage',
          count: 45,
          percentage: 0.04,
          severity: 'low',
          description: '电压字段存在少量缺失值'
        },
        {
          type: 'outliers',
          column: 'load',
          count: 23,
          percentage: 0.02,
          severity: 'low',
          description: '负荷数据存在轻微异常值'
        }
      ],
      suggestions: [
        {
          issue: 'missing_values',
          method: 'interpolation',
          confidence: 0.95,
          description: '使用线性插值填充电压缺失值'
        }
      ]
    },
    '2': {
      overallScore: 78,
      totalRows: 89650,
      totalColumns: 12,
      issues: [
        {
          type: 'missing_values',
          column: 'temperature',
          count: 1250,
          percentage: 1.4,
          severity: 'medium',
          description: '温度字段存在缺失值，可能影响设备状态分析'
        },
        {
          type: 'duplicates',
          column: 'device_id',
          count: 89,
          percentage: 0.1,
          severity: 'high',
          description: '设备ID存在重复记录'
        }
      ],
      suggestions: [
        {
          issue: 'duplicates',
          method: 'remove_duplicates',
          confidence: 0.98,
          description: '删除重复的设备ID记录'
        },
        {
          issue: 'missing_values',
          method: 'mean_imputation',
          confidence: 0.85,
          description: '使用均值填充温度缺失值'
        }
      ]
    },
    '3': {
      overallScore: 65,
      totalRows: 67890,
      totalColumns: 10,
      issues: [
        {
          type: 'missing_values',
          column: 'energy_consumption',
          count: 3456,
          percentage: 5.1,
          severity: 'high',
          description: '能耗数据存在大量缺失值'
        },
        {
          type: 'outliers',
          column: 'power_factor',
          count: 234,
          percentage: 0.34,
          severity: 'medium',
          description: '功率因数存在异常值'
        },
        {
          type: 'inconsistent_format',
          column: 'timestamp',
          count: 567,
          percentage: 0.84,
          severity: 'medium',
          description: '时间戳格式不一致'
        }
      ],
      suggestions: [
        {
          issue: 'missing_values',
          method: 'forward_fill',
          confidence: 0.75,
          description: '使用前向填充处理能耗缺失值'
        },
        {
          issue: 'inconsistent_format',
          method: 'standardize_format',
          confidence: 0.92,
          description: '标准化时间戳格式'
        }
      ]
    }
  });

  // 模拟EDA洞察数据
  const [edaInsights] = useState<{[key: string]: EDAInsight[]}>({
    '1': [
      {
        type: 'correlation',
        title: '负荷与温度强相关',
        description: '电网负荷与环境温度存在强正相关关系（r=0.78），温度升高时负荷显著增加',
        confidence: 0.89
      },
      {
        type: 'trend',
        title: '负荷呈周期性变化',
        description: '负荷数据呈现明显的日周期和季节性变化模式',
        confidence: 0.95
      }
    ],
    '2': [
      {
        type: 'anomaly',
        title: '设备异常检测',
        description: '检测到3台设备存在异常运行模式，建议进行维护检查',
        confidence: 0.82
      },
      {
        type: 'distribution',
        title: '设备状态分布',
        description: '85%设备运行正常，12%需要关注，3%存在故障风险',
        confidence: 0.91
      }
    ],
    '3': [
      {
        type: 'trend',
        title: '能耗上升趋势',
        description: '近3个月能耗呈上升趋势，平均增长率为2.3%',
        confidence: 0.87
      }
    ]
  });

  const handleStartAnalysis = async () => {
    try {
      const formValues = await form.validateFields();
      if (!formValues.dataSource || !formValues.analysisType) {
        message.error('请选择数据源和分析类型');
        return;
      }
      
      setAnalysisRunning(true);
      setAgentModalVisible(true);
      
      // 调用智谱AI进行分析
      const analysisResult = await zhipuAIService.executeMultiAgentAnalysis({
        dataSource: formValues.dataSource,
        dataContent: formValues.description || '电网负荷数据分析',
        analysisType: formValues.analysisType,
        // reportType: formValues.reportType,
        // description: formValues.description,
        // template: formValues.template
      });
      
      // 保存分析结果到数据库
      const reportTitle = `AI分析报告 - ${new Date().toLocaleDateString()}`;
      const reportContent = analysisResult.success && analysisResult.data 
        ? analysisResult.data.analysis 
        : '报告内容生成中...';
      
      const { data: reportData, error } = await supabase
        .from('reports')
        .insert({
          title: reportTitle,
          content: {
            prompt: formValues.description || '请分析一下电网负荷的发展趋势',
            aiResponse: reportContent,
            generatedAt: new Date().toISOString()
          },
          status: 'draft',
          owner_id: '00000000-0000-0000-0000-000000000001'
        } as any)
        .select()
        .single();
        
      if (error) {
        console.error('保存报告失败:', error);
        message.error('保存分析结果失败');
        return;
      }
      
      message.success('AI分析完成，报告已保存');
      
      // 跳转到报告编辑页面，传递实际的分析结果
      setTimeout(() => {
        handleAgentComplete(analysisResult);
      }, 2000);
      
    } catch (error) {
      console.error('分析失败:', error);
      message.error('分析失败，请重试');
    } finally {
      setAnalysisRunning(false);
      setAgentModalVisible(false);
    }
  };

  const handleAgentComplete = (analysisResult?: any) => {
    // 使用实际的AI分析结果，如果没有则使用默认模板数据
    const actualData = analysisResult?.success && analysisResult.data ? {
      title: `AI智能分析报告 - ${new Date().toLocaleDateString()}`,
      analysisType: '智谱AI分析',
      dataSource: form.getFieldValue('dataSource') || '电网数据',
      analysis: analysisResult.data.analysis,
      insights: analysisResult.data.insights || [],
      recommendations: analysisResult.data.recommendations || [],
      confidence: (analysisResult.data.confidence * 100).toFixed(1),
      metadata: analysisResult.data.metadata
    } : {
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
    };

    navigate('/editor', {
      state: {
        analysisData: {
          type: 'ai-analysis-result',
          template: selectedTemplate || 'comprehensive',
          data: actualData
        }
      }
    });
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

  // 数据质量相关处理函数
  const handleQualityCheck = async (dataSource: DataSource) => {
    setIsQualityChecking(true);
    try {
      // 模拟质量检测过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      message.success(`${dataSource.name} 数据质量检测完成`);
    } catch (error) {
      message.error('数据质量检测失败');
    } finally {
      setIsQualityChecking(false);
    }
  };

  const handleViewHealthReport = (dataSource: DataSource) => {
    setSelectedDataSourceForHealth(dataSource);
    setHealthReportModalVisible(true);
  };

  const handleViewEDAReport = (dataSource: DataSource) => {
    setSelectedDataSourceForHealth(dataSource);
    setEdaModalVisible(true);
  };

  const handleRepairData = (dataSource: DataSource) => {
    setSelectedDataSourceForHealth(dataSource);
    setRepairModalVisible(true);
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'fair': return 'orange';
      case 'poor': return 'red';
      default: return 'gray';
    }
  };

  const getHealthStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return '优秀';
      case 'good': return '良好';
      case 'fair': return '一般';
      case 'poor': return '较差';
      default: return '未知';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'green';
      case 'medium': return 'orange';
      case 'high': return 'red';
      default: return 'gray';
    }
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
      title: '质量评分',
      key: 'qualityScore',
      render: (record: DataSource) => (
        <Space direction="vertical" size={0}>
          <Progress 
            percent={record.qualityScore || 0} 
            size="small" 
            strokeColor={{
              '0%': record.qualityScore && record.qualityScore >= 80 ? '#52c41a' : 
                    record.qualityScore && record.qualityScore >= 60 ? '#faad14' : '#ff4d4f',
              '100%': record.qualityScore && record.qualityScore >= 80 ? '#52c41a' : 
                      record.qualityScore && record.qualityScore >= 60 ? '#faad14' : '#ff4d4f'
            }}
          />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.qualityScore || 0}分
          </Text>
        </Space>
      )
    },
    {
      title: '健康状态',
      key: 'healthStatus',
      render: (record: DataSource) => (
        <Space direction="vertical" size={0}>
          <Tag color={getHealthStatusColor(record.healthStatus || 'unknown')}>
            {getHealthStatusText(record.healthStatus || 'unknown')}
          </Tag>
          {record.issueCount !== undefined && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.issueCount}个问题
            </Text>
          )}
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
          <Tooltip title="数据质量检测">
            <Button 
              type="text" 
              icon={<BulbOutlined />}
              loading={isQualityChecking}
              onClick={() => handleQualityCheck(record)}
            />
          </Tooltip>
          <Tooltip title="健康报告">
            <Button 
              type="text" 
              icon={<BarChartOutlined />}
              onClick={() => handleViewHealthReport(record)}
            />
          </Tooltip>
          {record.hasEDAReport && (
            <Tooltip title="EDA分析">
              <Button 
                type="text" 
                icon={<LineChartOutlined />}
                onClick={() => handleViewEDAReport(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="智能修复">
            <Button 
              type="text" 
              icon={<RobotOutlined />}
              onClick={() => handleRepairData(record)}
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



      <Card className="shadow-sm">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'datasource',
              label: <span><DatabaseOutlined />数据源管理</span>,
              children: (
                <>
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
                </>
              )
            },
            {
              key: 'analysis',
              label: <span><BarChartOutlined />智能分析</span>,
              children: (
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
              )
            },
            {
              key: 'results',
              label: <span><BulbOutlined />分析结果</span>,
              children: (
                <>
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
                </>
              )
            }
          ]}
        />
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

      {/* Agent Progress Modal */}
      <AgentProgressModal
        visible={agentModalVisible}
        onClose={() => setAgentModalVisible(false)}
        onComplete={handleAgentComplete}
      />

      {/* Data Health Report Modal */}
      <Modal
        title={`数据健康报告 - ${selectedDataSourceForHealth?.name}`}
        open={healthReportModalVisible}
        onCancel={() => setHealthReportModalVisible(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setHealthReportModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedDataSourceForHealth && healthReports[selectedDataSourceForHealth.id] && (
          <div>
            {/* 总体健康评分 */}
            <Card className="mb-4">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2" style={{ color: getHealthStatusColor(selectedDataSourceForHealth.healthStatus || 'fair') }}>
                  {healthReports[selectedDataSourceForHealth.id].overallScore}
                </div>
                <div className="text-lg mb-2">总体健康评分</div>
                <Tag color={getHealthStatusColor(selectedDataSourceForHealth.healthStatus || 'fair')}>
                  {getHealthStatusText(selectedDataSourceForHealth.healthStatus || 'fair')}
                </Tag>
              </div>
            </Card>

            {/* 问题详情 */}
            <Card title="数据质量问题" className="mb-4">
              <List
                dataSource={healthReports[selectedDataSourceForHealth.id].issues}
                renderItem={(issue) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <div style={{ color: getSeverityColor(issue.severity) }}>
                          {issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢'}
                        </div>
                      }
                      title={issue.column}
                      description={
                        <div>
                          <div>{issue.description}</div>
                          <div className="mt-1">
                            <Tag color={getSeverityColor(issue.severity)}>
                              {issue.severity === 'high' ? '高' : issue.severity === 'medium' ? '中' : '低'}
                            </Tag>
                            <Text type="secondary">影响行数: {issue.count} ({issue.percentage.toFixed(2)}%)</Text>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>

            {/* 修复建议 */}
            <Card title="修复建议">
              <List
                dataSource={healthReports[selectedDataSourceForHealth.id].suggestions}
                renderItem={(suggestion) => (
                  <List.Item
                    actions={[
                      <Button type="link" size="small">
                        应用修复
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<div>💡</div>}
                      title={suggestion.issue}
                      description={suggestion.description}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>
        )}
      </Modal>

      {/* EDA Analysis Modal */}
      <Modal
        title={`EDA分析报告 - ${selectedDataSourceForHealth?.name}`}
        open={edaModalVisible}
        onCancel={() => setEdaModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setEdaModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedDataSourceForHealth && edaInsights[selectedDataSourceForHealth.id] && (
          <div>
            {/* 数据概览 */}
            <Card title="数据概览" className="mb-4">
              <Row gutter={[16, 16]}>
                <Col span={6}>
                  <Statistic title="总行数" value={1000} />
                </Col>
                <Col span={6}>
                  <Statistic title="总列数" value={15} />
                </Col>
                <Col span={6}>
                  <Statistic title="缺失值" value={25} />
                </Col>
                <Col span={6}>
                  <Statistic title="重复行" value={5} />
                </Col>
              </Row>
            </Card>

            {/* 数据分布 */}
            <Card title="数据分布分析" className="mb-4">
              <div className="bg-gray-50 p-4 rounded text-center">
                <div className="text-6xl mb-2">📊</div>
                <Text type="secondary">数据分布图表占位符</Text>
                <div className="mt-2">
                  <Text>检测到正态分布特征，建议使用参数统计方法</Text>
                </div>
              </div>
            </Card>

            {/* 关键洞察 */}
            <Card title="关键洞察">
              <List
                dataSource={edaInsights[selectedDataSourceForHealth.id] || []}
                renderItem={(insight: EDAInsight) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<div>🔍</div>}
                      title={insight.title}
                      description={insight.description}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>
        )}
      </Modal>

      {/* Smart Repair Modal */}
      <Modal
        title={`智能修复 - ${selectedDataSourceForHealth?.name}`}
        open={repairModalVisible}
        onCancel={() => setRepairModalVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setRepairModalVisible(false)}>
            取消
          </Button>,
          <Button key="repair" type="primary" loading={isQualityChecking}>
            执行修复
          </Button>
        ]}
      >
        {selectedDataSourceForHealth && healthReports[selectedDataSourceForHealth.id] && (
          <div>
            <Alert
              message="智能修复说明"
              description="系统将自动修复检测到的数据质量问题，请确认后执行修复操作。"
              type="info"
              className="mb-4"
            />
            
            <Card title="待修复问题">
              <List
                dataSource={healthReports[selectedDataSourceForHealth.id].issues.filter(issue => issue.severity !== 'low')}
                renderItem={(issue) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Checkbox defaultChecked>
                          {issue.severity === 'high' ? '🔴' : '🟡'}
                        </Checkbox>
                      }
                      title={issue.column}
                      description={
                        <div>
                          <div>{issue.description}</div>
                          <div className="mt-1">
                            <Tag color={getSeverityColor(issue.severity)}>
                              {issue.severity === 'high' ? '高优先级' : '中优先级'}
                            </Tag>
                            <Text type="secondary">预计修复时间: 2-5分钟</Text>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AIAnalysis;