import React, { useState } from 'react';
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

  DatabaseOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  PlayCircleOutlined,
  StopOutlined,
  DownloadOutlined,

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
import AgentProgressModal from '../components/AgentProgressModal';

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
  const [activeTab, setActiveTab] = useState('datasource');
  const [selectedDataSource, setSelectedDataSource] = useState<string>('');
  const [analysisType, setAnalysisType] = useState<string>('');
  const [reportType, setReportType] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 五大智能体定义
  const intelligentAgents = [
    {
      id: 'data-collector',
      name: '数据采集智能体',
      description: '负责从各种数据源采集电力数据',
      status: 'active',
      tasks: ['电网运行数据采集', '用电量统计', '设备状态监控'],
      efficiency: 95.8,
      icon: 'DatabaseOutlined'
    },
    {
      id: 'data-processor',
      name: '数据处理智能体',
      description: '对采集的数据进行清洗和预处理',
      status: 'active',
      tasks: ['数据清洗', '异常值检测', '数据标准化'],
      efficiency: 92.3,
      icon: 'ApiOutlined'
    },
    {
      id: 'analyzer',
      name: '分析智能体',
      description: '执行深度数据分析和模式识别',
      status: 'active',
      tasks: ['负荷预测', '故障分析', '效率评估'],
      efficiency: 89.7,
      icon: 'BarChartOutlined'
    },
    {
      id: 'insight-generator',
      name: '洞察生成智能体',
      description: '基于分析结果生成业务洞察',
      status: 'active',
      tasks: ['趋势识别', '风险评估', '优化建议'],
      efficiency: 91.2,
      icon: 'BulbOutlined'
    },
    {
      id: 'report-writer',
      name: '报告生成智能体',
      description: '自动生成专业的分析报告',
      status: 'active',
      tasks: ['报告撰写', '图表生成', '格式优化'],
      efficiency: 94.1,
      icon: 'FileTextOutlined'
    }
  ];

  // 山西国网数据源
  const dataSources: DataSource[] = [
    {
      id: '1',
      name: '山西电网运行数据.xlsx',
      type: 'file',
      status: 'connected',
      size: '15.8MB',
      lastUpdated: '2024-01-15 14:30',
      records: 125420
    },
    {
      id: '2',
      name: '国网山西省电力公司数据库',
      type: 'database',
      status: 'connected',
      lastUpdated: '2024-01-15 16:45',
      records: 2896500
    },
    {
      id: '3',
      name: '电力调度API接口',
      type: 'api',
      status: 'connected',
      lastUpdated: '2024-01-15 17:20',
      records: 458920
    }
  ];

  const analysisTasks: AnalysisTask[] = [
    {
      id: '1',
      name: '电网负荷趋势分析',
      dataSource: '山西电网运行数据.xlsx',
      analysisType: '趋势分析',
      status: 'completed',
      progress: 100,
      startTime: '2024-01-15 14:35',
      duration: '5分钟',
      insights: 12
    },
    {
      id: '2',
      name: '用电行为模式分析',
      dataSource: '国网山西省电力公司数据库',
      analysisType: '行为分析',
      status: 'running',
      progress: 75,
      startTime: '2024-01-15 16:50'
    },
    {
      id: '3',
      name: '电力需求预测分析',
      dataSource: '电力调度API接口',
      analysisType: '预测分析',
      status: 'pending',
      progress: 0,
      startTime: ''
    }
  ];

  const sampleData = [
    { key: '1', region: '太原供电区', load: 1250, consumption: 18750000, growth: '+15.2%' },
    { key: '2', region: '大同供电区', load: 890, consumption: 22250000, growth: '+8.7%' },
    { key: '3', region: '临汾供电区', load: 1560, consumption: 9360000, growth: '+22.1%' },
    { key: '4', region: '运城供电区', load: 2340, consumption: 9360000, growth: '+12.5%' },
    { key: '5', region: '晋中供电区', load: 3200, consumption: 8000000, growth: '+18.9%' }
  ];

  const dataSourceColumns = [
    {
      title: '数据源名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: DataSource) => (
        <Space>
          {record.type === 'file' && <FileTextOutlined />}
          {record.type === 'database' && <DatabaseOutlined />}
          {record.type === 'api' && <ApiOutlined />}
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap = {
          file: { text: '文件', color: 'blue' },
          database: { text: '数据库', color: 'green' },
          api: { text: 'API', color: 'orange' }
        };
        return <Tag color={typeMap[type as keyof typeof typeMap].color}>{typeMap[type as keyof typeof typeMap].text}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          connected: { text: '已连接', color: 'success' },
          disconnected: { text: '未连接', color: 'default' },
          error: { text: '错误', color: 'error' }
        };
        return <Badge status={statusMap[status as keyof typeof statusMap].color as any} text={statusMap[status as keyof typeof statusMap].text} />;
      }
    },
    {
      title: '记录数',
      dataIndex: 'records',
      key: 'records',
      render: (records: number) => records?.toLocaleString() || '-'
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any) => (
        <Space>
          <Tooltip title="预览数据">
            <Button type="text" icon={<EyeOutlined />} onClick={() => setPreviewModalVisible(true)} />
          </Tooltip>
          <Tooltip title="编辑配置">
            <Button type="text" icon={<EditOutlined />} onClick={() => setConfigModalVisible(true)} />
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
        const mappedStatus = status === 'connected' ? 'completed' : status === 'error' ? 'pending' : 'processing';
        return <StatusTag status={mappedStatus} animated />;
      }
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => <AnimatedProgress percent={progress} status={progress === 100 ? 'success' : 'active'} />
    },
    {
      title: '洞察数量',
      dataIndex: 'insights',
      key: 'insights',
      render: (insights: number) => insights ? <Tag color="gold">{insights}个洞察</Tag> : '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: AnalysisTask) => (
        <Space>
          {record.status === 'running' && (
            <Button type="text" icon={<StopOutlined />} danger>
              停止
            </Button>
          )}
          {record.status === 'completed' && (
            <>
              <EnhancedButton type="text" icon={<EyeOutlined />} variant="glow" size="small">
                查看结果
              </EnhancedButton>
              <EnhancedButton type="text" icon={<DownloadOutlined />} variant="pulse" size="small">
                导出
              </EnhancedButton>
            </>
          )}
        </Space>
      )
    }
  ];

  const previewColumns = [
    { title: '供电区域', dataIndex: 'region', key: 'region' },
    { title: '负荷(MW)', dataIndex: 'load', key: 'load' },
    { title: '用电量(kWh)', dataIndex: 'consumption', key: 'consumption', render: (value: number) => `${value.toLocaleString()}` },
    { title: '增长率', dataIndex: 'growth', key: 'growth', render: (value: string) => <Tag color={value.startsWith('+') ? 'green' : 'red'}>{value}</Tag> }
  ];

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls,.csv,.json',
    beforeUpload: () => {
      message.success('文件上传成功！');
      return false;
    }
  };

  const handleStartAnalysis = () => {
    if (!selectedDataSource || !analysisType || !reportType) {
      message.warning('请选择数据源、分析类型和报告类型');
      return;
    }
    setIsAnalyzing(true);
    setShowAgentModal(true);
    message.success('启动智能体协作分析...');
  };

  const handleAgentComplete = () => {
    setIsAnalyzing(false);
    setShowAgentModal(false);
    message.success('智能体协作分析完成！正在跳转到报告编辑器...');
    // 这里可以添加导航到报告编辑器的逻辑
    // navigate('/editor');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-6">
          <Title level={2} className="mb-2 flex items-center">
            <RobotOutlined className="mr-3 text-blue-600" />
            AI分析中心
          </Title>
          <Paragraph className="text-gray-600 mb-0">
            智能数据分析，自动生成洞察报告，助力业务决策
          </Paragraph>
        </div>

        {/* Quick Stats */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <InteractiveCard effect="lift">
              <AnimatedStatistic
                title="数据源总数"
                value={3}
                prefix={<DatabaseOutlined className="text-blue-600" />}
                valueStyle={{ color: '#1890ff' }}
                trend="up"
                trendValue={12.5}
              />
            </InteractiveCard>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <InteractiveCard effect="glow">
              <AnimatedStatistic
                title="分析任务"
                value={3}
                prefix={<BarChartOutlined className="text-green-600" />}
                valueStyle={{ color: '#52c41a' }}
                trend="up"
                trendValue={2.1}
              />
            </InteractiveCard>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <InteractiveCard effect="lift">
              <AnimatedStatistic
                title="生成洞察"
                value={12}
                prefix={<BulbOutlined className="text-orange-600" />}
                valueStyle={{ color: '#fa8c16' }}
                trend="up"
                trendValue={50}
              />
            </InteractiveCard>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <InteractiveCard effect="glow">
              <AnimatedStatistic
                title="数据记录"
                value={3480840}
                prefix={<TableOutlined className="text-purple-600" />}
                valueStyle={{ color: '#722ed1' }}
                trend="up"
                trendValue={25.8}
              />
            </InteractiveCard>
          </Col>
        </Row>

        {/* Main Content */}
        <Card className="border-0 shadow-sm">
          <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
            <TabPane tab={<span><RobotOutlined />智能体协作</span>} key="agents">
              <Row gutter={[24, 24]}>
                <Col span={24}>
                  <Alert
                    message="五大智能体协作系统"
                    description="数据采集 → 数据处理 → 深度分析 → 洞察生成 → 报告输出的全自动化流程"
                    type="info"
                    showIcon
                    className="mb-6"
                  />
                </Col>
                {intelligentAgents.map((agent, index) => (
                  <Col xs={24} lg={12} xl={8} key={agent.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <InteractiveCard effect="lift">
                        <Card
                          title={
                            <Space>
                              <RobotOutlined className="text-blue-600" />
                              <span>{agent.name}</span>
                              <Badge status="success" text="运行中" />
                            </Space>
                          }
                          extra={
                            <Tag color="green">{agent.efficiency}%</Tag>
                          }
                          className="h-full"
                        >
                          <div className="mb-4">
                            <Text type="secondary">{agent.description}</Text>
                          </div>
                          <div className="mb-4">
                            <Text strong>当前任务：</Text>
                            <div className="mt-2">
                              {agent.tasks.map((task, taskIndex) => (
                                <Tag key={taskIndex} color="blue" className="mb-1">
                                  {task}
                                </Tag>
                              ))}
                            </div>
                          </div>
                          <div className="mb-2">
                            <Text strong>运行效率</Text>
                          </div>
                          <AnimatedProgress
                             percent={agent.efficiency}
                             status="active"
                           />
                        </Card>
                      </InteractiveCard>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </TabPane>
            <TabPane tab={<span><DatabaseOutlined />数据源管理</span>} key="datasource">
              <div className="mb-4">
                <Row gutter={[16, 16]} align="middle">
                  <Col flex="auto">
                    <Space>
                      <Upload {...uploadProps}>
                        <EnhancedButton icon={<CloudUploadOutlined />} type="primary" variant="glow">
                          上传文件
                        </EnhancedButton>
                      </Upload>
                      <EnhancedButton icon={<DatabaseOutlined />} onClick={() => setConfigModalVisible(true)} variant="pulse">
                        连接数据库
                      </EnhancedButton>
                      <EnhancedButton icon={<ApiOutlined />} variant="bounce">
                        配置API
                      </EnhancedButton>
                    </Space>
                  </Col>
                  <Col>
                    <Input.Search
                      placeholder="搜索数据源"
                      style={{ width: 200 }}
                      allowClear
                    />
                  </Col>
                </Row>
              </div>
              <Table
                columns={dataSourceColumns}
                dataSource={dataSources}
                rowKey="id"
                pagination={false}
                className="border border-gray-200 rounded-lg"
              />
            </TabPane>

            <TabPane tab={<span><BarChartOutlined />智能分析</span>} key="analysis">
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                  <Card title="分析配置" className="h-full">
                    <Form layout="vertical">
                      <Form.Item label="选择数据源" required>
                        <Select
                          placeholder="请选择数据源"
                          value={selectedDataSource}
                          onChange={setSelectedDataSource}
                          className="w-full"
                        >
                          {dataSources.filter(ds => ds.status === 'connected').map(ds => (
                            <Option key={ds.id} value={ds.name}>{ds.name}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item label="分析类型" required>
                        <Select
                          placeholder="请选择分析类型"
                          value={analysisType}
                          onChange={setAnalysisType}
                          className="w-full"
                        >
                          <Option value="trend">趋势分析</Option>
                          <Option value="behavior">行为分析</Option>
                          <Option value="prediction">预测分析</Option>
                          <Option value="correlation">关联分析</Option>
                          <Option value="clustering">聚类分析</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item label="报告类型" required>
                        <Select
                          placeholder="请选择报告类型"
                          value={reportType}
                          onChange={setReportType}
                          className="w-full"
                        >
                          <Option value="load_analysis">电网负荷分析报告</Option>
                          <Option value="equipment_status">设备运行状态报告</Option>
                          <Option value="energy_efficiency">能效分析报告</Option>
                          <Option value="fault_prediction">故障预测报告</Option>
                          <Option value="comprehensive">综合运营报告</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item label="分析描述">
                        <TextArea
                          rows={3}
                          placeholder="描述您希望分析的具体问题或目标..."
                        />
                      </Form.Item>
                      <Form.Item>
                        <EnhancedButton
                          type="primary"
                          icon={<PlayCircleOutlined />}
                          onClick={handleStartAnalysis}
                          loading={isAnalyzing}
                          size="large"
                          variant="gradient"
                        >
                          {isAnalyzing ? '分析中...' : '开始分析'}
                        </EnhancedButton>
                      </Form.Item>
                    </Form>
                  </Card>
                </Col>
                <Col xs={24} lg={16}>
                  <Card title="分析任务" className="h-full">
                    <Table
                      columns={taskColumns}
                      dataSource={analysisTasks}
                      rowKey="id"
                      pagination={false}
                      size="small"
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab={<span><BulbOutlined />分析结果</span>} key="results">
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                  <Card title="电网负荷趋势分析结果" extra={<Button icon={<DownloadOutlined />}>导出报告</Button>}>
                    <Alert
                      message="分析完成"
                      description="基于125,420条电网运行数据，AI识别出12个关键洞察，包括负荷峰谷特征、区域用电模式等。"
                      type="success"
                      showIcon
                      className="mb-4"
                    />
                    
                    <div className="mb-4">
                      <Title level={4}>关键洞察</Title>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                          <motion.div whileHover={{ scale: 1.02 }}>
                            <Card size="small" className="bg-blue-50 border-blue-200">
                              <div className="flex items-center">
                                <LineChartOutlined className="text-2xl text-blue-600 mr-3" />
                                <div>
                                  <Text strong>负荷增长趋势</Text>
                                  <br />
                                  <Text type="secondary">冬季用电负荷同比增长15.2%</Text>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <motion.div whileHover={{ scale: 1.02 }}>
                            <Card size="small" className="bg-green-50 border-green-200">
                              <div className="flex items-center">
                                <PieChartOutlined className="text-2xl text-green-600 mr-3" />
                                <div>
                                  <Text strong>供电结构优化</Text>
                                  <br />
                                  <Text type="secondary">清洁能源占比提升12%</Text>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        </Col>
                      </Row>
                    </div>

                    <Divider />
                    
                    <Title level={4}>数据详情</Title>
                    <Table
                      columns={previewColumns}
                      dataSource={sampleData}
                      pagination={false}
                      size="small"
                      className="border border-gray-200 rounded-lg"
                    />
                  </Card>
                </Col>
                <Col xs={24} lg={8}>
                  <Space direction="vertical" size="middle" className="w-full">
                    <Card title="AI建议" size="small">
                      <Space direction="vertical" size="small" className="w-full">
                        <Alert
                          message="重点关注太原供电区负荷管理"
                          description="建议优化调度策略，预计可降低5%峰值负荷"
                          type="info"
                          showIcon
                          className="text-sm"
                        />
                        <Alert
                          message="加强临汾供电区设备维护"
                          description="当前增长率22.1%，建议提前扩容"
                          type="warning"
                          showIcon
                          className="text-sm"
                        />
                      </Space>
                    </Card>
                    
                    <Card title="分析统计" size="small">
                      <Space direction="vertical" size="small" className="w-full">
                        <div className="flex justify-between">
                          <Text>数据准确度</Text>
                          <Text strong>98.5%</Text>
                        </div>
                        <Progress percent={98.5} size="small" />
                        <div className="flex justify-between">
                          <Text>置信度</Text>
                          <Text strong>95.2%</Text>
                        </div>
                        <Progress percent={95.2} size="small" />
                        <div className="flex justify-between">
                          <Text>处理时间</Text>
                          <Text strong>5分钟</Text>
                        </div>
                      </Space>
                    </Card>
                  </Space>
                </Col>
              </Row>
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
            <Button key="submit" type="primary">
              保存配置
            </Button>
          ]}
        >
          <Form form={form} layout="vertical">
            <Form.Item label="数据库类型" name="dbType" rules={[{ required: true }]}>
              <Select placeholder="请选择数据库类型">
                <Option value="mysql">MySQL</Option>
                <Option value="postgresql">PostgreSQL</Option>
                <Option value="oracle">Oracle</Option>
                <Option value="sqlserver">SQL Server</Option>
              </Select>
            </Form.Item>
            <Form.Item label="主机地址" name="host" rules={[{ required: true }]}>
              <Input placeholder="localhost" />
            </Form.Item>
            <Form.Item label="端口" name="port" rules={[{ required: true }]}>
              <Input placeholder="3306" />
            </Form.Item>
            <Form.Item label="数据库名" name="database" rules={[{ required: true }]}>
              <Input placeholder="database_name" />
            </Form.Item>
            <Form.Item label="用户名" name="username" rules={[{ required: true }]}>
              <Input placeholder="username" />
            </Form.Item>
            <Form.Item label="密码" name="password" rules={[{ required: true }]}>
              <Input.Password placeholder="password" />
            </Form.Item>
          </Form>
        </Modal>

        {/* Data Preview Modal */}
        <Modal
          title="数据预览"
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
              columns={previewColumns}
              dataSource={sampleData}
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Modal>

          {/* Agent Progress Modal */}
          <AgentProgressModal
            visible={showAgentModal}
            onComplete={handleAgentComplete}
            onClose={() => setShowAgentModal(false)}
          />
        </motion.div>
      </div>
  );
};

export default AIAnalysis;