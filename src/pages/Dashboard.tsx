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
    <div className="p-6 bg-gray-50 min-h-full">
      {/* 欢迎区域 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">欢迎回来！</h1>
            <p className="text-blue-100 text-lg mb-6">今天是个开始新项目的好日子，让我们一起创造精彩的报告吧</p>
            
            <div className="flex flex-wrap gap-4">
              <Button 
                type="primary" 
                size="large" 
                icon={<PlusOutlined />}
                className="bg-white/20 border-white/30 hover:bg-white/30 backdrop-blur-sm"
                onClick={() => navigate('/editor')}
              >
                创建新报告
              </Button>
              <Button 
                size="large" 
                icon={<FileTextOutlined />}
                className="bg-transparent border-white/50 text-white hover:bg-white/10 hover:border-white"
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
        className="mb-8"
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <AnimatedStatistic
                title="总报告数"
                value={128}
                prefix={<FileTextOutlined className="text-blue-500" />}
                suffix={<ArrowUpOutlined className="text-green-500 text-sm" />}
                trend="up"
                trendValue={12}
                delay={0}
              />
              <div className="text-xs text-gray-500 mt-2">较上月增长 12%</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <AnimatedStatistic
                title="本月创建"
                value={23}
                prefix={<PlusOutlined className="text-green-500" />}
                suffix={<ArrowUpOutlined className="text-green-500 text-sm" />}
                trend="up"
                trendValue={8}
                delay={0.1}
              />
              <div className="text-xs text-gray-500 mt-2">较上月增长 8%</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <AnimatedStatistic
                title="总浏览量"
                value={1563}
                prefix={<EyeOutlined className="text-purple-500" />}
                suffix={<ArrowUpOutlined className="text-green-500 text-sm" />}
                trend="up"
                trendValue={15}
                delay={0.2}
              />
              <div className="text-xs text-gray-500 mt-2">较上月增长 15%</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <AnimatedStatistic
                title="团队成员"
                value={8}
                prefix={<TeamOutlined className="text-orange-500" />}
                suffix={<ArrowUpOutlined className="text-green-500 text-sm" />}
                trend="up"
                trendValue={2}
                delay={0.3}
              />
              <div className="text-xs text-gray-500 mt-2">新增 2 名成员</div>
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
            <InteractiveCard effect="lift" className="h-full">
              <Card title="快捷操作" bordered={false}>
                <Row gutter={[16, 16]}>
                  {quickActions.map((action, index) => (
                    <Col xs={12} key={index}>
                      <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="cursor-pointer"
                        onClick={action.action}
                      >
                        <Card 
                          size="small" 
                          className="text-center border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300"
                        >
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-xl"
                            style={{ backgroundColor: action.color }}
                          >
                            {action.icon}
                          </div>
                          <h4 className="font-semibold text-gray-800 mb-1">{action.title}</h4>
                          <p className="text-xs text-gray-500">{action.description}</p>
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
            <InteractiveCard effect="glow" className="h-full">
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
                      className="hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors duration-200 cursor-pointer"
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
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-800 truncate">
                              {item.title}
                            </span>
                            <StatusTag 
                              status={item.status === 'published' ? 'completed' : item.status === 'draft' ? 'new' : 'processing'}
                              animated
                            />
                          </div>
                        }
                        description={
                          <div className="text-xs text-gray-500">
                            <span className="mr-4">
                              <ClockCircleOutlined className="mr-1" />
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
        className="mt-8"
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card title="本月目标进度">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">创建报告</span>
                    <span className="text-gray-500">23/30</span>
                  </div>
                  <Progress percent={77} strokeColor="#1890ff" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">团队协作</span>
                    <span className="text-gray-500">15/20</span>
                  </div>
                  <Progress percent={75} strokeColor="#52c41a" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">AI分析使用</span>
                    <span className="text-gray-500">8/15</span>
                  </div>
                  <Progress percent={53} strokeColor="#722ed1" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="最近成就" className="h-full">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <TrophyOutlined className="text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">高产作者</div>
                    <div className="text-xs text-gray-500">本月创建20+报告</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <TeamOutlined className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">团队合作者</div>
                    <div className="text-xs text-gray-500">参与5个协作项目</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <BarChartOutlined className="text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">数据专家</div>
                    <div className="text-xs text-gray-500">使用AI分析10次</div>
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