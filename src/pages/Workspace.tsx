import React, { useState, useEffect } from 'react'
import { Row, Col, Statistic, List, Avatar, Progress, Space, Typography, Divider } from 'antd'
import { motion } from 'framer-motion'
import {
  DashboardOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  PlusOutlined,
  ArrowRightOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  RobotOutlined,
  LineChartOutlined,
  FundProjectionScreenOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Tag, Status, Empty } from '@/components/ui'
import { designSystem } from '@/styles/design-system'

const { Title, Text, Paragraph } = Typography

const Workspace: React.FC = () => {
  const navigate = useNavigate()

  // 模拟数据
  const [stats, setStats] = useState({
    totalReports: 156,
    pendingTasks: 8,
    completedToday: 12,
    dataSourcesConnected: 5,
    aiAnalysisCount: 23,
    systemHealth: 98
  })

  const [recentReports, setRecentReports] = useState([
    {
      id: 1,
      title: '销售业绩月度报告',
      status: 'completed',
      updateTime: '2024-01-15 14:30',
      author: '张三',
      type: 'sales'
    },
    {
      id: 2,
      title: '用户行为分析报告',
      status: 'processing',
      updateTime: '2024-01-15 12:00',
      author: '李四',
      type: 'analysis'
    },
    {
      id: 3,
      title: '财务数据汇总',
      status: 'pending',
      updateTime: '2024-01-15 10:15',
      author: '王五',
      type: 'finance'
    },
    {
      id: 4,
      title: 'AI智能洞察报告',
      status: 'completed',
      updateTime: '2024-01-15 09:45',
      author: '系统自动生成',
      type: 'ai'
    }
  ])

  const [recommendations, setRecommendations] = useState([
    {
      id: 1,
      type: 'template',
      title: '推荐使用销售分析模板',
      description: '基于您的数据特征，建议使用此模板提高效率',
      action: '立即使用',
      priority: 'high'
    },
    {
      id: 2,
      type: 'optimization',
      title: '数据源优化建议',
      description: '检测到部分数据源连接不稳定，建议优化',
      action: '查看详情',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'ai',
      title: 'AI分析新功能',
      description: '尝试新的智能分析功能，提升报告质量',
      action: '体验功能',
      priority: 'low'
    }
  ])

  const quickActions = [
    {
      key: 'create-report',
      title: '创建报告',
      description: '快速创建新的分析报告',
      icon: <FileTextOutlined />,
      color: designSystem.colors.primary,
      path: '/report-factory'
    },
    {
      key: 'data-analysis',
      title: '智能分析',
      description: '启动AI智能数据分析',
      icon: <RobotOutlined />,
      color: designSystem.colors.success,
      path: '/intelligent-analysis'
    },
    {
      key: 'data-center',
      title: '数据中心',
      description: '管理和配置数据源',
      icon: <DatabaseOutlined />,
      color: designSystem.colors.warning,
      path: '/data-center'
    },
    {
      key: 'dashboard',
      title: '数据看板',
      description: '查看实时数据仪表板',
      icon: <LineChartOutlined />,
      color: designSystem.colors.info,
      path: '/dashboard'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'processing':
        return 'processing'
      case 'pending':
        return 'warning'
      case 'error':
        return 'error'
      default:
        return 'default'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sales':
        return <RiseOutlined />
      case 'analysis':
        return <BarChartOutlined />
      case 'finance':
        return <DatabaseOutlined />
      case 'ai':
        return <RobotOutlined />
      default:
        return <FileTextOutlined />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error'
      case 'medium':
        return 'warning'
      case 'low':
        return 'success'
      default:
        return 'default'
    }
  }

  return (
    <div style={{ 
      padding: designSystem.spacing.lg,
      background: designSystem.colors.background.secondary,
      minHeight: '100vh'
    }}>
      {/* 欢迎区域 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          style={{
            marginBottom: designSystem.spacing.lg,
            background: `linear-gradient(135deg, ${designSystem.colors.primary} 0%, ${designSystem.colors.secondary} 100%)`,
            border: 'none',
            color: 'white'
          }}
          hoverable={false}
        >
          <div style={{ padding: `${designSystem.spacing.lg} 0` }}>
            <Title 
              level={1} 
              style={{ 
                color: 'white', 
                fontSize: '32px', 
                marginBottom: designSystem.spacing.xs,
                fontWeight: designSystem.typography.fontWeight.bold
              }}
            >
              欢迎回到智能报告系统
            </Title>
            <Text 
              style={{ 
                color: 'rgba(255,255,255,0.9)', 
                fontSize: designSystem.typography.fontSize.lg
              }}
            >
              今天是 {new Date().toLocaleDateString('zh-CN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}，让我们开始高效的数据分析之旅
            </Text>
          </div>
        </Card>
      </motion.div>

      {/* 快捷操作 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card 
          title="快捷操作" 
          style={{ marginBottom: designSystem.spacing.lg }}
          extra={
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/settings')}
            >
              <SettingOutlined /> 设置
            </Button>
          }
        >
          <Row gutter={[16, 16]}>
            {quickActions.map((action) => (
              <Col key={action.key} xs={24} sm={12} md={6}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    hoverable
                    style={{
                      textAlign: 'center',
                      border: `2px solid ${designSystem.colors.border.light}`,
                      borderRadius: designSystem.borderRadius.lg,
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(action.path)}
                  >
                    <div style={{ 
                      fontSize: '32px', 
                      color: action.color,
                      marginBottom: designSystem.spacing.sm
                    }}>
                      {action.icon}
                    </div>
                    <Title level={4} style={{ marginBottom: designSystem.spacing.xs }}>
                      {action.title}
                    </Title>
                    <Text type="secondary">{action.description}</Text>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Card>
      </motion.div>

      {/* 系统状态概览 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card 
          title="系统状态概览" 
          style={{ marginBottom: designSystem.spacing.lg }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic
                  title="总报告数"
                  value={stats.totalReports}
                  prefix={<FileTextOutlined style={{ color: designSystem.colors.primary }} />}
                  valueStyle={{ color: designSystem.colors.primary, fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic
                  title="待处理任务"
                  value={stats.pendingTasks}
                  prefix={<ClockCircleOutlined style={{ color: designSystem.colors.warning }} />}
                  valueStyle={{ color: designSystem.colors.warning, fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic
                  title="今日完成"
                  value={stats.completedToday}
                  prefix={<CheckCircleOutlined style={{ color: designSystem.colors.success }} />}
                  valueStyle={{ color: designSystem.colors.success, fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic
                  title="AI分析次数"
                  value={stats.aiAnalysisCount}
                  prefix={<RobotOutlined style={{ color: designSystem.colors.info }} />}
                  valueStyle={{ color: designSystem.colors.info, fontWeight: 'bold' }}
                />
              </Card>
            </Col>
          </Row>
          
          <Divider />
          
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12}>
              <div style={{ textAlign: 'center' }}>
                <Text strong>数据源连接状态</Text>
                <div style={{ marginTop: designSystem.spacing.sm }}>
                  <Progress 
                    type="circle" 
                    percent={Math.round((stats.dataSourcesConnected / 6) * 100)} 
                    format={() => `${stats.dataSourcesConnected}/6`}
                    strokeColor={designSystem.colors.success}
                  />
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ textAlign: 'center' }}>
                <Text strong>系统健康度</Text>
                <div style={{ marginTop: designSystem.spacing.sm }}>
                  <Progress 
                    type="circle" 
                    percent={stats.systemHealth} 
                    strokeColor={{
                      '0%': designSystem.colors.success,
                      '100%': designSystem.colors.primary
                    }}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* 最近报告和智能推荐 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={14}>
            <Card 
              title="最近报告" 
              extra={
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/report-factory')}
                >
                  <EyeOutlined /> 查看全部
                </Button>
              }
            >
              {recentReports.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={recentReports}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/report-factory/editor/${item.id}`)}
                        >
                          编辑
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            icon={getTypeIcon(item.type)} 
                            style={{ 
                              backgroundColor: designSystem.colors.background.light,
                              color: designSystem.colors.text.primary
                            }}
                          />
                        }
                        title={
                          <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.xs }}>
                            <span>{item.title}</span>
                            <Status type={getStatusColor(item.status)} />
                          </div>
                        }
                        description={
                          <Space>
                            <Text type="secondary">{item.author}</Text>
                            <Text type="secondary">·</Text>
                            <Text type="secondary">{item.updateTime}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty 
                  title="暂无报告"
                  description="开始创建您的第一个报告吧"
                  action={
                    <Button 
                      variant="primary"
                      onClick={() => navigate('/report-factory')}
                    >
                      <PlusOutlined /> 创建报告
                    </Button>
                  }
                />
              )}
            </Card>
          </Col>
          
          <Col xs={24} lg={10}>
            <Card 
              title="智能推荐" 
              extra={
                <Tag color="primary" size="sm">
                  <ThunderboltOutlined /> AI驱动
                </Tag>
              }
            >
              {recommendations.length > 0 ? (
                <Space direction="vertical" style={{ width: '100%' }} size={designSystem.spacing.md}>
                  {recommendations.map((rec) => (
                    <Card 
                      key={rec.id}
                      size="small"
                      style={{ 
                        border: `1px solid ${designSystem.colors.border.light}`,
                        borderRadius: designSystem.borderRadius.md
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.xs, marginBottom: designSystem.spacing.xs }}>
                            <Text strong>{rec.title}</Text>
                            <Tag color={getPriorityColor(rec.priority)} size="sm">
                              {rec.priority === 'high' ? '高' : rec.priority === 'medium' ? '中' : '低'}
                            </Tag>
                          </div>
                          <Paragraph 
                            type="secondary" 
                            style={{ 
                              fontSize: designSystem.typography.fontSize.sm,
                              marginBottom: designSystem.spacing.sm
                            }}
                          >
                            {rec.description}
                          </Paragraph>
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => {
                              if (rec.type === 'template') {
                                navigate('/report-factory')
                              } else if (rec.type === 'optimization') {
                                navigate('/data-center')
                              } else {
                                navigate('/intelligent-analysis')
                              }
                            }}
                          >
                            {rec.action}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </Space>
              ) : (
                <Empty 
                  title="暂无推荐"
                  description="系统正在学习您的使用习惯"
                />
              )}
            </Card>
          </Col>
        </Row>
      </motion.div>
    </div>
  )
}

export default Workspace