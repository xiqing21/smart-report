import React, { useState, useEffect } from 'react'
import { Card, Typography, Space, Tag, Button, Statistic, Row, Col, Alert, Tooltip } from 'antd'
import {
  EyeOutlined,
  ExclamationCircleOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  RiseOutlined,
  FallOutlined,
  InfoCircleOutlined,
  AlertOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { designSystem } from '@/styles/design-system'

const { Title, Text, Paragraph } = Typography

interface DataInsight {
  id: string
  type: 'trend' | 'anomaly' | 'correlation' | 'prediction' | 'summary'
  title: string
  description: string
  value?: number | string
  change?: number
  changeType?: 'increase' | 'decrease' | 'stable'
  confidence: number
  impact: 'critical' | 'high' | 'medium' | 'low'
  category: string
  actionable: boolean
  recommendation?: string
}

interface SmartInsightsProps {
  dataSource?: string
  reportType?: string
  onInsightAction?: (insight: DataInsight, action: string) => void
}

const SmartInsights: React.FC<SmartInsightsProps> = ({
  dataSource,
  reportType,
  onInsightAction
}) => {
  const [insights, setInsights] = useState<DataInsight[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [selectedInsights, setSelectedInsights] = useState<string[]>([])

  useEffect(() => {
    const generateInsights = () => {
      setIsAnalyzing(true)
      
      // 模拟AI数据分析
      setTimeout(() => {
        const mockInsights: DataInsight[] = [
          {
            id: '1',
            type: 'trend',
            title: '销售额持续增长',
            description: '过去3个月销售额呈现稳定上升趋势，月均增长率达到15.2%',
            value: '15.2%',
            change: 15.2,
            changeType: 'increase',
            confidence: 94,
            impact: 'high',
            category: '趋势分析',
            actionable: true,
            recommendation: '建议加大市场投入，扩大销售团队规模以维持增长势头'
          },
          {
            id: '2',
            type: 'anomaly',
            title: '异常流量峰值检测',
            description: '检测到上周三出现异常流量峰值，比平均值高出340%',
            value: '340%',
            change: 340,
            changeType: 'increase',
            confidence: 87,
            impact: 'critical',
            category: '异常检测',
            actionable: true,
            recommendation: '需要调查流量来源，可能存在营销活动效果或系统异常'
          },
          {
            id: '3',
            type: 'correlation',
            title: '用户活跃度与转化率强相关',
            description: '发现用户日活跃时长与购买转化率存在0.82的强正相关关系',
            value: '0.82',
            confidence: 91,
            impact: 'high',
            category: '关联分析',
            actionable: true,
            recommendation: '建议优化用户体验，增加用户停留时间以提升转化率'
          },
          {
            id: '4',
            type: 'prediction',
            title: '下月收入预测',
            description: '基于历史数据和当前趋势，预测下月收入将达到125万元',
            value: '125万元',
            change: 8.5,
            changeType: 'increase',
            confidence: 78,
            impact: 'medium',
            category: '预测分析',
            actionable: false,
            recommendation: '预测结果仅供参考，建议结合市场环境进行调整'
          },
          {
            id: '5',
            type: 'summary',
            title: '整体业务健康度',
            description: '综合各项指标分析，当前业务整体健康度为良好，建议关注用户留存',
            value: '良好',
            confidence: 85,
            impact: 'medium',
            category: '综合分析',
            actionable: true,
            recommendation: '重点关注用户留存率和客户满意度指标'
          }
        ]

        // 根据数据源和报告类型过滤洞察
        let filteredInsights = mockInsights
        if (dataSource === '1') { // 销售数据库
          filteredInsights = mockInsights.filter(insight => 
            insight.category.includes('趋势') || insight.category.includes('预测')
          )
        }

        setInsights(filteredInsights)
        setIsAnalyzing(false)
      }, 2000)
    }

    if (dataSource) {
      generateInsights()
    }
  }, [dataSource, reportType])

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return designSystem.colors.error
      case 'high': return designSystem.colors.warning
      case 'medium': return designSystem.colors.primary
      case 'low': return designSystem.colors.success
      default: return designSystem.colors.text.secondary
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trend': return <RiseOutlined />
      case 'anomaly': return <ExclamationCircleOutlined />
      case 'correlation': return <BarChartOutlined />
      case 'prediction': return <ThunderboltOutlined />
      case 'summary': return <PieChartOutlined />
      default: return <EyeOutlined />
    }
  }

  const getChangeIcon = (changeType?: string) => {
    switch (changeType) {
      case 'increase': return <RiseOutlined style={{ color: designSystem.colors.success }} />
      case 'decrease': return <FallOutlined style={{ color: designSystem.colors.error }} />
      default: return null
    }
  }

  const handleInsightSelect = (insightId: string) => {
    const newSelected = selectedInsights.includes(insightId)
      ? selectedInsights.filter(id => id !== insightId)
      : [...selectedInsights, insightId]
    
    setSelectedInsights(newSelected)
  }

  const handleInsightAction = (insight: DataInsight, action: string) => {
    onInsightAction?.(insight, action)
  }

  if (isAnalyzing) {
    return (
      <Card 
        style={{ 
          marginBottom: designSystem.spacing.lg,
          border: `1px solid ${designSystem.colors.primary}20`,
          borderRadius: designSystem.borderRadius.lg
        }}
      >
        <div style={{ textAlign: 'center', padding: designSystem.spacing.xl }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <EyeOutlined 
              style={{ 
                fontSize: '32px', 
                color: designSystem.colors.primary,
                marginBottom: designSystem.spacing.md
              }} 
            />
          </motion.div>
          <Title level={4} style={{ color: designSystem.colors.text.primary }}>
            AI正在深度分析数据...
          </Title>
          <Text style={{ color: designSystem.colors.text.secondary }}>
            正在挖掘数据洞察和业务机会
          </Text>
        </div>
      </Card>
    )
  }

  if (!insights.length) {
    return (
      <Alert
        message="暂无数据洞察"
        description="请先选择数据源，AI将为您生成智能洞察"
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: designSystem.spacing.lg }}
      />
    )
  }

  return (
    <div style={{ marginBottom: designSystem.spacing.lg }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: designSystem.spacing.md,
        padding: designSystem.spacing.sm,
        backgroundColor: designSystem.colors.background.secondary,
        borderRadius: designSystem.borderRadius.md,
        border: `1px solid ${designSystem.colors.primary}20`
      }}>
        <EyeOutlined style={{ 
          color: designSystem.colors.primary, 
          fontSize: '18px',
          marginRight: designSystem.spacing.sm 
        }} />
        <Title level={5} style={{ margin: 0, color: designSystem.colors.text.primary }}>
          智能数据洞察
        </Title>
        <Tag color="blue" style={{ marginLeft: designSystem.spacing.sm }}>
          {insights.length} 个洞察
        </Tag>
      </div>

      {/* 洞察概览统计 */}
      <Card style={{ marginBottom: designSystem.spacing.md }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="关键洞察"
              value={insights.filter(i => i.impact === 'critical' || i.impact === 'high').length}
              suffix={`/ ${insights.length}`}
              valueStyle={{ color: designSystem.colors.primary }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="平均置信度"
              value={Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length)}
              suffix="%"
              valueStyle={{ color: designSystem.colors.success }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="可执行建议"
              value={insights.filter(i => i.actionable).length}
              valueStyle={{ color: designSystem.colors.warning }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="已选择"
              value={selectedInsights.length}
              valueStyle={{ color: designSystem.colors.error }}
            />
          </Col>
        </Row>
      </Card>

      <AnimatePresence>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                hoverable
                style={{
                  border: selectedInsights.includes(insight.id)
                    ? `2px solid ${designSystem.colors.primary}`
                    : `1px solid ${designSystem.colors.border}`,
                  borderRadius: designSystem.borderRadius.md,
                  transition: 'all 0.3s ease'
                }}
                onClick={() => handleInsightSelect(insight.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: designSystem.spacing.sm }}>
                      {getTypeIcon(insight.type)}
                      <Title level={5} style={{ 
                        margin: 0, 
                        marginLeft: designSystem.spacing.sm,
                        color: designSystem.colors.text.primary 
                      }}>
                        {insight.title}
                      </Title>
                      {insight.value && (
                        <div style={{ marginLeft: designSystem.spacing.md, display: 'flex', alignItems: 'center' }}>
                          {getChangeIcon(insight.changeType)}
                          <Text strong style={{ 
                            color: insight.changeType === 'increase' ? designSystem.colors.success : 
                                   insight.changeType === 'decrease' ? designSystem.colors.error : 
                                   designSystem.colors.text.primary,
                            marginLeft: designSystem.spacing.xs
                          }}>
                            {insight.value}
                          </Text>
                        </div>
                      )}
                    </div>
                    
                    <Paragraph style={{ 
                      color: designSystem.colors.text.secondary,
                      marginBottom: designSystem.spacing.sm
                    }}>
                      {insight.description}
                    </Paragraph>
                    
                    {insight.recommendation && (
                      <div style={{ 
                        padding: designSystem.spacing.sm,
                        backgroundColor: designSystem.colors.background.secondary,
                        borderRadius: designSystem.borderRadius.sm,
                        marginBottom: designSystem.spacing.sm
                      }}>
                        <BulbOutlined style={{ color: designSystem.colors.warning, marginRight: designSystem.spacing.xs }} />
                        <Text style={{ color: designSystem.colors.text.secondary, fontSize: '12px' }}>
                          {insight.recommendation}
                        </Text>
                      </div>
                    )}
                    
                    <Space wrap>
                      <Tag color={getImpactColor(insight.impact)}>
                        {insight.impact === 'critical' ? '关键' : 
                         insight.impact === 'high' ? '重要' : 
                         insight.impact === 'medium' ? '中等' : '一般'}
                      </Tag>
                      <Tag color="blue">
                        置信度: {insight.confidence}%
                      </Tag>
                      <Tag color="green">
                        {insight.category}
                      </Tag>
                      {insight.actionable && (
                        <Tag color="orange">可执行</Tag>
                      )}
                    </Space>
                  </div>
                  
                  {insight.actionable && (
                    <div style={{ marginLeft: designSystem.spacing.md }}>
                      <Space direction="vertical" size="small">
                        <Tooltip title="应用此洞察到报告">
                          <Button 
                            type="primary" 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleInsightAction(insight, 'apply')
                            }}
                          >
                            应用
                          </Button>
                        </Tooltip>
                        <Tooltip title="查看详细分析">
                          <Button 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleInsightAction(insight, 'detail')
                            }}
                          >
                            详情
                          </Button>
                        </Tooltip>
                      </Space>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </Space>
      </AnimatePresence>

      {selectedInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{ marginTop: designSystem.spacing.md }}
        >
          <Alert
            message={`已选择 ${selectedInsights.length} 个数据洞察`}
            description="选中的洞察将自动集成到您的报告中，提供更深入的数据分析视角。"
            type="success"
            showIcon
            action={
              <Button 
                size="small" 
                type="primary"
                onClick={() => {
                  selectedInsights.forEach(id => {
                    const insight = insights.find(i => i.id === id)
                    if (insight) handleInsightAction(insight, 'apply')
                  })
                }}
              >
                应用全部
              </Button>
            }
          />
        </motion.div>
      )}
    </div>
  )
}

export default SmartInsights