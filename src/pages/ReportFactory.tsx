import React, { useState } from 'react'
import { Row, Col, Typography, Space, Divider, List, Avatar, Tag, Modal, Form, Input, Select, Upload, message, Statistic } from 'antd'
import {
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  CopyOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  EyeOutlined,
  UploadOutlined,
  FileOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  UserOutlined,
  CalendarOutlined,
  HeartOutlined,
  StarOutlined,
  FireOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  RocketOutlined,
  BulbOutlined,
  FundOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AreaChartOutlined
} from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { UploadProps } from 'antd'
import { Card, Button, Status } from '@/components/ui'
import { designSystem } from '@/styles/design-system'

const { Title, Text, Paragraph } = Typography

interface Report {
  id: string
  title: string
  description: string
  status: 'draft' | 'published' | 'archived'
  template: string
  author: string
  createTime: string
  updateTime: string
  views: number
  shares: number
  tags: string[]
  category: string
  priority: 'high' | 'medium' | 'low'
}

interface Template {
  id: string
  name: string
  description: string
  category: string
  preview: string
  usage: number
  rating: number
  features: string[]
  complexity: 'simple' | 'medium' | 'complex'
}

const ReportFactory: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'reports' | 'templates'>('reports')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [form] = Form.useForm()

  // 模拟数据
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      title: '2024年第一季度销售报告',
      description: '详细分析第一季度销售数据，包含各产品线表现和市场趋势分析，为下季度制定策略提供数据支撑。',
      status: 'published',
      template: '销售分析模板',
      author: '张三',
      createTime: '2024-01-10 09:30:00',
      updateTime: '2024-01-15 14:20:00',
      views: 156,
      shares: 23,
      tags: ['销售', '季度报告', '数据分析'],
      category: '销售分析',
      priority: 'high'
    },
    {
      id: '2',
      title: '用户行为分析报告',
      description: '基于用户访问数据的行为模式分析和用户画像构建，深入了解用户需求和使用习惯。',
      status: 'draft',
      template: '用户分析模板',
      author: '李四',
      createTime: '2024-01-12 16:45:00',
      updateTime: '2024-01-15 11:30:00',
      views: 45,
      shares: 8,
      tags: ['用户分析', '行为模式', 'AI分析'],
      category: '用户研究',
      priority: 'medium'
    },
    {
      id: '3',
      title: '财务月度汇总',
      description: '月度财务数据汇总分析，包含收支明细和预算执行情况，为财务决策提供依据。',
      status: 'published',
      template: '财务报告模板',
      author: '王五',
      createTime: '2024-01-08 14:15:00',
      updateTime: '2024-01-14 10:20:00',
      views: 89,
      shares: 15,
      tags: ['财务', '月度报告', '预算分析'],
      category: '财务分析',
      priority: 'high'
    },
    {
      id: '4',
      title: '产品性能监控报告',
      description: '产品关键指标监控和性能分析报告，实时跟踪产品健康状况和用户体验指标。',
      status: 'archived',
      template: '监控报告模板',
      author: '赵六',
      createTime: '2024-01-05 11:20:00',
      updateTime: '2024-01-12 15:45:00',
      views: 234,
      shares: 45,
      tags: ['产品监控', '性能分析', '指标追踪'],
      category: '产品分析',
      priority: 'medium'
    },
    {
      id: '5',
      title: '市场竞争分析',
      description: '竞争对手分析和市场定位研究，为产品策略调整提供市场洞察。',
      status: 'draft',
      template: '竞争分析模板',
      author: '钱七',
      createTime: '2024-01-16 10:00:00',
      updateTime: '2024-01-16 15:30:00',
      views: 12,
      shares: 2,
      tags: ['市场分析', '竞争研究', '策略规划'],
      category: '市场研究',
      priority: 'low'
    },
    {
      id: '6',
      title: '客户满意度调研',
      description: '客户满意度调研结果分析，包含NPS评分和改进建议。',
      status: 'published',
      template: '调研分析模板',
      author: '孙八',
      createTime: '2024-01-14 09:15:00',
      updateTime: '2024-01-16 11:45:00',
      views: 78,
      shares: 12,
      tags: ['客户调研', '满意度', 'NPS'],
      category: '客户研究',
      priority: 'medium'
    }
  ])

  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: '销售分析模板',
      description: '适用于销售数据分析的标准模板，包含趋势图、对比表、漏斗分析等多种可视化组件。',
      category: '销售',
      preview: '/templates/sales-preview.png',
      usage: 45,
      rating: 4.8,
      features: ['趋势分析', '对比图表', '漏斗分析', '目标达成'],
      complexity: 'medium'
    },
    {
      id: '2',
      name: '用户分析模板',
      description: '用户行为和画像分析模板，支持多维度数据展示和用户路径分析。',
      category: '用户',
      preview: '/templates/user-preview.png',
      usage: 32,
      rating: 4.6,
      features: ['用户画像', '行为分析', '路径追踪', '留存分析'],
      complexity: 'complex'
    },
    {
      id: '3',
      name: '财务报告模板',
      description: '财务数据汇总和分析模板，符合财务报告规范，支持多种财务指标展示。',
      category: '财务',
      preview: '/templates/finance-preview.png',
      usage: 28,
      rating: 4.9,
      features: ['收支分析', '预算对比', '成本控制', '盈利分析'],
      complexity: 'medium'
    },
    {
      id: '4',
      name: '监控报告模板',
      description: '系统和产品监控数据展示模板，实时监控关键指标和异常告警。',
      category: '监控',
      preview: '/templates/monitor-preview.png',
      usage: 19,
      rating: 4.5,
      features: ['实时监控', '异常告警', '性能指标', '健康检查'],
      complexity: 'simple'
    },
    {
      id: '5',
      name: '市场研究模板',
      description: '市场分析和竞争研究模板，包含SWOT分析、市场份额等分析工具。',
      category: '市场',
      preview: '/templates/market-preview.png',
      usage: 15,
      rating: 4.4,
      features: ['SWOT分析', '市场份额', '竞争对比', '趋势预测'],
      complexity: 'complex'
    },
    {
      id: '6',
      name: '客户调研模板',
      description: '客户调研和满意度分析模板，支持NPS计算和反馈分析。',
      category: '客户',
      preview: '/templates/survey-preview.png',
      usage: 22,
      rating: 4.7,
      features: ['NPS分析', '满意度调研', '反馈统计', '改进建议'],
      complexity: 'simple'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success'
      case 'draft':
        return 'warning'
      case 'archived':
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return '已发布'
      case 'draft':
        return '草稿'
      case 'archived':
        return '已归档'
      default:
        return '未知'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircleOutlined style={{ color: designSystem.colors.success }} />
      case 'draft':
        return <ClockCircleOutlined style={{ color: designSystem.colors.warning }} />
      case 'archived':
        return <ExclamationCircleOutlined style={{ color: designSystem.colors.gray }} />
      default:
        return <ClockCircleOutlined />
    }
  }

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

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return designSystem.colors.success
      case 'medium':
        return designSystem.colors.warning
      case 'complex':
        return designSystem.colors.error
      default:
        return designSystem.colors.gray
    }
  }

  const getComplexityText = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return '简单'
      case 'medium':
        return '中等'
      case 'complex':
        return '复杂'
      default:
        return '未知'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '销售':
        return <BarChartOutlined />
      case '用户':
        return <UserOutlined />
      case '财务':
        return <FundOutlined />
      case '监控':
        return <LineChartOutlined />
      case '市场':
        return <PieChartOutlined />
      case '客户':
        return <HeartOutlined />
      default:
        return <FileTextOutlined />
    }
  }

  const handleEditReport = (report: Report) => {
    navigate(`/report-factory/editor/${report.id}`)
  }

  const handleCopyReport = (report: Report) => {
    const newReport: Report = {
      ...report,
      id: Date.now().toString(),
      title: `${report.title} (副本)`,
      status: 'draft',
      createTime: new Date().toLocaleString('zh-CN'),
      updateTime: new Date().toLocaleString('zh-CN'),
      views: 0,
      shares: 0
    }
    setReports(prev => [newReport, ...prev])
    message.success('报告复制成功')
  }

  const handleDeleteReport = (report: Report) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除报告 "${report.title}" 吗？`,
      onOk: () => {
        setReports(prev => prev.filter(item => item.id !== report.id))
        message.success('报告删除成功')
      }
    })
  }

  const handleShareReport = (report: Report) => {
    navigator.clipboard.writeText(`${window.location.origin}/reports/${report.id}`)
    message.success('分享链接已复制到剪贴板')
  }

  const handleCreateReport = () => {
    form.validateFields().then(values => {
      const newReport: Report = {
        id: Date.now().toString(),
        title: values.title,
        description: values.description,
        status: 'draft',
        template: values.template,
        author: '当前用户',
        createTime: new Date().toLocaleString('zh-CN'),
        updateTime: new Date().toLocaleString('zh-CN'),
        views: 0,
        shares: 0,
        tags: values.tags || [],
        category: values.category || '其他',
        priority: values.priority || 'medium'
      }
      setReports(prev => [newReport, ...prev])
      message.success('报告创建成功')
      setIsModalVisible(false)
      form.resetFields()
      navigate(`/report-factory/editor/${newReport.id}`)
    })
  }

  const handleUseTemplate = (template: Template) => {
    const newReport: Report = {
      id: Date.now().toString(),
      title: `基于${template.name}的新报告`,
      description: `使用${template.name}创建的报告`,
      status: 'draft',
      template: template.name,
      author: '当前用户',
      createTime: new Date().toLocaleString('zh-CN'),
      updateTime: new Date().toLocaleString('zh-CN'),
      views: 0,
      shares: 0,
      tags: [template.category],
      category: template.category,
      priority: 'medium'
    }
    setReports(prev => [newReport, ...prev])
    message.success('基于模板创建报告成功')
    navigate(`/report-factory/editor/${newReport.id}`)
  }

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.json,.xlsx,.csv',
    beforeUpload: (file) => {
      message.success(`${file.name} 模板上传成功`)
      return false
    }
  }

  // 统计数据
  const publishedCount = reports.filter(r => r.status === 'published').length
  const draftCount = reports.filter(r => r.status === 'draft').length
  const totalViews = reports.reduce((sum, r) => sum + r.views, 0)
  const totalShares = reports.reduce((sum, r) => sum + r.shares, 0)

  // 过滤数据
  const filteredReports = selectedCategory === 'all' 
    ? reports 
    : reports.filter(r => r.category === selectedCategory)

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory)

  const categories = ['all', '销售', '用户', '财务', '监控', '市场', '客户']
  const categoryLabels: Record<string, string> = {
    all: '全部',
    销售: '销售分析',
    用户: '用户研究', 
    财务: '财务分析',
    监控: '产品分析',
    市场: '市场研究',
    客户: '客户研究'
  }

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
              marginBottom: designSystem.spacing.xs,
              color: designSystem.colors.text.primary,
              fontSize: designSystem.typography.fontSize.xl
            }}>
              <RocketOutlined style={{ marginRight: designSystem.spacing.sm, color: designSystem.colors.primary }} />
              报告工厂
            </Title>
            <Text style={{ 
              color: designSystem.colors.text.secondary,
              fontSize: designSystem.typography.fontSize.md
            }}>
              智能报告创建与管理平台，让数据洞察触手可及
            </Text>
          </div>
          <Button 
            variant="primary"
            size="lg"
            onClick={() => setIsModalVisible(true)}
          >
            <PlusOutlined /> 创建报告
          </Button>
        </div>
      </motion.div>

      {/* 数据概览 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ marginBottom: designSystem.spacing.xl }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <Card style={{
              border: `1px solid ${designSystem.colors.border.light}`,
              borderRadius: designSystem.borderRadius.lg,
              background: `linear-gradient(135deg, ${designSystem.colors.primary}15, ${designSystem.colors.primary}05)`
            }}>
              <Statistic
                title={
                  <span style={{ 
                    color: designSystem.colors.text.secondary,
                    fontSize: designSystem.typography.fontSize.sm
                  }}>
                    总报告数
                  </span>
                }
                value={reports.length}
                prefix={<FileTextOutlined style={{ color: designSystem.colors.primary }} />}
                valueStyle={{ 
                  color: designSystem.colors.primary,
                  fontSize: designSystem.typography.fontSize.xxl,
                  fontWeight: designSystem.typography.fontWeight.bold
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{
              border: `1px solid ${designSystem.colors.border.light}`,
              borderRadius: designSystem.borderRadius.lg,
              background: `linear-gradient(135deg, ${designSystem.colors.success}15, ${designSystem.colors.success}05)`
            }}>
              <Statistic
                title={
                  <span style={{ 
                    color: designSystem.colors.text.secondary,
                    fontSize: designSystem.typography.fontSize.sm
                  }}>
                    已发布
                  </span>
                }
                value={publishedCount}
                prefix={<CheckCircleOutlined style={{ color: designSystem.colors.success }} />}
                valueStyle={{ 
                  color: designSystem.colors.success,
                  fontSize: designSystem.typography.fontSize.xxl,
                  fontWeight: designSystem.typography.fontWeight.bold
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{
              border: `1px solid ${designSystem.colors.border.light}`,
              borderRadius: designSystem.borderRadius.lg,
              background: `linear-gradient(135deg, ${designSystem.colors.info}15, ${designSystem.colors.info}05)`
            }}>
              <Statistic
                title={
                  <span style={{ 
                    color: designSystem.colors.text.secondary,
                    fontSize: designSystem.typography.fontSize.sm
                  }}>
                    总浏览量
                  </span>
                }
                value={totalViews}
                prefix={<EyeOutlined style={{ color: designSystem.colors.info }} />}
                valueStyle={{ 
                  color: designSystem.colors.info,
                  fontSize: designSystem.typography.fontSize.xxl,
                  fontWeight: designSystem.typography.fontWeight.bold
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{
              border: `1px solid ${designSystem.colors.border.light}`,
              borderRadius: designSystem.borderRadius.lg,
              background: `linear-gradient(135deg, ${designSystem.colors.warning}15, ${designSystem.colors.warning}05)`
            }}>
              <Statistic
                title={
                  <span style={{ 
                    color: designSystem.colors.text.secondary,
                    fontSize: designSystem.typography.fontSize.sm
                  }}>
                    总分享数
                  </span>
                }
                value={totalShares}
                prefix={<ShareAltOutlined style={{ color: designSystem.colors.warning }} />}
                valueStyle={{ 
                  color: designSystem.colors.warning,
                  fontSize: designSystem.typography.fontSize.xxl,
                  fontWeight: designSystem.typography.fontWeight.bold
                }}
              />
            </Card>
          </Col>
        </Row>
      </motion.div>

      {/* 主要内容区域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card style={{
          border: `1px solid ${designSystem.colors.border.light}`,
          borderRadius: designSystem.borderRadius.lg
        }}>
          {/* 标签页和筛选 */}
          <div style={{ 
            marginBottom: designSystem.spacing.xl,
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: designSystem.spacing.md
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.lg }}>
              <Space size="middle">
                <Button 
                  variant={activeTab === 'reports' ? 'primary' : 'ghost'}
                  size="md"
                  onClick={() => setActiveTab('reports')}
                >
                  <FileTextOutlined /> 我的报告
                </Button>
                <Button 
                  variant={activeTab === 'templates' ? 'primary' : 'ghost'}
                  size="md"
                  onClick={() => setActiveTab('templates')}
                >
                  <FileOutlined /> 报告模板
                </Button>
              </Space>
              
              <Divider type="vertical" style={{ height: '24px' }} />
              
              <Space wrap>
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category !== 'all' && getCategoryIcon(category)}
                    {categoryLabels[category]}
                  </Button>
                ))}
              </Space>
            </div>
            
            <Space>
              {activeTab === 'templates' && (
                <Upload {...uploadProps}>
                  <Button variant="ghost" size="md">
                    <UploadOutlined /> 上传模板
                  </Button>
                </Upload>
              )}
            </Space>
          </div>

          {/* 报告列表 */}
          <AnimatePresence mode="wait">
            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <List
                  grid={{ 
                    gutter: [24, 24], 
                    xs: 1, 
                    sm: 1, 
                    md: 2, 
                    lg: 2, 
                    xl: 3, 
                    xxl: 3 
                  }}
                  dataSource={filteredReports}
                  renderItem={(report, index) => (
                    <List.Item>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ y: -4 }}
                      >
                        <Card
                          style={{
                            height: '100%',
                            border: `1px solid ${designSystem.colors.border.light}`,
                            borderRadius: designSystem.borderRadius.lg,
                            borderLeft: `4px solid ${getPriorityColor(report.priority)}`,
                            transition: 'all 0.3s ease'
                          }}
                          bodyStyle={{ 
                            padding: designSystem.spacing.lg,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          {/* 报告头部 */}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            marginBottom: designSystem.spacing.md
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.sm, marginBottom: designSystem.spacing.xs }}>
                                {getStatusIcon(report.status)}
                                <Title level={5} style={{ 
                                  margin: 0,
                                  color: designSystem.colors.text.primary,
                                  fontSize: designSystem.typography.fontSize.md,
                                  fontWeight: designSystem.typography.fontWeight.semibold
                                }}>
                                  {report.title}
                                </Title>
                              </div>
                              <Space size="small">
                                <Status 
                                  type={getStatusColor(report.status)}
                                  text={getStatusText(report.status)}
                                />
                                <Text style={{ 
                                  fontSize: designSystem.typography.fontSize.xs,
                                  color: designSystem.colors.text.secondary
                                }}>
                                  {report.category}
                                </Text>
                              </Space>
                            </div>
                          </div>

                          {/* 报告描述 */}
                          <Paragraph style={{ 
                            color: designSystem.colors.text.secondary,
                            fontSize: designSystem.typography.fontSize.sm,
                            lineHeight: 1.6,
                            marginBottom: designSystem.spacing.md,
                            flex: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {report.description}
                          </Paragraph>

                          {/* 标签 */}
                          <div style={{ marginBottom: designSystem.spacing.md }}>
                            <Space wrap size="small">
                              {report.tags.slice(0, 3).map(tag => (
                                <Tag 
                                  key={tag} 
                                  style={{
                                    fontSize: designSystem.typography.fontSize.xs,
                                    border: `1px solid ${designSystem.colors.border.light}`,
                                    borderRadius: designSystem.borderRadius.sm,
                                    background: designSystem.colors.background.secondary
                                  }}
                                >
                                  {tag}
                                </Tag>
                              ))}
                              {report.tags.length > 3 && (
                                <Text style={{ 
                                  fontSize: designSystem.typography.fontSize.xs,
                                  color: designSystem.colors.text.secondary
                                }}>
                                  +{report.tags.length - 3}
                                </Text>
                              )}
                            </Space>
                          </div>

                          {/* 报告信息 */}
                          <div style={{ 
                            padding: `${designSystem.spacing.sm} 0`,
                            borderTop: `1px solid ${designSystem.colors.border.light}`,
                            marginBottom: designSystem.spacing.md
                          }}>
                            <Row gutter={[16, 8]}>
                              <Col span={12}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.xs }}>
                                  <UserOutlined style={{ 
                                    fontSize: designSystem.typography.fontSize.xs,
                                    color: designSystem.colors.text.secondary
                                  }} />
                                  <Text style={{ 
                                    fontSize: designSystem.typography.fontSize.xs,
                                    color: designSystem.colors.text.secondary
                                  }}>
                                    {report.author}
                                  </Text>
                                </div>
                              </Col>
                              <Col span={12}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.xs }}>
                                  <CalendarOutlined style={{ 
                                    fontSize: designSystem.typography.fontSize.xs,
                                    color: designSystem.colors.text.secondary
                                  }} />
                                  <Text style={{ 
                                    fontSize: designSystem.typography.fontSize.xs,
                                    color: designSystem.colors.text.secondary
                                  }}>
                                    {report.updateTime.split(' ')[0]}
                                  </Text>
                                </div>
                              </Col>
                              <Col span={12}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.xs }}>
                                  <EyeOutlined style={{ 
                                    fontSize: designSystem.typography.fontSize.xs,
                                    color: designSystem.colors.text.secondary
                                  }} />
                                  <Text style={{ 
                                    fontSize: designSystem.typography.fontSize.xs,
                                    color: designSystem.colors.text.secondary
                                  }}>
                                    {report.views}
                                  </Text>
                                </div>
                              </Col>
                              <Col span={12}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.xs }}>
                                  <ShareAltOutlined style={{ 
                                    fontSize: designSystem.typography.fontSize.xs,
                                    color: designSystem.colors.text.secondary
                                  }} />
                                  <Text style={{ 
                                    fontSize: designSystem.typography.fontSize.xs,
                                    color: designSystem.colors.text.secondary
                                  }}>
                                    {report.shares}
                                  </Text>
                                </div>
                              </Col>
                            </Row>
                          </div>

                          {/* 操作按钮 */}
                          <div style={{ display: 'flex', gap: designSystem.spacing.sm }}>
                            <Button 
                              variant="primary"
                              size="sm"
                              style={{ flex: 1 }}
                              onClick={() => handleEditReport(report)}
                            >
                              <EditOutlined /> 编辑
                            </Button>
                            <Button 
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyReport(report)}
                            >
                              <CopyOutlined />
                            </Button>
                            <Button 
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShareReport(report)}
                            >
                              <ShareAltOutlined />
                            </Button>
                            <Button 
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteReport(report)}
                            >
                              <DeleteOutlined />
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    </List.Item>
                  )}
                />
              </motion.div>
            )}

            {/* 模板列表 */}
            {activeTab === 'templates' && (
              <motion.div
                key="templates"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <List
                  grid={{ 
                    gutter: [24, 24], 
                    xs: 1, 
                    sm: 1, 
                    md: 2, 
                    lg: 2, 
                    xl: 3, 
                    xxl: 3 
                  }}
                  dataSource={filteredTemplates}
                  renderItem={(template, index) => (
                    <List.Item>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ y: -4 }}
                      >
                        <Card
                          style={{
                            height: '100%',
                            border: `1px solid ${designSystem.colors.border.light}`,
                            borderRadius: designSystem.borderRadius.lg,
                            transition: 'all 0.3s ease'
                          }}
                          bodyStyle={{ 
                            padding: designSystem.spacing.lg,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          {/* 模板预览 */}
                          <div style={{ 
                            height: '120px',
                            background: `linear-gradient(135deg, ${designSystem.colors.primary}15, ${designSystem.colors.secondary}15)`,
                            borderRadius: designSystem.borderRadius.md,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: designSystem.spacing.md,
                            position: 'relative'
                          }}>
                            {getCategoryIcon(template.category)}
                            <div style={{
                              fontSize: '48px',
                              color: designSystem.colors.primary,
                              opacity: 0.8
                            }}>
                              <FileOutlined />
                            </div>
                            <div style={{
                              position: 'absolute',
                              top: designSystem.spacing.sm,
                              right: designSystem.spacing.sm,
                              display: 'flex',
                              alignItems: 'center',
                              gap: designSystem.spacing.xs,
                              background: designSystem.colors.background.primary,
                              padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`,
                              borderRadius: designSystem.borderRadius.sm,
                              border: `1px solid ${designSystem.colors.border.light}`
                            }}>
                              <StarOutlined style={{ 
                                fontSize: designSystem.typography.fontSize.xs,
                                color: designSystem.colors.warning
                              }} />
                              <Text style={{ 
                                fontSize: designSystem.typography.fontSize.xs,
                                color: designSystem.colors.text.primary,
                                fontWeight: designSystem.typography.fontWeight.medium
                              }}>
                                {template.rating}
                              </Text>
                            </div>
                          </div>

                          {/* 模板信息 */}
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'flex-start',
                              marginBottom: designSystem.spacing.sm
                            }}>
                              <Title level={5} style={{ 
                                margin: 0,
                                color: designSystem.colors.text.primary,
                                fontSize: designSystem.typography.fontSize.md,
                                fontWeight: designSystem.typography.fontWeight.semibold
                              }}>
                                {template.name}
                              </Title>
                              <Space size="small">
                                <Tag 
                                  color={getComplexityColor(template.complexity)}
                                  style={{
                                    fontSize: designSystem.typography.fontSize.xs,
                                    border: 'none',
                                    borderRadius: designSystem.borderRadius.sm
                                  }}
                                >
                                  {getComplexityText(template.complexity)}
                                </Tag>
                              </Space>
                            </div>

                            <Paragraph style={{ 
                              color: designSystem.colors.text.secondary,
                              fontSize: designSystem.typography.fontSize.sm,
                              lineHeight: 1.6,
                              marginBottom: designSystem.spacing.md,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {template.description}
                            </Paragraph>

                            {/* 特性标签 */}
                            <div style={{ marginBottom: designSystem.spacing.md }}>
                              <Space wrap size="small">
                                {template.features.slice(0, 3).map(feature => (
                                  <Tag 
                                    key={feature}
                                    style={{
                                      fontSize: designSystem.typography.fontSize.xs,
                                      border: `1px solid ${designSystem.colors.primary}30`,
                                      borderRadius: designSystem.borderRadius.sm,
                                      background: `${designSystem.colors.primary}10`,
                                      color: designSystem.colors.primary
                                    }}
                                  >
                                    {feature}
                                  </Tag>
                                ))}
                                {template.features.length > 3 && (
                                  <Text style={{ 
                                    fontSize: designSystem.typography.fontSize.xs,
                                    color: designSystem.colors.text.secondary
                                  }}>
                                    +{template.features.length - 3}
                                  </Text>
                                )}
                              </Space>
                            </div>
                          </div>

                          {/* 使用统计 */}
                          <div style={{ 
                            padding: `${designSystem.spacing.sm} 0`,
                            borderTop: `1px solid ${designSystem.colors.border.light}`,
                            marginBottom: designSystem.spacing.md,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.xs }}>
                              <FireOutlined style={{ 
                                fontSize: designSystem.typography.fontSize.sm,
                                color: designSystem.colors.warning
                              }} />
                              <Text style={{ 
                                fontSize: designSystem.typography.fontSize.sm,
                                color: designSystem.colors.text.secondary
                              }}>
                                已使用 {template.usage} 次
                              </Text>
                            </div>
                            <Tag 
                              style={{
                                fontSize: designSystem.typography.fontSize.xs,
                                border: `1px solid ${designSystem.colors.border.light}`,
                                borderRadius: designSystem.borderRadius.sm,
                                background: designSystem.colors.background.secondary
                              }}
                            >
                              {template.category}
                            </Tag>
                          </div>

                          {/* 操作按钮 */}
                          <div style={{ display: 'flex', gap: designSystem.spacing.sm }}>
                            <Button 
                              variant="primary"
                              size="sm"
                              style={{ flex: 1 }}
                              onClick={() => handleUseTemplate(template)}
                            >
                              <PlusOutlined /> 使用模板
                            </Button>
                            <Button 
                              variant="ghost"
                              size="sm"
                              onClick={() => message.info('预览功能开发中')}
                            >
                              <EyeOutlined /> 预览
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    </List.Item>
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* 创建报告模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.sm }}>
            <BulbOutlined style={{ color: designSystem.colors.primary }} />
            <span>创建新报告</span>
          </div>
        }
        open={isModalVisible}
        onOk={handleCreateReport}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
        }}
        width={600}
        okText="创建报告"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: designSystem.spacing.lg }}
        >
          <Form.Item
            name="title"
            label="报告标题"
            rules={[{ required: true, message: '请输入报告标题' }]}
          >
            <Input 
              placeholder="请输入报告标题" 
              style={{
                borderRadius: designSystem.borderRadius.md,
                fontSize: designSystem.typography.fontSize.sm
              }}
            />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="报告描述"
            rules={[{ required: true, message: '请输入报告描述' }]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="请输入报告描述" 
              style={{
                borderRadius: designSystem.borderRadius.md,
                fontSize: designSystem.typography.fontSize.sm
              }}
            />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="template"
                label="选择模板"
                rules={[{ required: true, message: '请选择报告模板' }]}
              >
                <Select 
                  placeholder="请选择报告模板"
                  style={{
                    fontSize: designSystem.typography.fontSize.sm
                  }}
                >
                  {templates.map(template => (
                    <Select.Option key={template.id} value={template.name}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.xs }}>
                        {getCategoryIcon(template.category)}
                        {template.name}
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="报告分类"
                rules={[{ required: true, message: '请选择报告分类' }]}
              >
                <Select 
                  placeholder="请选择报告分类"
                  style={{
                    fontSize: designSystem.typography.fontSize.sm
                  }}
                >
                  {categories.slice(1).map(category => (
                    <Select.Option key={category} value={category}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.xs }}>
                        {getCategoryIcon(category)}
                        {categoryLabels[category]}
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="优先级"
                initialValue="medium"
              >
                <Select 
                  style={{
                    fontSize: designSystem.typography.fontSize.sm
                  }}
                >
                  <Select.Option value="high">
                    <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.xs }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: designSystem.colors.error
                      }} />
                      高优先级
                    </div>
                  </Select.Option>
                  <Select.Option value="medium">
                    <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.xs }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: designSystem.colors.warning
                      }} />
                      中优先级
                    </div>
                  </Select.Option>
                  <Select.Option value="low">
                    <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.xs }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: designSystem.colors.success
                      }} />
                      低优先级
                    </div>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="tags"
                label="标签"
              >
                <Select
                  mode="tags"
                  placeholder="请输入标签"
                  style={{
                    fontSize: designSystem.typography.fontSize.sm
                  }}
                  options={[
                    { label: '销售', value: '销售' },
                    { label: '财务', value: '财务' },
                    { label: '用户分析', value: '用户分析' },
                    { label: '数据分析', value: '数据分析' },
                    { label: '月度报告', value: '月度报告' },
                    { label: '季度报告', value: '季度报告' },
                    { label: '年度报告', value: '年度报告' },
                    { label: '市场研究', value: '市场研究' },
                    { label: '竞争分析', value: '竞争分析' },
                    { label: '客户调研', value: '客户调研' }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default ReportFactory