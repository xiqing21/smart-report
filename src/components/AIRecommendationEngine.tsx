import React, { useState, useEffect } from 'react'
import { Card, Typography, Space, Tag, Tooltip, Progress, Alert } from 'antd'
import {
  BulbOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  StarOutlined,
  TrophyOutlined,
  FireOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { designSystem } from '@/styles/design-system'

const { Title, Text, Paragraph } = Typography

interface AIRecommendation {
  id: string
  type: 'template' | 'analysis' | 'insight' | 'optimization'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  category: string
  tags: string[]
  actionable: boolean
  estimatedTime?: string
}

interface AIRecommendationEngineProps {
  context?: {
    selectedTemplate?: string
    dataSource?: string
    reportType?: string
    userHistory?: any[]
  }
  onRecommendationSelect?: (recommendation: AIRecommendation) => void
  maxRecommendations?: number
}

const AIRecommendationEngine: React.FC<AIRecommendationEngineProps> = ({
  context,
  onRecommendationSelect,
  maxRecommendations = 3
}) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([])

  // 模拟AI推荐生成
  useEffect(() => {
    const generateRecommendations = () => {
      setIsLoading(true)
      
      // 模拟AI分析延迟
      setTimeout(() => {
        const mockRecommendations: AIRecommendation[] = [
          {
            id: '1',
            type: 'analysis',
            title: '智能趋势分析',
            description: '基于您的数据特征，建议使用时间序列分析来识别销售趋势和季节性模式',
            confidence: 92,
            impact: 'high',
            category: '数据分析',
            tags: ['趋势分析', '时间序列', '预测'],
            actionable: true,
            estimatedTime: '5分钟'
          },
          {
            id: '2',
            type: 'template',
            title: '推荐模板优化',
            description: '根据您的历史使用习惯，销售漏斗分析模板最适合当前数据结构',
            confidence: 88,
            impact: 'high',
            category: '模板推荐',
            tags: ['销售分析', '漏斗模型', '转化率'],
            actionable: true,
            estimatedTime: '3分钟'
          },
          {
            id: '3',
            type: 'insight',
            title: '异常值检测',
            description: '检测到数据中存在3个潜在异常值，建议进行深入分析以发现业务洞察',
            confidence: 85,
            impact: 'medium',
            category: '数据洞察',
            tags: ['异常检测', '数据质量', '业务洞察'],
            actionable: true,
            estimatedTime: '8分钟'
          },
          {
            id: '4',
            type: 'optimization',
            title: '可视化优化建议',
            description: '建议使用组合图表展示多维度数据，提升报告的可读性和影响力',
            confidence: 79,
            impact: 'medium',
            category: '可视化',
            tags: ['图表优化', '多维展示', '用户体验'],
            actionable: true,
            estimatedTime: '4分钟'
          }
        ]

        // 根据上下文过滤和排序推荐
        let filteredRecommendations = mockRecommendations
        
        if (context?.selectedTemplate) {
          // 根据选择的模板调整推荐
          filteredRecommendations = mockRecommendations.filter(rec => 
            rec.category === '数据分析' || rec.category === '数据洞察'
          )
        }

        setRecommendations(filteredRecommendations.slice(0, maxRecommendations))
        setIsLoading(false)
      }, 1500)
    }

    generateRecommendations()
  }, [context, maxRecommendations])

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return designSystem.colors.error
      case 'medium': return designSystem.colors.warning
      case 'low': return designSystem.colors.success
      default: return designSystem.colors.text.secondary
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'template': return <StarOutlined />
      case 'analysis': return <ThunderboltOutlined />
      case 'insight': return <BulbOutlined />
      case 'optimization': return <TrophyOutlined />
      default: return <RobotOutlined />
    }
  }

  const handleRecommendationSelect = (recommendation: AIRecommendation) => {
    const newSelected = selectedRecommendations.includes(recommendation.id)
      ? selectedRecommendations.filter(id => id !== recommendation.id)
      : [...selectedRecommendations, recommendation.id]
    
    setSelectedRecommendations(newSelected)
    onRecommendationSelect?.(recommendation)
  }

  if (isLoading) {
    return (
      <Card 
        style={{ 
          marginBottom: designSystem.spacing[16],
          border: `1px solid ${designSystem.colors.primary}20`,
          borderRadius: designSystem.borderRadius.xl
        }}
      >
        <div style={{ textAlign: 'center', padding: designSystem.spacing[24] }}>
          <RobotOutlined 
            style={{ 
              fontSize: '32px', 
              color: designSystem.colors.primary[500],
              marginBottom: designSystem.spacing[8]
            }} 
          />
          <Title level={4} style={{ color: designSystem.colors.text.primary }}>
            AI正在分析您的需求...
          </Title>
          <Progress percent={75} size="small" style={{ maxWidth: '200px', margin: '0 auto' }} />
          <Text style={{ color: designSystem.colors.text.secondary, display: 'block', marginTop: designSystem.spacing[4] }}>
            正在生成个性化推荐
          </Text>
        </div>
      </Card>
    )
  }

  return (
    <div style={{ marginBottom: designSystem.spacing[16] }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: designSystem.spacing[8],
        padding: designSystem.spacing[4],
        backgroundColor: designSystem.colors.background.secondary,
        borderRadius: designSystem.borderRadius.md,
        border: `1px solid ${designSystem.colors.primary}20`
      }}>
        <RobotOutlined style={{ 
          color: designSystem.colors.primary[500], 
          fontSize: '18px',
          marginRight: designSystem.spacing[4] 
        }} />
        <Title level={5} style={{ margin: 0, color: designSystem.colors.text.primary }}>
          AI智能推荐
        </Title>
        <FireOutlined style={{ 
          color: designSystem.colors.error, 
          fontSize: '14px',
          marginLeft: designSystem.spacing[2] 
        }} />
      </div>

      <AnimatePresence>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {recommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                hoverable
                style={{
                  border: selectedRecommendations.includes(recommendation.id)
                    ? `2px solid ${designSystem.colors.primary}`
                    : `1px solid ${designSystem.colors.border}`,
                  borderRadius: designSystem.borderRadius.md,
                  transition: 'all 0.3s ease'
                }}
                onClick={() => handleRecommendationSelect(recommendation)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: designSystem.spacing[4] }}>
                      {getTypeIcon(recommendation.type)}
                      <Title level={5} style={{ 
                        margin: 0, 
                        marginLeft: designSystem.spacing[4],
                        color: designSystem.colors.text.primary 
                      }}>
                        {recommendation.title}
                      </Title>
                      {selectedRecommendations.includes(recommendation.id) && (
                        <CheckCircleOutlined style={{ 
                          color: designSystem.colors.success,
                          marginLeft: designSystem.spacing[4]
                        }} />
                      )}
                    </div>
                    
                    <Paragraph style={{ 
                      color: designSystem.colors.text.secondary,
                      marginBottom: designSystem.spacing[4]
                    }}>
                      {recommendation.description}
                    </Paragraph>
                    
                    <Space wrap>
                      <Tag color={getImpactColor(recommendation.impact)}>
                        影响: {recommendation.impact === 'high' ? '高' : recommendation.impact === 'medium' ? '中' : '低'}
                      </Tag>
                      <Tag color="blue">
                        置信度: {recommendation.confidence}%
                      </Tag>
                      {recommendation.estimatedTime && (
                        <Tag color="green">
                          预计时间: {recommendation.estimatedTime}
                        </Tag>
                      )}
                      {recommendation.tags.map(tag => (
                        <Tag key={tag} color="default">{tag}</Tag>
                      ))}
                    </Space>
                  </div>
                  
                  <div style={{ marginLeft: designSystem.spacing[8] }}>
                    <Tooltip title={`置信度: ${recommendation.confidence}%`}>
                      <Progress
                        type="circle"
                        size={50}
                        percent={recommendation.confidence}
                        strokeColor={designSystem.colors.primary[500]}
                        format={() => `${recommendation.confidence}%`}
                      />
                    </Tooltip>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </Space>
      </AnimatePresence>

      {selectedRecommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{ marginTop: designSystem.spacing[8] }}
        >
          <Alert
            message={`已选择 ${selectedRecommendations.length} 个AI推荐`}
            description="这些推荐将在报告创建过程中自动应用，帮助您生成更智能的分析结果。"
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
          />
        </motion.div>
      )}
    </div>
  )
}

export default AIRecommendationEngine