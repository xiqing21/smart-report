import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Badge,
  Table,
  Tag,
  Space,
  Typography,
  Divider,
  Button,
  Timeline,
  Alert
} from 'antd';
import {
  DatabaseOutlined,
  BarChartOutlined,
  FileTextOutlined,
  SearchOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

interface AgentStatus {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'online' | 'busy' | 'offline' | 'error';
  cpu: number;
  memory: number;
  tasks: number;
  completedTasks: number;
  lastActive: string;
  description: string;
  color: string;
}

interface TaskLog {
  id: string;
  agentName: string;
  taskName: string;
  status: 'completed' | 'running' | 'failed';
  startTime: string;
  endTime?: string;
  duration?: string;
}

const AgentMonitor: React.FC = () => {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [loading, setLoading] = useState(false);

  // 初始化智能体状态数据
  useEffect(() => {
    const initialAgents: AgentStatus[] = [
      {
        id: 'data-collection',
        name: '数据采集智能体',
        icon: <DatabaseOutlined />,
        status: 'online',
        cpu: 45,
        memory: 62,
        tasks: 156,
        completedTasks: 152,
        lastActive: '2分钟前',
        description: '从营销2.0、智能电表等系统采集电网数据',
         color: '#1890ff'
      },
      {
        id: 'indicator-analysis',
        name: '指标分析智能体',
        icon: <BarChartOutlined />,
        status: 'busy',
        cpu: 78,
        memory: 84,
        tasks: 89,
        completedTasks: 87,
        lastActive: '正在运行',
        description: '基于4000+营销指标和电网运营指标分析',
         color: '#52c41a'
      },
      {
        id: 'policy-interpretation',
        name: '政策解读智能体',
        icon: <FileTextOutlined />,
        status: 'online',
        cpu: 32,
        memory: 48,
        tasks: 67,
        completedTasks: 65,
        lastActive: '5分钟前',
        description: '解读国网总部及山西省电力政策',
         color: '#722ed1'
      },
      {
        id: 'data-monitoring',
        name: '数据检测智能体',
        icon: <SearchOutlined />,
        status: 'online',
        cpu: 56,
        memory: 71,
        tasks: 234,
        completedTasks: 230,
        lastActive: '1分钟前',
        description: '电网数据质量监控和异常检测',
         color: '#fa8c16'
      },
      {
        id: 'report-generation',
        name: '报告生成智能体',
        icon: <EditOutlined />,
        status: 'busy',
        cpu: 89,
        memory: 76,
        tasks: 45,
        completedTasks: 43,
        lastActive: '正在运行',
        description: '生成符合国网标准的电网分析报告',
         color: '#13c2c2'
      }
    ];

    const initialTaskLogs: TaskLog[] = [
      {
        id: '1',
        agentName: '报告生成智能体',
        taskName: '山西电网月度负荷分析报告生成',
        status: 'running',
        startTime: '14:32:15',
      },
      {
        id: '2',
        agentName: '数据采集智能体',
        taskName: '智能电表用电数据采集',
        status: 'completed',
        startTime: '14:28:42',
        endTime: '14:31:18',
        duration: '2分36秒'
      },
      {
        id: '3',
        agentName: '指标分析智能体',
        taskName: '太原供电区负荷特征分析',
        status: 'completed',
        startTime: '14:25:33',
        endTime: '14:30:45',
        duration: '5分12秒'
      },
      {
        id: '4',
        agentName: '政策解读智能体',
        taskName: '清洁能源政策合规性检查',
        status: 'completed',
        startTime: '14:20:15',
        endTime: '14:24:58',
        duration: '4分43秒'
      },
      {
        id: '5',
        agentName: '数据检测智能体',
        taskName: '电网运行数据质量检测',
        status: 'failed',
        startTime: '14:15:22',
        endTime: '14:18:45',
        duration: '3分23秒'
      }
    ];

    setAgents(initialAgents);
    setTaskLogs(initialTaskLogs);
  }, []);

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      online: { color: 'success', text: '在线' },
      busy: { color: 'processing', text: '忙碌' },
      offline: { color: 'default', text: '离线' },
      error: { color: 'error', text: '错误' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge status={config.color as any} text={config.text} />;
  };

  // 获取任务状态标签
  const getTaskStatusTag = (status: string) => {
    const statusConfig = {
      completed: { color: 'success', icon: <CheckCircleOutlined />, text: '已完成' },
      running: { color: 'processing', icon: <ClockCircleOutlined />, text: '运行中' },
      failed: { color: 'error', icon: <ExclamationCircleOutlined />, text: '失败' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // 刷新数据
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // 模拟数据更新
      setAgents(prev => prev.map(agent => ({
        ...agent,
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        lastActive: agent.status === 'busy' ? '正在运行' : `${Math.floor(Math.random() * 10) + 1}分钟前`
      })));
    }, 1000);
  };

  // 任务日志表格列配置
  const taskColumns = [
    {
      title: '智能体',
      dataIndex: 'agentName',
      key: 'agentName',
      width: 150
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getTaskStatusTag(status)
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 100
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration: string, record: TaskLog) => {
        if (record.status === 'running') {
          return <Text type="secondary">运行中...</Text>;
        }
        return duration || '-';
      }
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>🤖 智能体监控中心</Title>
          <Text type="secondary">实时监控五大智能体运行状态和任务执行情况</Text>
        </div>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          loading={loading}
          onClick={handleRefresh}
        >
          刷新数据
        </Button>
      </div>

      {/* 智能体状态卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {agents.map((agent, index) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={agent.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                size="small"
                style={{
                  background: agent.status === 'busy' ? 'linear-gradient(135deg, #fff7e6, #fff2e8)' : 'white',
                  border: agent.status === 'busy' ? '1px solid #ffd591' : '1px solid #d9d9d9'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <motion.div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${agent.color}, ${agent.color}dd)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '16px',
                      flexShrink: 0
                    }}
                    animate={agent.status === 'busy' ? {
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={{
                      rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity }
                    }}
                  >
                    {agent.icon}
                  </motion.div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <Text strong style={{ fontSize: '14px' }}>
                        {agent.name}
                      </Text>
                      {getStatusBadge(agent.status)}
                    </div>
                    
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                      {agent.description}
                    </Text>
                    
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: '11px' }}>CPU</Text>
                        <Text style={{ fontSize: '11px' }}>{agent.cpu}%</Text>
                      </div>
                      <Progress percent={agent.cpu} size="small" strokeColor={agent.color} showInfo={false} />
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: '11px' }}>内存</Text>
                        <Text style={{ fontSize: '11px' }}>{agent.memory}%</Text>
                      </div>
                      <Progress percent={agent.memory} size="small" strokeColor={agent.color} showInfo={false} />
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '4px' }}>
                        <Text type="secondary">任务: {agent.completedTasks}/{agent.tasks}</Text>
                        <Text type="secondary">{agent.lastActive}</Text>
                      </div>
                    </Space>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* 系统概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="在线智能体"
              value={agents.filter(a => a.status === 'online' || a.status === 'busy').length}
              suffix={`/ ${agents.length}`}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="今日处理任务"
              value={agents.reduce((sum, agent) => sum + agent.completedTasks, 0)}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="平均CPU使用率"
              value={Math.round(agents.reduce((sum, agent) => sum + agent.cpu, 0) / agents.length)}
              suffix="%"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 任务执行日志 */}
      <Card title="📋 任务执行日志" style={{ marginBottom: '24px' }}>
        <Table
          columns={taskColumns}
          dataSource={taskLogs}
          rowKey="id"
          size="small"
          pagination={false}
          scroll={{ x: 600 }}
        />
      </Card>

      {/* 系统状态提醒 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="⚠️ 系统提醒" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="数据检测智能体任务失败"
                description="数据质量异常检测任务执行失败，请检查数据源连接"
                type="warning"
                showIcon
                closable
              />
              <Alert
                message="系统运行正常"
                description="所有智能体运行状态良好，任务执行效率95%"
                type="success"
                showIcon
                closable
              />
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="📈 性能趋势" size="small">
            <Timeline>
              <Timeline.Item color="green">
                <Text style={{ fontSize: '12px' }}>14:30 - 报告生成智能体启动新任务</Text>
              </Timeline.Item>
              <Timeline.Item color="blue">
                <Text style={{ fontSize: '12px' }}>14:25 - 指标分析完成客户流失分析</Text>
              </Timeline.Item>
              <Timeline.Item color="orange">
                <Text style={{ fontSize: '12px' }}>14:20 - 政策解读完成合规性检查</Text>
              </Timeline.Item>
              <Timeline.Item color="red">
                <Text style={{ fontSize: '12px' }}>14:15 - 数据检测任务执行失败</Text>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AgentMonitor;