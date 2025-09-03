import React, { useState } from 'react'
import { Card, Row, Col, Button, Progress, List } from 'antd'
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
  MonitorOutlined
} from '@ant-design/icons'
import { AnimatedStatistic, AnimatedList, AnimatedAvatar } from '../components/AdvancedAnimations'
import { InteractiveCard, StatusTag } from '../components/InteractiveEnhancements'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AgentProgressModal from '../components/AgentProgressModal'

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [agentModalVisible, setAgentModalVisible] = useState(false)

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
      title: 'AI分析',
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
    console.log('报告生成完成，跳转到编辑器')
    // 跳转到报告编辑器页面
    navigate('/editor')
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
                icon={<PlusOutlined />}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(4px)'
                }}
                onClick={() => navigate('/ai-analysis')}
              >
                启动AI智能分析
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
            </div>
          </div>
        </div>
      </motion.div>

      {/* 数据概览卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ marginBottom: '32px' }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ textAlign: 'center', transition: 'box-shadow 0.3s' }}>
              <AnimatedStatistic
                title="总报告数"
                value={186}
                prefix={<FileTextOutlined className="text-blue-500" />}
                suffix={<ArrowUpOutlined className="text-green-500 text-sm" />}
                trend="up"
                trendValue={15}
                delay={0}
              />
              <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '8px' }}>较上月增长 15%</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ textAlign: 'center', transition: 'box-shadow 0.3s' }}>
              <AnimatedStatistic
                title="本月创建"
                value={32}
                prefix={<PlusOutlined style={{ color: '#52c41a' }} />}
                suffix={<ArrowUpOutlined style={{ color: '#52c41a', fontSize: '14px' }} />}
                trend="up"
                trendValue={12}
                delay={0.1}
              />
              <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '8px' }}>较上月增长 12%</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ textAlign: 'center', transition: 'box-shadow 0.3s' }}>
              <AnimatedStatistic
                title="总浏览量"
                value={2863}
                prefix={<EyeOutlined style={{ color: '#722ed1' }} />}
                suffix={<ArrowUpOutlined style={{ color: '#52c41a', fontSize: '14px' }} />}
                trend="up"
                trendValue={22}
                delay={0.2}
              />
              <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '8px' }}>较上月增长 22%</div>
            </Card>
          </Col>

        </Row>
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
        style={{ marginTop: '32px' }}
      >
        <Card title="五大智能体运行状态" extra={<MonitorOutlined />}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={4}>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px'
                }}>
                  🔍
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>数据采集智能体</div>
                <div style={{ fontSize: '10px', color: '#52c41a' }}>运行中</div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #52c41a, #389e0d)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px'
                }}>
                  📊
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>指标分析智能体</div>
                <div style={{ fontSize: '10px', color: '#52c41a' }}>运行中</div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #722ed1, #531dab)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px'
                }}>
                  📋
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>政策解读智能体</div>
                <div style={{ fontSize: '10px', color: '#52c41a' }}>运行中</div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fa8c16, #d46b08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px'
                }}>
                  🔍
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>数据检测智能体</div>
                <div style={{ fontSize: '10px', color: '#52c41a' }}>运行中</div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #13c2c2, #08979c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px'
                }}>
                  📝
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>报告生成智能体</div>
                <div style={{ fontSize: '10px', color: '#52c41a' }}>运行中</div>
              </div>
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