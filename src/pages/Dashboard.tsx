import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Button, List, Badge, App } from 'antd'
import {
  PlusOutlined,
  FileTextOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  EditOutlined,
  ShareAltOutlined,
  MonitorOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  FileAddOutlined,
  DatabaseOutlined
} from '@ant-design/icons'
import { AnimatedList, AnimatedAvatar } from '../components/AdvancedAnimations'
import { InteractiveCard, StatusTag } from '../components/InteractiveEnhancements'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AgentProgressModal from '../components/AgentProgressModal'
import { ReportService } from '../services/api/dataService'

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [agentModalVisible, setAgentModalVisible] = useState(false)
  const [recentReports, setRecentReports] = useState<any[]>([])
  const [totalReports, setTotalReports] = useState(0)
  const [loading, setLoading] = useState(true)
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
      setAgentStats(_prev => ({
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

  // 获取最近报告数据
  useEffect(() => {
    const fetchRecentReports = async () => {
      try {
        setLoading(true)
        const response = await ReportService.getReports(1, 5) // 获取最近5条报告
        
        if (response.success && response.data) {
          setRecentReports(response.data)
          setTotalReports(response.total || response.data.length)
        } else {
          setRecentReports([])
          setTotalReports(0)
        }
      } catch (error) {
        console.error('获取最近报告失败:', error)
        setRecentReports([])
        setTotalReports(0)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentReports()
  }, [])

  // 快捷操作 - 删除模板管理和智能体监控，保留其他并铺满一行
  const quickActions = [
    {
      title: '创建新报告',
      description: '快速创建新的分析报告',
      icon: <PlusOutlined />,
      color: '#52c41a',
      action: () => navigate('/editor')
    },
    {
      title: 'AI智能分析',
      description: '使用AI分析生成专业报告',
      icon: <BarChartOutlined />,
      color: '#1890ff',
      action: () => navigate('/analysis')
    },
    {
      title: '数据源管理',
      description: '管理和配置数据源',
      icon: <DatabaseOutlined />,
      color: '#fa8c16',
      action: () => navigate('/analysis?tab=datasource')
    },
    {
      title: '报告管理',
      description: '查看和管理所有报告',
      icon: <FileTextOutlined />,
      color: '#722ed1',
      action: () => navigate('/reports')
    }
  ]

  const handleAgentComplete = () => {
    // 报告生成完成后的处理逻辑
    console.log('报告生成完成，跳转到AI分析中心查看结果')
    // 跳转到AI分析中心页面，并传递完成状态
    navigate('/analysis', { state: { analysisCompleted: true, showResults: true } })
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
          
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} lg={14}>
              <div style={{ position: 'relative', zIndex: 10 }}>
                <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px' }}>欢迎回来！</h1>
                <p style={{ color: '#bae7ff', fontSize: '18px', marginBottom: '24px' }}>五大智能体已就绪，让我们一起创造专业的山西电网分析报告吧</p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  {/* 删除快速创建报告按钮 */}
                </div>
              </div>
            </Col>
            
            <Col xs={24} lg={10}>
              <div style={{ position: 'relative', zIndex: 10 }}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div 
                      style={{ 
                        textAlign: 'center', 
                        cursor: 'pointer',
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s'
                      }}
                      onClick={() => navigate('/reports')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>{totalReports}</div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>总报告数</div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div 
                      style={{ 
                        textAlign: 'center', 
                        cursor: 'pointer',
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s'
                      }}
                      onClick={() => navigate('/analysis?tab=data-sources')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>4</div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>总数据源</div>
                    </div>
                  </Col>
                </Row>
                
                {/* 五大智能体运行状态 - 紧凑版 */}
                <div 
                  style={{ 
                    marginTop: '16px',
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onClick={() => navigate('/agent-monitor')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ThunderboltOutlined style={{ fontSize: '16px' }} />
                      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>智能体状态</span>
                    </div>
                    <Badge count={5} style={{ backgroundColor: '#52c41a' }} />
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
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          fontSize: '12px'
                        }}
                      >
                        <div
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: agent.status === 'active' ? '#52c41a' : '#fa8c16'
                          }}
                        />
                        <span>{agent.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </motion.div>

      {/* 快捷操作 - 占满一行 */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <InteractiveCard effect="lift">
              <Card title="快捷操作" variant="borderless">
                <Row gutter={[16, 16]}>
                  {quickActions.map((action, index) => (
                    <Col xs={12} sm={6} md={6} lg={6} xl={6} key={index}>
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
                            transition: 'all 0.3s',
                            height: '120px'
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
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 8px',
                              color: 'white',
                              fontSize: '16px',
                              backgroundColor: action.color
                            }}
                          >
                            {action.icon}
                          </div>
                          <h4 style={{ fontWeight: '600', color: '#262626', marginBottom: '4px', fontSize: '13px' }}>{action.title}</h4>
                          <p style={{ fontSize: '11px', color: '#8c8c8c', margin: 0 }}>{action.description}</p>
                        </Card>
                      </motion.div>
                    </Col>
                  ))}
                </Row>
              </Card>
            </InteractiveCard>
          </motion.div>
        </Col>
      </Row>

      {/* 最近报告 - 占满一行 */}
      <Row gutter={[24, 24]}>
        <Col xs={24}>
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
                style={{ height: '100%' }}
              >
                <List
                  loading={loading}
                  dataSource={recentReports}
                  renderItem={(report) => (
                    <List.Item
                      actions={[
                        <Button
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={() => navigate(`/reports/${report.id}`)}
                        />,
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => navigate(`/editor/${report.id}`)}
                        />,
                        <Button
                          type="text"
                          icon={<ShareAltOutlined />}
                          onClick={() => {
                            message.success('分享链接已复制到剪贴板')
                          }}
                        />
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <AnimatedAvatar
                            icon={<FileTextOutlined />}
                            style={{
                              backgroundColor: report.status === 'published' ? '#52c41a' : 
                                             report.status === 'draft' ? '#faad14' : '#1890ff'
                            }}
                          />
                        }
                        title={
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{report.title}</span>
                            <StatusTag status={report.status === 'draft' ? 'draft' : report.status as any} />
                          </div>
                        }
                        description={
                          <div style={{ color: '#666' }}>
                            <div>作者：{report.author || '系统'} | 更新时间：{new Date(report.updated_at || report.created_at).toLocaleString('zh-CN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</div>
                            <div style={{ marginTop: '4px' }}>
                              <ClockCircleOutlined style={{ marginRight: '4px' }} />
                              浏览量：{report.views || 0}
                            </div>
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

      {/* Agent Progress Modal */}
      <AgentProgressModal
        visible={agentModalVisible}
        onClose={() => setAgentModalVisible(false)}
        onComplete={handleAgentComplete}
      />
    </div>
  )
}

export default Dashboard