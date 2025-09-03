import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Button, Progress, List, Statistic, Badge } from 'antd'
import {
  PlusOutlined,
  FileTextOutlined,
  BarChartOutlined,
  TeamOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  EyeOutlined,
  EditOutlined,
  ShareAltOutlined,
  MonitorOutlined,
  RocketOutlined,
  SettingOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import { AnimatedStatistic, AnimatedList, AnimatedAvatar } from '../components/AdvancedAnimations'
import { InteractiveCard, StatusTag } from '../components/InteractiveEnhancements'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AgentProgressModal from '../components/AgentProgressModal'

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [agentModalVisible, setAgentModalVisible] = useState(false)
  const [agentStats, setAgentStats] = useState({
    dataCollector: { cpu: 45, memory: 62, tasks: 23, status: 'active' },
    metricAnalyzer: { cpu: 38, memory: 71, tasks: 18, status: 'active' },
    policyReader: { cpu: 52, memory: 58, tasks: 15, status: 'active' },
    dataDetector: { cpu: 41, memory: 65, tasks: 21, status: 'active' },
    reportGenerator: { cpu: 47, memory: 69, tasks: 12, status: 'active' }
  })

  // 智能体状态动态更新
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

  // 山西国网数据
  const recentReports = [
    {
      id: 1,
      title: '2024年第一季度电网负荷分析报告',
      status: 'published',
      updateTime: '2024-01-15 14:30',
      views: 256,
      author: '李明华'
    },
    {
      id: 2,
      title: '山西电网用电行为模式分析报告',
      status: 'draft',
      updateTime: '2024-01-14 09:15',
      views: 189,
      author: '王建国'
    },
    {
      id: 3,
      title: '清洁能源并网影响评估报告',
      status: 'reviewing',
      updateTime: '2024-01-13 16:45',
      views: 334,
      author: '张志强'
    }
  ]

  const quickActions = [
    {
      title: '创建报告',
      description: '启动五大智能体协作生成报告',
      icon: <PlusOutlined />,
      color: '#1890ff',
      action: () => setAgentModalVisible(true)
    },
    {
      title: '模板管理',
      description: '管理和编辑报告模板',
      icon: <FileTextOutlined />,
      color: '#52c41a',
      action: () => navigate('/templates')
    },
    {
      title: 'AI分析中心',
      description: '智能数据分析和洞察',
      icon: <BarChartOutlined />,
      color: '#fa8c16',
      action: () => navigate('/ai-analysis')
    },
    {
      title: '智能体监控',
      description: '查看五大智能体运行状态',
      icon: <MonitorOutlined />,
      color: '#13c2c2',
      action: () => navigate('/agent-monitor')
    }
  ]

  const handleAgentComplete = () => {
    // 报告生成完成后的处理逻辑
    console.log('报告生成完成，跳转到AI分析中心查看结果')
    // 跳转到AI分析中心页面，并传递完成状态
    navigate('/ai-analysis', { state: { analysisCompleted: true, showResults: true } })
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#fafafa', minHeight: '100%' }}>
      {/* 欢迎区域 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: '32px' }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
          borderRadius: '16px',
          padding: '32px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* 背景装饰 */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '256px',
            height: '256px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            transform: 'translate(128px, -128px)'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '192px',
            height: '192px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            transform: 'translate(-96px, 96px)'
          }}></div>
          
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px' }}>欢迎回来！</h1>
            <p style={{ color: '#bae7ff', fontSize: '18px', marginBottom: '24px' }}>五大智能体已就绪，让我们一起创造专业的山西电网分析报告吧</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <Button 
                size="large" 
                type="primary" 
                icon={<RocketOutlined />}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(4px)'
                }}
                onClick={() => setAgentModalVisible(true)}
              >
                快速创建报告
              </Button>
              <Button 
                size="large" 
                icon={<FileTextOutlined />}
                style={{
                  backgroundColor: 'transparent',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'white'
                }}
                onClick={() => navigate('/templates')}
              >
                浏览模板
              </Button>
              <Button 
                size="large" 
                icon={<SettingOutlined />}
                style={{
                  backgroundColor: 'transparent',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'white'
                }}
                onClick={() => navigate('/ai-analysis')}
              >
                AI分析中心
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 紧凑型数据概览 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ marginBottom: '24px' }}
      >
        <Card 
          style={{ 
            background: 'linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%)',
            border: '1px solid #e8f4fd',
            borderRadius: '12px'
          }}
        >
          <Row gutter={[16, 8]} align="middle">
            <Col xs={24} sm={8}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <FileTextOutlined />
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#262626' }}>186</div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>总报告数 <span style={{ color: '#52c41a' }}>↑15%</span></div>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #52c41a, #389e0d)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <PlusOutlined />
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#262626' }}>32</div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>本月创建 <span style={{ color: '#52c41a' }}>↑12%</span></div>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #722ed1, #531dab)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <EyeOutlined />
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#262626' }}>2,863</div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>总浏览量 <span style={{ color: '#52c41a' }}>↑22%</span></div>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </motion.div>

      <Row gutter={[24, 24]}>
        {/* 快捷操作 */}
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <InteractiveCard effect="lift">
              <Card title="快捷操作" variant="borderless">
                <Row gutter={[16, 16]}>
                  {quickActions.map((action, index) => (
                    <Col xs={12} key={index}>
                      <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ cursor: 'pointer' }}
                        onClick={action.action}
                      >
                        <Card 
                          size="small" 
                          style={{
                            textAlign: 'center',
                            border: '2px solid #f0f0f0',
                            transition: 'all 0.3s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#91d5ff'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#f0f0f0'
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                        >
                          <div 
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 12px',
                              color: 'white',
                              fontSize: '20px',
                              backgroundColor: action.color
                            }}
                          >
                            {action.icon}
                          </div>
                          <h4 style={{ fontWeight: '600', color: '#262626', marginBottom: '4px' }}>{action.title}</h4>
                          <p style={{ fontSize: '12px', color: '#8c8c8c' }}>{action.description}</p>
                        </Card>
                      </motion.div>
                    </Col>
                  ))}
                </Row>
              </Card>
            </InteractiveCard>
          </motion.div>
        </Col>

        {/* 最近报告 */}
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <InteractiveCard effect="glow">
              <Card 
                title="最近报告" 
                extra={
                  <Button type="link" onClick={() => navigate('/reports')}>
                    查看全部
                  </Button>
                }
                variant="borderless"
              >
                <AnimatedList
                  dataSource={recentReports}
                  staggerDelay={0.1}
                  animationType="slideRight"
                  renderItem={(item) => (
                    <List.Item
                      style={{
                        borderRadius: '8px',
                        padding: '8px 12px',
                        transition: 'background-color 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fafafa'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                      onClick={() => navigate(`/editor/${item.id}`)}
                      actions={[
                        <Button type="text" size="small" icon={<EyeOutlined />}>
                          {item.views}
                        </Button>,
                        <Button type="text" size="small" icon={<EditOutlined />} />,
                        <Button type="text" size="small" icon={<ShareAltOutlined />} />
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <AnimatedAvatar 
                            icon={<FileTextOutlined />}
                            online={Math.random() > 0.5}
                            delay={0.2}
                          />
                        }
                        title={
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: '500', color: '#262626', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.title}
                            </span>
                            <StatusTag 
                              status={item.status === 'published' ? 'completed' : item.status === 'draft' ? 'new' : 'processing'}
                              animated
                            />
                          </div>
                        }
                        description={
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            <span style={{ marginRight: '16px' }}>
                              <ClockCircleOutlined style={{ marginRight: '4px' }} />
                              {item.updateTime}
                            </span>
                            <span>作者: {item.author}</span>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </InteractiveCard>
          </motion.div>
        </Col>
      </Row>

      {/* 五大智能体状态监控 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        style={{ marginTop: '24px' }}
      >
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ThunderboltOutlined style={{ color: '#1890ff' }} />
              <span>五大智能体运行状态</span>
              <Badge count={5} style={{ backgroundColor: '#52c41a' }} />
            </div>
          }
          extra={<MonitorOutlined />}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={4} xl={4}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                style={{
                  textAlign: 'center',
                  padding: '16px',
                  borderRadius: '12px',
                  background: agentStats.dataCollector.status === 'active' ? 'linear-gradient(135deg, #e6f7ff, #bae7ff)' : 'linear-gradient(135deg, #fff7e6, #ffd591)',
                  border: `2px solid ${agentStats.dataCollector.status === 'active' ? '#91d5ff' : '#ffec3d'}`,
                  transition: 'all 0.3s'
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  position: 'relative'
                }}>
                  🔍
                  <div style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: agentStats.dataCollector.status === 'active' ? '#52c41a' : '#fa8c16',
                    border: '2px solid white'
                  }}></div>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>数据采集智能体</div>
                <div style={{ fontSize: '11px', color: agentStats.dataCollector.status === 'active' ? '#52c41a' : '#fa8c16', marginBottom: '8px' }}>
                  {agentStats.dataCollector.status === 'active' ? '运行中' : '繁忙'}
                </div>
                <div style={{ fontSize: '10px', color: '#8c8c8c' }}>
                  <div>CPU: {agentStats.dataCollector.cpu}%</div>
                  <div>内存: {agentStats.dataCollector.memory}%</div>
                  <div>任务: {agentStats.dataCollector.tasks}个</div>
                </div>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4} xl={4}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                style={{
                  textAlign: 'center',
                  padding: '16px',
                  borderRadius: '12px',
                  background: agentStats.metricAnalyzer.status === 'active' ? 'linear-gradient(135deg, #f6ffed, #d9f7be)' : 'linear-gradient(135deg, #fff7e6, #ffd591)',
                  border: `2px solid ${agentStats.metricAnalyzer.status === 'active' ? '#b7eb8f' : '#ffec3d'}`,
                  transition: 'all 0.3s'
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #52c41a, #389e0d)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  position: 'relative'
                }}>
                  📊
                  <div style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: agentStats.metricAnalyzer.status === 'active' ? '#52c41a' : '#fa8c16',
                    border: '2px solid white'
                  }}></div>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>指标分析智能体</div>
                <div style={{ fontSize: '11px', color: agentStats.metricAnalyzer.status === 'active' ? '#52c41a' : '#fa8c16', marginBottom: '8px' }}>
                  {agentStats.metricAnalyzer.status === 'active' ? '运行中' : '繁忙'}
                </div>
                <div style={{ fontSize: '10px', color: '#8c8c8c' }}>
                  <div>CPU: {agentStats.metricAnalyzer.cpu}%</div>
                  <div>内存: {agentStats.metricAnalyzer.memory}%</div>
                  <div>任务: {agentStats.metricAnalyzer.tasks}个</div>
                </div>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4} xl={4}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                style={{
                  textAlign: 'center',
                  padding: '16px',
                  borderRadius: '12px',
                  background: agentStats.policyReader.status === 'active' ? 'linear-gradient(135deg, #f9f0ff, #efdbff)' : 'linear-gradient(135deg, #fff7e6, #ffd591)',
                  border: `2px solid ${agentStats.policyReader.status === 'active' ? '#d3adf7' : '#ffec3d'}`,
                  transition: 'all 0.3s'
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #722ed1, #531dab)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  position: 'relative'
                }}>
                  📋
                  <div style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: agentStats.policyReader.status === 'active' ? '#52c41a' : '#fa8c16',
                    border: '2px solid white'
                  }}></div>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>政策解读智能体</div>
                <div style={{ fontSize: '11px', color: agentStats.policyReader.status === 'active' ? '#52c41a' : '#fa8c16', marginBottom: '8px' }}>
                  {agentStats.policyReader.status === 'active' ? '运行中' : '繁忙'}
                </div>
                <div style={{ fontSize: '10px', color: '#8c8c8c' }}>
                  <div>CPU: {agentStats.policyReader.cpu}%</div>
                  <div>内存: {agentStats.policyReader.memory}%</div>
                  <div>任务: {agentStats.policyReader.tasks}个</div>
                </div>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4} xl={4}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                style={{
                  textAlign: 'center',
                  padding: '16px',
                  borderRadius: '12px',
                  background: agentStats.dataDetector.status === 'active' ? 'linear-gradient(135deg, #fff7e6, #ffd591)' : 'linear-gradient(135deg, #fff7e6, #ffd591)',
                  border: `2px solid ${agentStats.dataDetector.status === 'active' ? '#ffec3d' : '#ffec3d'}`,
                  transition: 'all 0.3s'
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fa8c16, #d46b08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  position: 'relative'
                }}>
                  🔍
                  <div style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: agentStats.dataDetector.status === 'active' ? '#52c41a' : '#fa8c16',
                    border: '2px solid white'
                  }}></div>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>数据检测智能体</div>
                <div style={{ fontSize: '11px', color: agentStats.dataDetector.status === 'active' ? '#52c41a' : '#fa8c16', marginBottom: '8px' }}>
                  {agentStats.dataDetector.status === 'active' ? '运行中' : '繁忙'}
                </div>
                <div style={{ fontSize: '10px', color: '#8c8c8c' }}>
                  <div>CPU: {agentStats.dataDetector.cpu}%</div>
                  <div>内存: {agentStats.dataDetector.memory}%</div>
                  <div>任务: {agentStats.dataDetector.tasks}个</div>
                </div>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4} xl={4}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                style={{
                  textAlign: 'center',
                  padding: '16px',
                  borderRadius: '12px',
                  background: agentStats.reportGenerator.status === 'active' ? 'linear-gradient(135deg, #e6fffb, #b5f5ec)' : 'linear-gradient(135deg, #fff7e6, #ffd591)',
                  border: `2px solid ${agentStats.reportGenerator.status === 'active' ? '#87e8de' : '#ffec3d'}`,
                  transition: 'all 0.3s'
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #13c2c2, #08979c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  position: 'relative'
                }}>
                  📝
                  <div style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: agentStats.reportGenerator.status === 'active' ? '#52c41a' : '#fa8c16',
                    border: '2px solid white'
                  }}></div>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>报告生成智能体</div>
                <div style={{ fontSize: '11px', color: agentStats.reportGenerator.status === 'active' ? '#52c41a' : '#fa8c16', marginBottom: '8px' }}>
                  {agentStats.reportGenerator.status === 'active' ? '运行中' : '繁忙'}
                </div>
                <div style={{ fontSize: '10px', color: '#8c8c8c' }}>
                  <div>CPU: {agentStats.reportGenerator.cpu}%</div>
                  <div>内存: {agentStats.reportGenerator.memory}%</div>
                  <div>任务: {agentStats.reportGenerator.tasks}个</div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Card>
      </motion.div>
      
      <AgentProgressModal
        visible={agentModalVisible}
        onClose={() => setAgentModalVisible(false)}
        onComplete={handleAgentComplete}
      />
    </div>
  )
}

export default Dashboard