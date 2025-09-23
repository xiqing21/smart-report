import React, { useState } from 'react'
import { Row, Col, Steps, List, Avatar, Progress, Tag, Space, Modal, Form, Input, Select, message, Typography, Divider, Tooltip } from 'antd'
import {
  RobotOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  EyeOutlined,
  DownloadOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  BulbOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
  BranchesOutlined,
  LineChartOutlined,
  SearchOutlined,
  FireOutlined,
  TrophyOutlined
} from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Status } from '@/components/ui'
import { designSystem } from '@/styles/design-system'

const { Title, Text } = Typography

interface AnalysisTask {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  dataSource: string
  analysisType: string
  startTime: string
  estimatedTime: string
  priority: 'high' | 'medium' | 'low'
  results?: {
    insights: number
    charts: number
    recommendations: number
    accuracy: number
  }
}

const IntelligentAnalysis: React.FC = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [form] = Form.useForm()

  const [analysisTasks, setAnalysisTasks] = useState<AnalysisTask[]>([
    {
      id: '1',
      name: '销售数据趋势分析',
      status: 'completed',
      progress: 100,
      dataSource: '销售数据库',
      analysisType: '趋势分析',
      startTime: '2024-01-15 10:30:00',
      estimatedTime: '15分钟',
      priority: 'high',
      results: {
        insights: 8,
        charts: 12,
        recommendations: 5,
        accuracy: 94
      }
    },
    {
      id: '2',
      name: '用户行为模式识别',
      status: 'running',
      progress: 65,
      dataSource: '用户行为数据',
      analysisType: '模式识别',
      startTime: '2024-01-15 14:15:00',
      estimatedTime: '25分钟',
      priority: 'medium'
    },
    {
      id: '3',
      name: '财务异常检测',
      status: 'pending',
      progress: 0,
      dataSource: '财务报表',
      analysisType: '异常检测',
      startTime: '待开始',
      estimatedTime: '20分钟',
      priority: 'high'
    },
    {
      id: '4',
      name: '库存优化建议',
      status: 'failed',
      progress: 0,
      dataSource: '产品库存',
      analysisType: '优化建议',
      startTime: '2024-01-15 09:00:00',
      estimatedTime: '30分钟',
      priority: 'low'
    },
    {
      id: '5',
      name: '客户价值分析',
      status: 'completed',
      progress: 100,
      dataSource: '客户数据',
      analysisType: '聚类分析',
      startTime: '2024-01-14 16:20:00',
      estimatedTime: '18分钟',
      priority: 'medium',
      results: {
        insights: 6,
        charts: 8,
        recommendations: 4,
        accuracy: 89
      }
    },
    {
      id: '6',
      name: '市场预测分析',
      status: 'running',
      progress: 35,
      dataSource: '市场数据',
      analysisType: '预测分析',
      startTime: '2024-01-15 15:45:00',
      estimatedTime: '40分钟',
      priority: 'high'
    }
  ])

  const analysisSteps = [
    {
      title: '选择数据源',
      description: '选择要分析的数据源',
      icon: <SearchOutlined />
    },
    {
      title: '配置分析参数',
      description: '设置分析类型和参数',
      icon: <BranchesOutlined />
    },
    {
      title: '启动AI分析',
      description: 'AI智能体开始分析',
      icon: <RobotOutlined />
    },
    {
      title: '查看结果',
      description: '获取分析结果和洞察',
      icon: <BulbOutlined />
    }
  ]

  const analysisTypes = [
    { 
      label: '趋势分析', 
      value: 'trend', 
      description: '分析数据的时间趋势和变化模式',
      icon: <LineChartOutlined />,
      color: designSystem.colors.primary
    },
    { 
      label: '异常检测', 
      value: 'anomaly', 
      description: '识别数据中的异常值和异常模式',
      icon: <ExclamationCircleOutlined />,
      color: designSystem.colors.error
    },
    { 
      label: '关联分析', 
      value: 'correlation', 
      description: '发现数据间的关联关系',
      icon: <BranchesOutlined />,
      color: designSystem.colors.secondary
    },
    { 
      label: '聚类分析', 
      value: 'clustering', 
      description: '将数据分组并识别模式',
      icon: <BarChartOutlined />,
      color: designSystem.colors.success
    },
    { 
      label: '预测分析', 
      value: 'prediction', 
      description: '基于历史数据预测未来趋势',
      icon: <ThunderboltOutlined />,
      color: designSystem.colors.warning
    },
    { 
      label: '模式识别', 
      value: 'pattern', 
      description: '识别数据中的重复模式和规律',
      icon: <SearchOutlined />,
      color: designSystem.colors.purple
    }
  ]

  const dataSources = [
    { label: '销售数据库', value: 'sales_db' },
    { label: '用户行为数据', value: 'user_behavior' },
    { label: '财务报表', value: 'financial' },
    { label: '产品库存', value: 'inventory' },
    { label: '客户数据', value: 'customer' },
    { label: '市场数据', value: 'market' }
  ]

  const filterOptions = [
    { label: '全部', value: 'all' },
    { label: '运行中', value: 'running' },
    { label: '已完成', value: 'completed' },
    { label: '等待中', value: 'pending' },
    { label: '失败', value: 'failed' }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return designSystem.colors.error
      case 'medium':
        return designSystem.colors.warning
      case 'low':
        return designSystem.colors.success
      default:
        return designSystem.colors.gray
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return '高优先级'
      case 'medium':
        return '中优先级'
      case 'low':
        return '低优先级'
      default:
        return '未知'
    }
  }

  const getAnalysisTypeIcon = (type: string) => {
    const typeConfig = analysisTypes.find(t => t.label === type)
    return typeConfig?.icon || <BarChartOutlined />
  }

  const getAnalysisTypeColor = (type: string) => {
    const typeConfig = analysisTypes.find(t => t.label === type)
    return typeConfig?.color || designSystem.colors.gray
  }

  const handleStartAnalysis = (task: AnalysisTask) => {
    if (task.status === 'pending') {
      setAnalysisTasks(prev => prev.map(item => 
        item.id === task.id 
          ? { ...item, status: 'running', startTime: new Date().toLocaleString('zh-CN') }
          : item
      ))
      message.success('分析任务已启动')
    }
  }

  const handleStopAnalysis = (task: AnalysisTask) => {
    if (task.status === 'running') {
      setAnalysisTasks(prev => prev.map(item => 
        item.id === task.id 
          ? { ...item, status: 'pending', progress: 0 }
          : item
      ))
      message.info('分析任务已停止')
    }
  }

  const handleViewResults = (task: AnalysisTask) => {
    if (task.status === 'completed') {
      navigate(`/intelligent-analysis/results/${task.id}`)
    }
  }

  const handleCreateTask = () => {
    form.validateFields().then(values => {
      const newTask: AnalysisTask = {
        id: Date.now().toString(),
        name: values.name,
        status: 'pending',
        progress: 0,
        dataSource: values.dataSource,
        analysisType: values.analysisType,
        startTime: '待开始',
        estimatedTime: '预估中',
        priority: values.priority || 'medium'
      }
      setAnalysisTasks(prev => [...prev, newTask])
      message.success('分析任务创建成功')
      setIsModalVisible(false)
      form.resetFields()
    })
  }

  const filteredTasks = selectedFilter === 'all' 
    ? analysisTasks 
    : analysisTasks.filter(task => task.status === selectedFilter)

  const runningTasks = analysisTasks.filter(task => task.status === 'running').length
  const completedTasks = analysisTasks.filter(task => task.status === 'completed').length
  const totalInsights = analysisTasks.reduce((sum, task) => sum + (task.results?.insights || 0), 0)
  const avgAccuracy = Math.round(
    analysisTasks
      .filter(task => task.results?.accuracy)
      .reduce((sum, task) => sum + (task.results?.accuracy || 0), 0) / 
    analysisTasks.filter(task => task.results?.accuracy).length
  ) || 0

  const statsCards = [
    {
      title: '总任务数',
      value: analysisTasks.length,
      icon: <RobotOutlined />,
      color: designSystem.colors.primary,
      trend: '+3 本周'
    },
    {
      title: '运行中',
      value: runningTasks,
      icon: <LoadingOutlined />,
      color: designSystem.colors.info,
      trend: `${runningTasks}个任务进行中`
    },
    {
      title: '已完成',
      value: completedTasks,
      icon: <TrophyOutlined />,
      color: designSystem.colors.success,
      trend: `${Math.round((completedTasks / analysisTasks.length) * 100)}% 完成率`
    },
    {
      title: '平均准确率',
      value: `${avgAccuracy}%`,
      icon: <FireOutlined />,
      color: avgAccuracy > 90 ? designSystem.colors.success : avgAccuracy > 80 ? designSystem.colors.warning : designSystem.colors.error,
      trend: avgAccuracy > 90 ? '优秀' : avgAccuracy > 80 ? '良好' : '需优化'
    }
  ]

  return (
    <div>
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: designSystem.spacing.xl }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ 
              margin: 0, 
              color: designSystem.colors.text.primary,
              fontSize: designSystem.typography.fontSize.xl
            }}>
              智能分析
            </Title>
            <Text style={{ 
              color: designSystem.colors.text.secondary,
              fontSize: designSystem.typography.fontSize.sm
            }}>
              AI驱动的数据分析和洞察发现
            </Text>
          </div>
          <Button 
            variant="primary"
            size="md"
            onClick={() => setIsModalVisible(true)}
          >
            <PlusOutlined /> 创建分析任务
          </Button>
        </div>
      </motion.div>

      {/* 数据概览卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Row gutter={[24, 24]} style={{ marginBottom: designSystem.spacing.xl }}>
          {statsCards.map((stat, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card 
                hoverable
                style={{ 
                  textAlign: 'center',
                  border: `1px solid ${designSystem.colors.border.light}`,
                  borderRadius: designSystem.borderRadius.lg
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: designSystem.borderRadius.full,
                    background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}40)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: stat.color,
                    fontSize: '24px'
                  }}>
                    {stat.icon}
                  </div>
                  <div style={{ 
                    fontSize: designSystem.typography.fontSize.xxl, 
                    fontWeight: designSystem.typography.fontWeight.bold, 
                    color: designSystem.colors.text.primary,
                    marginBottom: designSystem.spacing.xs
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ 
                    color: designSystem.colors.text.secondary, 
                    fontSize: designSystem.typography.fontSize.sm,
                    marginBottom: designSystem.spacing.xs
                  }}>
                    {stat.title}
                  </div>
                  <div style={{ 
                    color: stat.color, 
                    fontSize: designSystem.typography.fontSize.xs,
                    fontWeight: designSystem.typography.fontWeight.medium
                  }}>
                    {stat.trend}
                  </div>
                </motion.div>
              </Card>
            </Col>
          ))}
        </Row>
      </motion.div>

      <Row gutter={[24, 24]}>
        {/* 分析流程 */}
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card 
              title={
                <span style={{ 
                  fontSize: designSystem.typography.fontSize.lg,
                  fontWeight: designSystem.typography.fontWeight.semibold,
                  color: designSystem.colors.text.primary
                }}>
                  分析流程
                </span>
              }
              style={{ 
                height: '600px',
                border: `1px solid ${designSystem.colors.border.light}`,
                borderRadius: designSystem.borderRadius.lg
              }}
            >
              <Steps
                direction="vertical"
                current={currentStep}
                style={{ marginBottom: designSystem.spacing.xl }}
              >
                {analysisSteps.map((step, index) => (
                  <Steps.Step
                    key={index}
                    title={
                      <span style={{ 
                        fontSize: designSystem.typography.fontSize.sm,
                        fontWeight: designSystem.typography.fontWeight.medium
                      }}>
                        {step.title}
                      </span>
                    }
                    description={
                      <span style={{ 
                        fontSize: designSystem.typography.fontSize.xs,
                        color: designSystem.colors.text.secondary
                      }}>
                        {step.description}
                      </span>
                    }
                    icon={
                      <div style={{
                        color: index <= currentStep ? designSystem.colors.primary : designSystem.colors.text.secondary
                      }}>
                        {step.icon}
                      </div>
                    }
                  />
                ))}
              </Steps>
              
              <div style={{ marginTop: designSystem.spacing.xl }}>
                <Button 
                  variant="primary"
                  size="md"
                  block
                  onClick={() => setIsModalVisible(true)}
                >
                  <PlusOutlined /> 创建新分析任务
                </Button>
              </div>
              
              <Divider style={{ margin: `${designSystem.spacing.lg} 0` }} />
              
              {/* 分析类型快捷选择 */}
              <div>
                <Text style={{ 
                  fontSize: designSystem.typography.fontSize.sm,
                  fontWeight: designSystem.typography.fontWeight.medium,
                  color: designSystem.colors.text.primary,
                  marginBottom: designSystem.spacing.md,
                  display: 'block'
                }}>
                  快捷分析类型
                </Text>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: designSystem.spacing.sm }}>
                  {analysisTypes.slice(0, 4).map((type, index) => (
                    <Tooltip key={index} title={type.description}>
                      <div
                        style={{
                          padding: designSystem.spacing.sm,
                          border: `1px solid ${designSystem.colors.border.light}`,
                          borderRadius: designSystem.borderRadius.md,
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          ':hover': {
                            borderColor: type.color,
                            backgroundColor: `${type.color}10`
                          }
                        }}
                        onClick={() => {
                          form.setFieldsValue({ analysisType: type.label })
                          setIsModalVisible(true)
                        }}
                      >
                        <div style={{ color: type.color, fontSize: '16px', marginBottom: '4px' }}>
                          {type.icon}
                        </div>
                        <div style={{ 
                          fontSize: designSystem.typography.fontSize.xs,
                          color: designSystem.colors.text.primary
                        }}>
                          {type.label}
                        </div>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* 分析任务列表 */}
        <Col xs={24} lg={16}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card 
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: designSystem.typography.fontSize.lg,
                    fontWeight: designSystem.typography.fontWeight.semibold,
                    color: designSystem.colors.text.primary
                  }}>
                    分析任务
                  </span>
                  <Space>
                    <Select
                      value={selectedFilter}
                      onChange={setSelectedFilter}
                      options={filterOptions}
                      style={{ width: 120 }}
                      size="small"
                    />
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        analysisTasks.forEach(task => {
                          if (task.status === 'pending') {
                            handleStartAnalysis(task)
                          }
                        })
                      }}
                    >
                      <PlayCircleOutlined /> 批量启动
                    </Button>
                  </Space>
                </div>
              }
              style={{ 
                height: '600px', 
                overflow: 'auto',
                border: `1px solid ${designSystem.colors.border.light}`,
                borderRadius: designSystem.borderRadius.lg
              }}
            >
              <List
                itemLayout="vertical"
                dataSource={filteredTasks}
                renderItem={(task) => (
                  <List.Item
                    key={task.id}
                    style={{
                      padding: designSystem.spacing.md,
                      border: `1px solid ${designSystem.colors.border.light}`,
                      borderRadius: designSystem.borderRadius.md,
                      marginBottom: designSystem.spacing.sm,
                      background: designSystem.colors.background.primary
                    }}
                    actions={[
                      task.status === 'pending' && (
                        <Tooltip title="启动分析">
                          <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartAnalysis(task)}
                          >
                            <PlayCircleOutlined />
                          </Button>
                        </Tooltip>
                      ),
                      task.status === 'running' && (
                        <Tooltip title="停止分析">
                          <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStopAnalysis(task)}
                          >
                            <StopOutlined />
                          </Button>
                        </Tooltip>
                      ),
                      task.status === 'completed' && (
                        <Tooltip title="查看结果">
                          <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewResults(task)}
                          >
                            <EyeOutlined />
                          </Button>
                        </Tooltip>
                      ),
                      task.status === 'completed' && (
                        <Tooltip title="下载报告">
                          <Button 
                            variant="ghost"
                            size="sm"
                          >
                            <DownloadOutlined />
                          </Button>
                        </Tooltip>
                      )
                    ].filter(Boolean)}
                  >
                    <List.Item.Meta
                      avatar={
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: designSystem.borderRadius.md,
                          background: `linear-gradient(135deg, ${getAnalysisTypeColor(task.analysisType)}20, ${getAnalysisTypeColor(task.analysisType)}40)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: getAnalysisTypeColor(task.analysisType),
                          fontSize: '20px'
                        }}>
                          {getAnalysisTypeIcon(task.analysisType)}
                        </div>
                      }
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.sm, flexWrap: 'wrap' }}>
                          <span style={{ 
                            fontWeight: designSystem.typography.fontWeight.semibold,
                            fontSize: designSystem.typography.fontSize.sm,
                            color: designSystem.colors.text.primary
                          }}>
                            {task.name}
                          </span>
                          <Status 
                            type={task.status === 'completed' ? 'success' : task.status === 'running' ? 'info' : task.status === 'failed' ? 'error' : 'warning'} 
                            text={task.status === 'completed' ? '已完成' : task.status === 'running' ? '分析中' : task.status === 'failed' ? '失败' : '等待中'} 
                          />
                          <Tag 
                            color={getPriorityColor(task.priority)}
                            style={{ 
                              fontSize: designSystem.typography.fontSize.xs,
                              borderRadius: designSystem.borderRadius.sm
                            }}
                          >
                            {getPriorityText(task.priority)}
                          </Tag>
                        </div>
                      }
                      description={
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', gap: designSystem.spacing.lg, flexWrap: 'wrap' }}>
                            <span style={{ 
                              fontSize: designSystem.typography.fontSize.xs,
                              color: designSystem.colors.text.secondary
                            }}>
                              数据源：<Text style={{ color: designSystem.colors.text.primary }}>{task.dataSource}</Text>
                            </span>
                            <span style={{ 
                              fontSize: designSystem.typography.fontSize.xs,
                              color: designSystem.colors.text.secondary
                            }}>
                              类型：<Text style={{ color: designSystem.colors.text.primary }}>{task.analysisType}</Text>
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: designSystem.spacing.lg, flexWrap: 'wrap' }}>
                            <span style={{ 
                              fontSize: designSystem.typography.fontSize.xs,
                              color: designSystem.colors.text.secondary
                            }}>
                              开始时间：<Text style={{ color: designSystem.colors.text.primary }}>{task.startTime}</Text>
                            </span>
                            <span style={{ 
                              fontSize: designSystem.typography.fontSize.xs,
                              color: designSystem.colors.text.secondary
                            }}>
                              预估时间：<Text style={{ color: designSystem.colors.text.primary }}>{task.estimatedTime}</Text>
                            </span>
                          </div>
                          {task.status === 'running' && (
                            <Progress 
                              percent={task.progress} 
                              status="active"
                              strokeColor={designSystem.colors.primary}
                              style={{ marginTop: designSystem.spacing.xs }}
                            />
                          )}
                          {task.results && (
                            <div style={{ 
                              marginTop: designSystem.spacing.xs,
                              padding: designSystem.spacing.sm,
                              background: designSystem.colors.background.secondary,
                              borderRadius: designSystem.borderRadius.sm,
                              border: `1px solid ${designSystem.colors.border.light}`
                            }}>
                              <Space wrap>
                                <span style={{ 
                                  fontSize: designSystem.typography.fontSize.xs,
                                  color: designSystem.colors.text.secondary
                                }}>
                                  <BulbOutlined style={{ color: designSystem.colors.warning, marginRight: '4px' }} />
                                  洞察: <Text style={{ color: designSystem.colors.text.primary, fontWeight: designSystem.typography.fontWeight.medium }}>{task.results.insights}</Text>
                                </span>
                                <span style={{ 
                                  fontSize: designSystem.typography.fontSize.xs,
                                  color: designSystem.colors.text.secondary
                                }}>
                                  <BarChartOutlined style={{ color: designSystem.colors.info, marginRight: '4px' }} />
                                  图表: <Text style={{ color: designSystem.colors.text.primary, fontWeight: designSystem.typography.fontWeight.medium }}>{task.results.charts}</Text>
                                </span>
                                <span style={{ 
                                  fontSize: designSystem.typography.fontSize.xs,
                                  color: designSystem.colors.text.secondary
                                }}>
                                  <ThunderboltOutlined style={{ color: designSystem.colors.success, marginRight: '4px' }} />
                                  建议: <Text style={{ color: designSystem.colors.text.primary, fontWeight: designSystem.typography.fontWeight.medium }}>{task.results.recommendations}</Text>
                                </span>
                                <span style={{ 
                                  fontSize: designSystem.typography.fontSize.xs,
                                  color: designSystem.colors.text.secondary
                                }}>
                                  <TrophyOutlined style={{ color: designSystem.colors.purple, marginRight: '4px' }} />
                                  准确率: <Text style={{ color: designSystem.colors.text.primary, fontWeight: designSystem.typography.fontWeight.medium }}>{task.results.accuracy}%</Text>
                                </span>
                              </Space>
                            </div>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* 创建分析任务模态框 */}
      <Modal
        title={
          <span style={{ 
            fontSize: designSystem.typography.fontSize.lg,
            fontWeight: designSystem.typography.fontWeight.semibold
          }}>
            创建分析任务
          </span>
        }
        open={isModalVisible}
        onOk={handleCreateTask}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
        }}
        width={600}
        okText="创建任务"
        cancelText="取消"
      >
        <Divider style={{ margin: `${designSystem.spacing.md} 0` }} />
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入分析任务名称" />
          </Form.Item>
          
          <Form.Item
            name="dataSource"
            label="数据源"
            rules={[{ required: true, message: '请选择数据源' }]}
          >
            <Select options={dataSources} placeholder="请选择要分析的数据源" />
          </Form.Item>
          
          <Form.Item
            name="analysisType"
            label="分析类型"
            rules={[{ required: true, message: '请选择分析类型' }]}
          >
            <Select placeholder="请选择分析类型">
              {analysisTypes.map(type => (
                <Select.Option key={type.value} value={type.label}>
                  <div>
                    <div style={{ fontWeight: '500' }}>{type.label}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{type.description}</div>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default IntelligentAnalysis