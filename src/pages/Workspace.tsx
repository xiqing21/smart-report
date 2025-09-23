import React, { useState, useEffect } from 'react'
import { Row, Col, Statistic, List, Avatar, Progress, Space, Typography, Divider, Badge } from 'antd'
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
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  BulbOutlined,
  SyncOutlined
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
    todayCompleted: 12,
    dataSourcesConnected: 5,
    aiAnalysisCount: 23,
    systemHealth: 98
  })

  // 智能体状态数据（从经典仪表板迁移过来）
  const [agentStats, setAgentStats] = useState({
    dataCollector: { cpu: 45, memory: 62, tasks: 23, status: 'active' },
    metricAnalyzer: { cpu: 38, memory: 71, tasks: 18, status: 'active' },
    policyReader: { cpu: 52, memory: 58, tasks: 15, status: 'active' },
    dataDetector: { cpu: 41, memory: 65, tasks: 21, status: 'active' },
    reportGenerator: { cpu: 47, memory: 69, tasks: 12, status: 'active' }
  })

  // 智能体状态动态更新（从经典仪表板迁移过来）
  useEffect(() => {
    const interval = setInterval(() => {
      setAgentStats(prev => ({
        dataCollector: {
          cpu: Math.floor(Math.random() * 30) + 30,
          memory: Math.floor(Math.random() * 25) + 50,
          tasks: Math.floor(Math.random() * 15) + 15,
          status: Math.random() > 0.1 ? 'active' : 'busy'
        },
        metricAnalyzer: {
          cpu: Math.floor(Math.random() * 35) + 25,
          memory: Math.floor(Math.random() * 30) + 55,
          tasks: Math.floor(Math.random() * 12) + 10,
          status: Math.random() > 0.15 ? 'active' : 'busy'
        },
        policyReader: {
          cpu: Math.floor(Math.random() * 40) + 35,
          memory: Math.floor(Math.random() * 20) + 45,
          tasks: Math.floor(Math.random() * 18) + 8,
          status: Math.random() > 0.12 ? 'active' : 'busy'
        },
        dataDetector: {
          cpu: Math.floor(Math.random() * 32) + 28,
          memory: Math.floor(Math.random() * 28) + 52,
          tasks: Math.floor(Math.random() * 20) + 12,
          status: Math.random() > 0.08 ? 'active' : 'busy'
        },
        reportGenerator: {
          cpu: Math.floor(Math.random() * 38) + 32,
          memory: Math.floor(Math.random() * 25) + 58,
          tasks: Math.floor(Math.random() * 16) + 6,
          status: Math.random() > 0.2 ? 'active' : 'busy'
        }
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

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

  // 更新总报告数为实际报告数量
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      totalReports: recentReports.length,
      todayCompleted: Math.floor(Math.random() * 20) + 5
    }))
  }, [recentReports.length])

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
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
          .pulse-animation {
            animation: pulse 2s infinite;
          }
        `}
      </style>
      {/* 欢迎区域 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ cursor: 'pointer' }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => navigate('/workspace')}
      >
        <Card
          style={{
            marginBottom: designSystem.spacing.lg,
            background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
            border: 'none',
            color: 'white',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(99, 102, 241, 0.4), 0 8px 24px rgba(0, 0, 0, 0.12)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
          hoverable={false}
        >
          {/* 添加装饰性渐变层 */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 30%, rgba(255,255,255,0.05) 70%, transparent 100%)',
            pointerEvents: 'none'
          }} />
          {/* 添加光晕效果 */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 50%)',
            pointerEvents: 'none',
            animation: 'pulse 3s ease-in-out infinite'
          }} />
          <div style={{ padding: `${designSystem.spacing.lg} 0` }}>
            <Title 
              level={1} 
              style={{ 
                color: 'white', 
                fontSize: '32px', 
                marginBottom: designSystem.spacing.xs,
                fontWeight: designSystem.typography.fontWeight.bold,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
          style={{ 
            marginBottom: designSystem.spacing.lg,
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}

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
                      border: `1px solid rgba(255, 255, 255, 0.1)`,
                      borderRadius: '16px',
                      cursor: 'pointer',
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.2), 0 8px 24px rgba(0, 0, 0, 0.12)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)'
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
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

      {/* 数据统计概览 - 从经典仪表板迁移 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card 
          title="数据统计概览" 
          style={{ 
            marginBottom: designSystem.spacing.lg,
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={6}>
              <Card 
                className="stat-card aurora-card"
                style={{ 
                  cursor: 'pointer', 
                  transition: 'all 0.3s ease',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}
                onClick={() => navigate('/reports')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.2), 0 8px 24px rgba(0, 0, 0, 0.12)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <Statistic
                  title="总报告数"
                  value={stats.totalReports}
                  prefix={<FileTextOutlined style={{ color: designSystem.colors.primary }} />}
                  valueStyle={{ color: designSystem.colors.primary, fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card 
                className="stat-card aurora-card"
                style={{ 
                  cursor: 'pointer', 
                  transition: 'all 0.3s ease',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}
                onClick={() => navigate('/data-center')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(245, 158, 11, 0.2), 0 8px 24px rgba(0, 0, 0, 0.12)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <Statistic
                  title="数据源连接"
                  value={stats.dataSourcesConnected}
                  prefix={<DatabaseOutlined style={{ color: designSystem.colors.warning }} />}
                  valueStyle={{ color: designSystem.colors.warning, fontWeight: 'bold' }}
                  suffix="/6"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card aurora-card"
                style={{
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(16, 185, 129, 0.2), 0 8px 24px rgba(0, 0, 0, 0.12)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}>
                <Statistic
                  title="今日完成"
                  value={stats.todayCompleted}
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
          
          {/* 智能体运行状态 - 优化版 */}
          <div 
            style={{ 
              marginTop: '24px',
              padding: '20px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
            onClick={() => navigate('/agent-monitor')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(99, 102, 241, 0.15), 0 8px 24px rgba(0, 0, 0, 0.12)'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ThunderboltOutlined style={{ fontSize: '16px', color: designSystem.colors.primary }} />
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: designSystem.colors.text.primary }}>智能体状态</span>
              </div>
              <Badge count={5} style={{ backgroundColor: designSystem.colors.success }} />
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { name: '数据采集', status: agentStats.dataCollector.status },
                { name: '指标分析', status: agentStats.metricAnalyzer.status },
                { name: '政策解读', status: agentStats.policyReader.status },
                { name: '数据检测', status: agentStats.dataDetector.status },
                { name: '报告生成', status: agentStats.reportGenerator.status }
              ].map((agent, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: designSystem.colors.background.secondary,
                    fontSize: '12px',
                    border: `1px solid ${designSystem.colors.border.light}`,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: agent.status === 'active' ? designSystem.colors.success : designSystem.colors.warning,
                      transition: 'all 0.2s ease'
                    }}
                    className={agent.status === 'active' ? 'pulse-animation' : ''}
                  />
                  <span style={{ color: designSystem.colors.text.secondary, fontWeight: 500 }}>{agent.name}</span>
                </div>
              ))}
            </div>
          </div>
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
              className="glass-effect"
              style={{
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                fontFamily: designSystem.typography.fontFamily.modern
              }}
              extra={
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/report-factory')}
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontFamily: designSystem.typography.fontFamily.modern,
                    fontWeight: 500,
                    letterSpacing: '0.25px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
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
                          style={{
                            fontFamily: designSystem.typography.fontFamily.modern,
                            fontWeight: 500,
                            letterSpacing: '0.25px',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
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
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        fontFamily: designSystem.typography.fontFamily.modern,
                        fontWeight: 600,
                        letterSpacing: '0.5px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
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
              style={{
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
              extra={
                <Tag color="primary" size="sm" style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
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
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(5px)',
                        WebkitBackdropFilter: 'blur(5px)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                        e.currentTarget.style.boxShadow = 'none'
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
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              border: 'none',
                              borderRadius: '8px',
                              transition: 'all 0.3s ease',
                              fontFamily: designSystem.typography.fontFamily.modern,
                              fontWeight: 600,
                              letterSpacing: '0.25px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-1px)'
                              e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.3)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)'
                              e.currentTarget.style.boxShadow = 'none'
                            }}
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