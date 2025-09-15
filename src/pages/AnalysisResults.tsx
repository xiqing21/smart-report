import React, { useState, useEffect } from 'react'
import { Row, Col, Typography, Space, Divider, Progress, Statistic, Timeline, Tabs, Empty, message } from 'antd'
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  PrinterOutlined,
  BulbOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  DotChartOutlined,
  FundOutlined,
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
  HeartOutlined,
  StarOutlined,
  FireOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Button, Status } from '@/components/ui'
import { designSystem } from '@/styles/design-system'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const { Title, Text, Paragraph } = Typography

interface AnalysisResult {
  id: string
  name: string
  status: 'completed' | 'failed'
  analysisType: string
  dataSource: string
  startTime: string
  completedTime: string
  duration: string
  accuracy: number
  insights: {
    id: string
    title: string
    description: string
    importance: 'high' | 'medium' | 'low'
    category: string
    confidence: number
  }[]
  charts: {
    id: string
    title: string
    type: 'line' | 'bar' | 'pie' | 'area'
    data: any[]
    description: string
  }[]
  recommendations: {
    id: string
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    impact: string
    effort: string
  }[]
  summary: {
    totalDataPoints: number
    processingTime: string
    keyFindings: number
    anomaliesDetected: number
  }
}

const AnalysisResults: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // 模拟数据
  const mockResult: AnalysisResult = {
    id: '1',
    name: '销售数据趋势分析',
    status: 'completed',
    analysisType: '趋势分析',
    dataSource: '销售数据库',
    startTime: '2024-01-15 10:30:00',
    completedTime: '2024-01-15 10:45:00',
    duration: '15分钟',
    accuracy: 94,
    insights: [
      {
        id: '1',
        title: '销售额呈现明显季节性波动',
        description: '通过分析发现，销售额在第四季度达到峰值，较第三季度增长35%，主要受节假日促销活动影响。',
        importance: 'high',
        category: '趋势洞察',
        confidence: 92
      },
      {
        id: '2',
        title: '新客户获取成本持续上升',
        description: '近6个月新客户获取成本上升了28%，建议优化营销渠道配置，重点关注ROI较高的渠道。',
        importance: 'high',
        category: '成本分析',
        confidence: 88
      },
      {
        id: '3',
        title: '产品A的市场份额稳步增长',
        description: '产品A在目标市场的份额从15%增长到22%，增长势头良好，建议加大投入。',
        importance: 'medium',
        category: '产品分析',
        confidence: 85
      },
      {
        id: '4',
        title: '客户复购率有所下降',
        description: '老客户复购率从65%下降到58%，需要关注客户满意度和产品质量问题。',
        importance: 'medium',
        category: '客户行为',
        confidence: 90
      }
    ],
    charts: [
      {
        id: '1',
        title: '月度销售趋势',
        type: 'line',
        description: '展示过去12个月的销售额变化趋势',
        data: [
          { month: '1月', sales: 120000, target: 100000 },
          { month: '2月', sales: 98000, target: 105000 },
          { month: '3月', sales: 135000, target: 110000 },
          { month: '4月', sales: 142000, target: 115000 },
          { month: '5月', sales: 158000, target: 120000 },
          { month: '6月', sales: 165000, target: 125000 },
          { month: '7月', sales: 148000, target: 130000 },
          { month: '8月', sales: 152000, target: 135000 },
          { month: '9月', sales: 168000, target: 140000 },
          { month: '10月', sales: 185000, target: 145000 },
          { month: '11月', sales: 198000, target: 150000 },
          { month: '12月', sales: 225000, target: 155000 }
        ]
      },
      {
        id: '2',
        title: '产品销售占比',
        type: 'pie',
        description: '各产品线的销售额占比分布',
        data: [
          { name: '产品A', value: 35, color: designSystem.colors.primary },
          { name: '产品B', value: 28, color: designSystem.colors.success },
          { name: '产品C', value: 22, color: designSystem.colors.warning },
          { name: '产品D', value: 15, color: designSystem.colors.error }
        ]
      },
      {
        id: '3',
        title: '渠道销售对比',
        type: 'bar',
        description: '不同销售渠道的业绩对比',
        data: [
          { channel: '线上商城', current: 85000, previous: 78000 },
          { channel: '实体店', current: 65000, previous: 72000 },
          { channel: '代理商', current: 45000, previous: 42000 },
          { channel: '直销', current: 30000, previous: 28000 }
        ]
      },
      {
        id: '4',
        title: '客户增长趋势',
        type: 'area',
        description: '新客户和活跃客户数量变化',
        data: [
          { month: '1月', newCustomers: 1200, activeCustomers: 8500 },
          { month: '2月', newCustomers: 1100, activeCustomers: 8800 },
          { month: '3月', newCustomers: 1350, activeCustomers: 9200 },
          { month: '4月', newCustomers: 1420, activeCustomers: 9600 },
          { month: '5月', newCustomers: 1580, activeCustomers: 10100 },
          { month: '6月', newCustomers: 1650, activeCustomers: 10500 }
        ]
      }
    ],
    recommendations: [
      {
        id: '1',
        title: '优化营销渠道配置',
        description: '建议将营销预算重新分配，增加ROI较高渠道的投入，减少效果不佳渠道的支出。预计可降低获客成本15-20%。',
        priority: 'high',
        impact: '降低成本15-20%',
        effort: '中等'
      },
      {
        id: '2',
        title: '加强客户关系管理',
        description: '建立完善的客户生命周期管理体系，通过个性化服务和定期回访提升客户满意度和复购率。',
        priority: 'high',
        impact: '提升复购率10%',
        effort: '较高'
      },
      {
        id: '3',
        title: '扩大产品A市场投入',
        description: '产品A表现优异，建议增加生产和营销投入，抓住市场机会进一步扩大市场份额。',
        priority: 'medium',
        impact: '增长潜力25%',
        effort: '中等'
      },
      {
        id: '4',
        title: '建立预警机制',
        description: '建立销售数据实时监控和预警系统，及时发现异常情况并采取应对措施。',
        priority: 'medium',
        impact: '风险控制',
        effort: '较低'
      }
    ],
    summary: {
      totalDataPoints: 125000,
      processingTime: '15分钟',
      keyFindings: 8,
      anomaliesDetected: 3
    }
  }

  useEffect(() => {
    // 模拟加载数据
    setLoading(true)
    setTimeout(() => {
      setResult(mockResult)
      setLoading(false)
    }, 1000)
  }, [id])

  const getImportanceColor = (importance: string) => {
    switch (importance) {
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

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'line':
        return <LineChartOutlined />
      case 'bar':
        return <BarChartOutlined />
      case 'pie':
        return <PieChartOutlined />
      case 'area':
        return <AreaChartOutlined />
      default:
        return <BarChartOutlined />
    }
  }

  const renderChart = (chart: any) => {
    switch (chart.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke={designSystem.colors.border.light} />
              <XAxis dataKey="month" stroke={designSystem.colors.text.secondary} />
              <YAxis stroke={designSystem.colors.text.secondary} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: designSystem.colors.background.primary,
                  border: `1px solid ${designSystem.colors.border.light}`,
                  borderRadius: designSystem.borderRadius.md
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke={designSystem.colors.primary} 
                strokeWidth={3}
                name="实际销售额"
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke={designSystem.colors.success} 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="目标销售额"
              />
            </LineChart>
          </ResponsiveContainer>
        )
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chart.data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: designSystem.colors.background.primary,
                  border: `1px solid ${designSystem.colors.border.light}`,
                  borderRadius: designSystem.borderRadius.md
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke={designSystem.colors.border.light} />
              <XAxis dataKey="channel" stroke={designSystem.colors.text.secondary} />
              <YAxis stroke={designSystem.colors.text.secondary} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: designSystem.colors.background.primary,
                  border: `1px solid ${designSystem.colors.border.light}`,
                  borderRadius: designSystem.borderRadius.md
                }}
              />
              <Legend />
              <Bar dataKey="current" fill={designSystem.colors.primary} name="本期" />
              <Bar dataKey="previous" fill={designSystem.colors.secondary} name="上期" />
            </BarChart>
          </ResponsiveContainer>
        )
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke={designSystem.colors.border.light} />
              <XAxis dataKey="month" stroke={designSystem.colors.text.secondary} />
              <YAxis stroke={designSystem.colors.text.secondary} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: designSystem.colors.background.primary,
                  border: `1px solid ${designSystem.colors.border.light}`,
                  borderRadius: designSystem.borderRadius.md
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="newCustomers" 
                stackId="1" 
                stroke={designSystem.colors.primary} 
                fill={designSystem.colors.primary}
                fillOpacity={0.6}
                name="新客户"
              />
              <Area 
                type="monotone" 
                dataKey="activeCustomers" 
                stackId="2" 
                stroke={designSystem.colors.success} 
                fill={designSystem.colors.success}
                fillOpacity={0.6}
                name="活跃客户"
              />
            </AreaChart>
          </ResponsiveContainer>
        )
      default:
        return <Empty description="暂无图表数据" />
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '48px', 
            color: designSystem.colors.primary,
            marginBottom: designSystem.spacing.md 
          }}>
            <BulbOutlined spin />
          </div>
          <Text style={{ color: designSystem.colors.text.secondary }}>正在加载分析结果...</Text>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div style={{ textAlign: 'center', padding: designSystem.spacing.xxl }}>
        <Empty description="未找到分析结果" />
      </div>
    )
  }

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <EyeOutlined /> 概览
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          {/* 分析摘要 */}
          <Col span={24}>
            <Card 
              title={
                <span style={{ 
                  fontSize: designSystem.typography.fontSize.lg,
                  fontWeight: designSystem.typography.fontWeight.semibold
                }}>
                  <BulbOutlined style={{ marginRight: designSystem.spacing.xs, color: designSystem.colors.warning }} />
                  分析摘要
                </span>
              }
              style={{
                border: `1px solid ${designSystem.colors.border.light}`,
                borderRadius: designSystem.borderRadius.lg
              }}
            >
              <Row gutter={[24, 24]}>
                <Col span={6}>
                  <Statistic
                    title="数据点总数"
                    value={result.summary.totalDataPoints}
                    prefix={<DotChartOutlined style={{ color: designSystem.colors.primary }} />}
                    valueStyle={{ color: designSystem.colors.text.primary }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="处理时间"
                    value={result.summary.processingTime}
                    prefix={<ClockCircleOutlined style={{ color: designSystem.colors.info }} />}
                    valueStyle={{ color: designSystem.colors.text.primary }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="关键发现"
                    value={result.summary.keyFindings}
                    prefix={<StarOutlined style={{ color: designSystem.colors.warning }} />}
                    valueStyle={{ color: designSystem.colors.text.primary }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="异常检测"
                    value={result.summary.anomaliesDetected}
                    prefix={<ExclamationCircleOutlined style={{ color: designSystem.colors.error }} />}
                    valueStyle={{ color: designSystem.colors.text.primary }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* 核心洞察 */}
          <Col span={12}>
            <Card 
              title={
                <span style={{ 
                  fontSize: designSystem.typography.fontSize.lg,
                  fontWeight: designSystem.typography.fontWeight.semibold
                }}>
                  <FireOutlined style={{ marginRight: designSystem.spacing.xs, color: designSystem.colors.error }} />
                  核心洞察
                </span>
              }
              style={{
                height: '400px',
                border: `1px solid ${designSystem.colors.border.light}`,
                borderRadius: designSystem.borderRadius.lg
              }}
              bodyStyle={{ height: 'calc(100% - 60px)', overflow: 'auto' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {result.insights.slice(0, 3).map((insight) => (
                  <motion.div
                    key={insight.id}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div style={{
                      padding: designSystem.spacing.md,
                      border: `1px solid ${designSystem.colors.border.light}`,
                      borderRadius: designSystem.borderRadius.md,
                      background: designSystem.colors.background.secondary
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: designSystem.spacing.xs }}>
                        <Text style={{ 
                          fontWeight: designSystem.typography.fontWeight.semibold,
                          fontSize: designSystem.typography.fontSize.sm,
                          color: designSystem.colors.text.primary
                        }}>
                          {insight.title}
                        </Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.xs }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: getImportanceColor(insight.importance)
                          }} />
                          <Text style={{ 
                            fontSize: designSystem.typography.fontSize.xs,
                            color: designSystem.colors.text.secondary
                          }}>
                            {insight.confidence}%
                          </Text>
                        </div>
                      </div>
                      <Paragraph style={{ 
                        margin: 0,
                        fontSize: designSystem.typography.fontSize.xs,
                        color: designSystem.colors.text.secondary,
                        lineHeight: 1.5
                      }}>
                        {insight.description}
                      </Paragraph>
                    </div>
                  </motion.div>
                ))}
              </Space>
            </Card>
          </Col>

          {/* 关键指标 */}
          <Col span={12}>
            <Card 
              title={
                <span style={{ 
                  fontSize: designSystem.typography.fontSize.lg,
                  fontWeight: designSystem.typography.fontWeight.semibold
                }}>
                  <TrophyOutlined style={{ marginRight: designSystem.spacing.xs, color: designSystem.colors.success }} />
                  关键指标
                </span>
              }
              style={{
                height: '400px',
                border: `1px solid ${designSystem.colors.border.light}`,
                borderRadius: designSystem.borderRadius.lg
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: designSystem.spacing.xl }}>
                <div style={{ 
                  fontSize: designSystem.typography.fontSize.xxl,
                  fontWeight: designSystem.typography.fontWeight.bold,
                  color: designSystem.colors.success,
                  marginBottom: designSystem.spacing.xs
                }}>
                  {result.accuracy}%
                </div>
                <Text style={{ 
                  color: designSystem.colors.text.secondary,
                  fontSize: designSystem.typography.fontSize.sm
                }}>
                  分析准确率
                </Text>
                <Progress 
                  percent={result.accuracy} 
                  strokeColor={{
                    from: designSystem.colors.success,
                    to: designSystem.colors.primary
                  }}
                  style={{ marginTop: designSystem.spacing.md }}
                />
              </div>
              
              <Divider />
              
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: designSystem.typography.fontSize.lg,
                      fontWeight: designSystem.typography.fontWeight.bold,
                      color: designSystem.colors.primary
                    }}>
                      {result.insights.length}
                    </div>
                    <Text style={{ 
                      fontSize: designSystem.typography.fontSize.xs,
                      color: designSystem.colors.text.secondary
                    }}>
                      洞察发现
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: designSystem.typography.fontSize.lg,
                      fontWeight: designSystem.typography.fontWeight.bold,
                      color: designSystem.colors.warning
                    }}>
                      {result.charts.length}
                    </div>
                    <Text style={{ 
                      fontSize: designSystem.typography.fontSize.xs,
                      color: designSystem.colors.text.secondary
                    }}>
                      可视化图表
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: designSystem.typography.fontSize.lg,
                      fontWeight: designSystem.typography.fontWeight.bold,
                      color: designSystem.colors.info
                    }}>
                      {result.recommendations.length}
                    </div>
                    <Text style={{ 
                      fontSize: designSystem.typography.fontSize.xs,
                      color: designSystem.colors.text.secondary
                    }}>
                      优化建议
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: designSystem.typography.fontSize.lg,
                      fontWeight: designSystem.typography.fontWeight.bold,
                      color: designSystem.colors.error
                    }}>
                      {result.duration}
                    </div>
                    <Text style={{ 
                      fontSize: designSystem.typography.fontSize.xs,
                      color: designSystem.colors.text.secondary
                    }}>
                      分析耗时
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: 'insights',
      label: (
        <span>
          <BulbOutlined /> 洞察发现
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          {result.insights.map((insight) => (
            <Col span={12} key={insight.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card 
                  style={{
                    border: `1px solid ${designSystem.colors.border.light}`,
                    borderRadius: designSystem.borderRadius.lg,
                    borderLeft: `4px solid ${getImportanceColor(insight.importance)}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: designSystem.spacing.md }}>
                    <div>
                      <Title level={5} style={{ 
                        margin: 0,
                        marginBottom: designSystem.spacing.xs,
                        color: designSystem.colors.text.primary
                      }}>
                        {insight.title}
                      </Title>
                      <Space>
                        <Status 
                          type={insight.importance === 'high' ? 'error' : insight.importance === 'medium' ? 'warning' : 'success'}
                          text={insight.importance === 'high' ? '高重要性' : insight.importance === 'medium' ? '中重要性' : '低重要性'}
                        />
                        <Text style={{ 
                          fontSize: designSystem.typography.fontSize.xs,
                          color: designSystem.colors.text.secondary
                        }}>
                          {insight.category}
                        </Text>
                      </Space>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: designSystem.typography.fontSize.lg,
                        fontWeight: designSystem.typography.fontWeight.bold,
                        color: designSystem.colors.success
                      }}>
                        {insight.confidence}%
                      </div>
                      <Text style={{ 
                        fontSize: designSystem.typography.fontSize.xs,
                        color: designSystem.colors.text.secondary
                      }}>
                        置信度
                      </Text>
                    </div>
                  </div>
                  <Paragraph style={{ 
                    color: designSystem.colors.text.secondary,
                    fontSize: designSystem.typography.fontSize.sm,
                    lineHeight: 1.6
                  }}>
                    {insight.description}
                  </Paragraph>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      )
    },
    {
      key: 'charts',
      label: (
        <span>
          <BarChartOutlined /> 数据可视化
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          {result.charts.map((chart) => (
            <Col span={12} key={chart.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.sm }}>
                      <span style={{ color: designSystem.colors.primary }}>
                        {getChartIcon(chart.type)}
                      </span>
                      <span style={{ 
                        fontSize: designSystem.typography.fontSize.md,
                        fontWeight: designSystem.typography.fontWeight.semibold
                      }}>
                        {chart.title}
                      </span>
                    </div>
                  }
                  style={{
                    border: `1px solid ${designSystem.colors.border.light}`,
                    borderRadius: designSystem.borderRadius.lg
                  }}
                >
                  <div style={{ marginBottom: designSystem.spacing.md }}>
                    <Text style={{ 
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.text.secondary
                    }}>
                      {chart.description}
                    </Text>
                  </div>
                  {renderChart(chart)}
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      )
    },
    {
      key: 'recommendations',
      label: (
        <span>
          <ThunderboltOutlined /> 优化建议
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          {result.recommendations.map((recommendation, index) => (
            <Col span={24} key={recommendation.id}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card 
                  style={{
                    border: `1px solid ${designSystem.colors.border.light}`,
                    borderRadius: designSystem.borderRadius.lg,
                    borderLeft: `4px solid ${getPriorityColor(recommendation.priority)}`
                  }}
                >
                  <Row gutter={[24, 16]}>
                    <Col span={18}>
                      <div style={{ marginBottom: designSystem.spacing.sm }}>
                        <Title level={5} style={{ 
                          margin: 0,
                          marginBottom: designSystem.spacing.xs,
                          color: designSystem.colors.text.primary
                        }}>
                          {recommendation.title}
                        </Title>
                        <Status 
                          type={recommendation.priority === 'high' ? 'error' : recommendation.priority === 'medium' ? 'warning' : 'success'}
                          text={recommendation.priority === 'high' ? '高优先级' : recommendation.priority === 'medium' ? '中优先级' : '低优先级'}
                        />
                      </div>
                      <Paragraph style={{ 
                        color: designSystem.colors.text.secondary,
                        fontSize: designSystem.typography.fontSize.sm,
                        lineHeight: 1.6,
                        marginBottom: 0
                      }}>
                        {recommendation.description}
                      </Paragraph>
                    </Col>
                    <Col span={6}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ marginBottom: designSystem.spacing.md }}>
                          <div style={{ 
                            fontSize: designSystem.typography.fontSize.sm,
                            fontWeight: designSystem.typography.fontWeight.medium,
                            color: designSystem.colors.success,
                            marginBottom: designSystem.spacing.xs
                          }}>
                            <RiseOutlined /> {recommendation.impact}
                          </div>
                          <Text style={{ 
                            fontSize: designSystem.typography.fontSize.xs,
                            color: designSystem.colors.text.secondary
                          }}>
                            预期影响
                          </Text>
                        </div>
                        <div>
                          <div style={{ 
                            fontSize: designSystem.typography.fontSize.sm,
                            fontWeight: designSystem.typography.fontWeight.medium,
                            color: designSystem.colors.warning,
                            marginBottom: designSystem.spacing.xs
                          }}>
                            <ClockCircleOutlined /> {recommendation.effort}
                          </div>
                          <Text style={{ 
                            fontSize: designSystem.typography.fontSize.xs,
                            color: designSystem.colors.text.secondary
                          }}>
                            实施难度
                          </Text>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      )
    }
  ]

  return (
    <div>
      {/* 页面头部 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: designSystem.spacing.xl }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.md }}>
            <Button 
              variant="ghost"
              size="md"
              onClick={() => navigate('/intelligent-analysis')}
            >
              <ArrowLeftOutlined /> 返回
            </Button>
            <div>
              <Title level={2} style={{ 
                margin: 0,
                marginBottom: designSystem.spacing.xs,
                color: designSystem.colors.text.primary,
                fontSize: designSystem.typography.fontSize.xl
              }}>
                {result.name}
              </Title>
              <Space>
                <Status type="success" text="分析完成" />
                <Text style={{ 
                  color: designSystem.colors.text.secondary,
                  fontSize: designSystem.typography.fontSize.sm
                }}>
                  {result.analysisType} · {result.dataSource}
                </Text>
                <Text style={{ 
                  color: designSystem.colors.text.secondary,
                  fontSize: designSystem.typography.fontSize.sm
                }}>
                  完成时间：{result.completedTime}
                </Text>
              </Space>
            </div>
          </div>
          <Space>
            <Button 
              variant="ghost"
              size="md"
              onClick={() => message.success('报告已下载')}
            >
              <DownloadOutlined /> 下载报告
            </Button>
            <Button 
              variant="ghost"
              size="md"
              onClick={() => message.success('报告已分享')}
            >
              <ShareAltOutlined /> 分享
            </Button>
            <Button 
              variant="ghost"
              size="md"
              onClick={() => window.print()}
            >
              <PrinterOutlined /> 打印
            </Button>
          </Space>
        </div>
      </motion.div>

      {/* 分析结果内容 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card 
          style={{
            border: `1px solid ${designSystem.colors.border.light}`,
            borderRadius: designSystem.borderRadius.lg
          }}
        >
          <Tabs 
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
          />
        </Card>
      </motion.div>
    </div>
  )
}

export default AnalysisResults