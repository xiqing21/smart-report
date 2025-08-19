import React from 'react'
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
  ShareAltOutlined
} from '@ant-design/icons'
import { AnimatedStatistic, AnimatedList, AnimatedAvatar } from '../components/AdvancedAnimations'
import { InteractiveCard, StatusTag } from '../components/InteractiveEnhancements'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const Dashboard: React.FC = () => {
  const navigate = useNavigate()

  // 模拟数据
  const recentReports = [
    {
      id: 1,
      title: '2024年第一季度销售分析报告',
      status: 'published',
      updateTime: '2024-01-15 14:30',
      views: 156,
      author: '张三'
    },
    {
      id: 2,
      title: '用户行为数据洞察报告',
      status: 'draft',
      updateTime: '2024-01-14 09:15',
      views: 89,
      author: '李四'
    },
    {
      id: 3,
      title: '市场竞争力分析报告',
      status: 'reviewing',
      updateTime: '2024-01-13 16:45',
      views: 234,
      author: '王五'
    }
  ]

  const quickActions = [
    {
      title: '创建新报告',
      description: '从空白模板开始创建',
      icon: <PlusOutlined />,
      color: '#1890ff',
      action: () => navigate('/editor')
    },
    {
      title: '使用模板',
      description: '从预设模板快速开始',
      icon: <FileTextOutlined />,
      color: '#52c41a',
      action: () => navigate('/templates')
    },
    {
      title: 'AI分析',
      description: '智能数据分析和洞察',
      icon: <BarChartOutlined />,
      color: '#722ed1',
      action: () => navigate('/ai-analysis')
    },
    {
      title: '团队协作',
      description: '邀请团队成员协作',
      icon: <TeamOutlined />,
      color: '#fa8c16',
      action: () => {}
    }
  ]



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
            <p style={{ color: '#bae7ff', fontSize: '18px', marginBottom: '24px' }}>今天是个开始新项目的好日子，让我们一起创造精彩的报告吧</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <Button 
                type="primary" 
                size="large" 
                icon={<PlusOutlined />}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(4px)'
                }}
                onClick={() => navigate('/editor')}
              >
                创建新报告
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
                value={128}
                prefix={<FileTextOutlined className="text-blue-500" />}
                suffix={<ArrowUpOutlined className="text-green-500 text-sm" />}
                trend="up"
                trendValue={12}
                delay={0}
              />
              <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '8px' }}>较上月增长 12%</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ textAlign: 'center', transition: 'box-shadow 0.3s' }}>
              <AnimatedStatistic
                title="本月创建"
                value={23}
                prefix={<PlusOutlined style={{ color: '#52c41a' }} />}
                suffix={<ArrowUpOutlined style={{ color: '#52c41a', fontSize: '14px' }} />}
                trend="up"
                trendValue={8}
                delay={0.1}
              />
              <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '8px' }}>较上月增长 8%</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ textAlign: 'center', transition: 'box-shadow 0.3s' }}>
              <AnimatedStatistic
                title="总浏览量"
                value={1563}
                prefix={<EyeOutlined style={{ color: '#722ed1' }} />}
                suffix={<ArrowUpOutlined style={{ color: '#52c41a', fontSize: '14px' }} />}
                trend="up"
                trendValue={15}
                delay={0.2}
              />
              <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '8px' }}>较上月增长 15%</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ textAlign: 'center', transition: 'box-shadow 0.3s' }}>
              <AnimatedStatistic
                title="团队成员"
                value={8}
                prefix={<TeamOutlined style={{ color: '#fa8c16' }} />}
                suffix={<ArrowUpOutlined style={{ color: '#52c41a', fontSize: '14px' }} />}
                trend="up"
                trendValue={2}
                delay={0.3}
              />
              <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '8px' }}>新增 2 名成员</div>
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
            <InteractiveCard effect="lift" style={{ height: '100%' }}>
              <Card title="快捷操作" bordered={false}>
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
            <InteractiveCard effect="glow" style={{ height: '100%' }}>
              <Card 
                title="最近报告" 
                extra={
                  <Button type="link" onClick={() => navigate('/reports')}>
                    查看全部
                  </Button>
                }
                bordered={false}
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

      {/* 进度和成就 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        style={{ marginTop: '32px' }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card title="本月目标进度">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ color: '#595959' }}>创建报告</span>
                    <span style={{ color: '#8c8c8c' }}>23/30</span>
                  </div>
                  <Progress percent={77} strokeColor="#1890ff" />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ color: '#595959' }}>团队协作</span>
                    <span style={{ color: '#8c8c8c' }}>15/20</span>
                  </div>
                  <Progress percent={75} strokeColor="#52c41a" />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ color: '#595959' }}>AI分析使用</span>
                    <span style={{ color: '#8c8c8c' }}>8/15</span>
                  </div>
                  <Progress percent={53} strokeColor="#722ed1" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="最近成就" style={{ height: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#fff7e6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <TrophyOutlined style={{ color: '#d48806' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', color: '#262626' }}>高产作者</div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>本月创建20+报告</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#e6f7ff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <TeamOutlined style={{ color: '#1890ff' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', color: '#262626' }}>团队合作者</div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>参与5个协作项目</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#f9f0ff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BarChartOutlined style={{ color: '#722ed1' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', color: '#262626' }}>数据专家</div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>使用AI分析10次</div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </motion.div>
    </div>
  )
}

export default Dashboard