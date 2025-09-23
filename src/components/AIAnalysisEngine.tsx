import React, { useState, useEffect } from 'react'
import { Card, Progress, Typography, Space, Button, Tag, Alert, Spin } from 'antd'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RobotOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined
} from '@ant-design/icons'
import { designSystem } from '@/styles/design-system'

const { Title, Text, Paragraph } = Typography

interface AnalysisStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  result?: any
}

interface AIAnalysisEngineProps {
  reportData: any
  analysisType: string
  onAnalysisComplete: (results: any) => void
  onAnalysisError: (error: string) => void
}

const AIAnalysisEngine: React.FC<AIAnalysisEngineProps> = ({
  reportData,
  analysisType,
  onAnalysisComplete,
  onAnalysisError
}) => {
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
    {
      id: 'data-preprocessing',
      title: '数据预处理',
      description: '清理和标准化数据格式',
      status: 'pending',
      progress: 0
    },
    {
      id: 'pattern-analysis',
      title: '模式识别',
      description: '识别数据中的关键模式和趋势',
      status: 'pending',
      progress: 0
    },
    {
      id: 'insight-generation',
      title: '洞察生成',
      description: '基于分析结果生成智能洞察',
      status: 'pending',
      progress: 0
    },
    {
      id: 'report-synthesis',
      title: '报告合成',
      description: '整合分析结果生成最终报告',
      status: 'pending',
      progress: 0
    }
  ])

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [overallProgress, setOverallProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAnalyzing && currentStepIndex < analysisSteps.length) {
      const currentStep = analysisSteps[currentStepIndex]
      
      // 模拟AI分析过程
      const simulateStepAnalysis = () => {
        setAnalysisSteps(prev => 
          prev.map((step, index) => 
            index === currentStepIndex
              ? { ...step, status: 'processing' }
              : step
          )
        )

        const progressInterval = setInterval(() => {
          setAnalysisSteps(prev => {
            const newSteps = [...prev]
            const step = newSteps[currentStepIndex]
            
            if (step.progress < 100) {
              step.progress += Math.random() * 20
              if (step.progress > 100) step.progress = 100
            }
            
            return newSteps
          })
        }, 200)

        // 模拟步骤完成
        setTimeout(() => {
          clearInterval(progressInterval)
          
          setAnalysisSteps(prev => 
            prev.map((step, index) => 
              index === currentStepIndex
                ? { 
                    ...step, 
                    status: 'completed', 
                    progress: 100,
                    result: generateMockResult(step.id)
                  }
                : step
            )
          )
          
          setCurrentStepIndex(prev => prev + 1)
        }, 2000 + Math.random() * 1000)
      }

      simulateStepAnalysis()
    } else if (isAnalyzing && currentStepIndex >= analysisSteps.length) {
      // 所有步骤完成
      const results = {
        analysisType,
        completedAt: new Date().toISOString(),
        insights: analysisSteps.map(step => step.result).filter(Boolean),
        summary: '基于AI分析，发现了多个关键洞察和改进建议',
        confidence: 0.85 + Math.random() * 0.1
      }
      
      setAnalysisResults(results)
      setIsAnalyzing(false)
      onAnalysisComplete(results)
    }
  }, [isAnalyzing, currentStepIndex, analysisType, onAnalysisComplete])

  useEffect(() => {
    const completedSteps = analysisSteps.filter(step => step.status === 'completed').length
    setOverallProgress((completedSteps / analysisSteps.length) * 100)
  }, [analysisSteps])

  const generateMockResult = (stepId: string) => {
    const results = {
      'data-preprocessing': {
        processedRecords: Math.floor(Math.random() * 10000) + 1000,
        cleanedFields: Math.floor(Math.random() * 20) + 5,
        qualityScore: 0.8 + Math.random() * 0.15
      },
      'pattern-analysis': {
        patternsFound: Math.floor(Math.random() * 8) + 3,
        correlations: Math.floor(Math.random() * 15) + 5,
        anomalies: Math.floor(Math.random() * 5) + 1
      },
      'insight-generation': {
        insights: Math.floor(Math.random() * 12) + 8,
        recommendations: Math.floor(Math.random() * 6) + 4,
        priorityItems: Math.floor(Math.random() * 4) + 2
      },
      'report-synthesis': {
        sectionsGenerated: Math.floor(Math.random() * 8) + 5,
        chartsCreated: Math.floor(Math.random() * 6) + 3,
        keyMetrics: Math.floor(Math.random() * 10) + 8
      }
    }
    
    return results[stepId as keyof typeof results] || {}
  }

  const startAnalysis = () => {
    setIsAnalyzing(true)
    setCurrentStepIndex(0)
    setError(null)
    setAnalysisResults(null)
    
    // 重置所有步骤状态
    setAnalysisSteps(prev => 
      prev.map(step => ({
        ...step,
        status: 'pending' as const,
        progress: 0,
        result: undefined
      }))
    )
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <SyncOutlined spin style={{ color: designSystem.colors.primary }} />
      case 'completed':
        return <CheckCircleOutlined style={{ color: designSystem.colors.success }} />
      case 'error':
        return <ExclamationCircleOutlined style={{ color: designSystem.colors.error }} />
      default:
        return <RobotOutlined style={{ color: designSystem.colors.text.secondary }} />
    }
  }

  return (
    <Card
      title={
        <Space>
          <ThunderboltOutlined style={{ color: designSystem.colors.primary }} />
          <span>AI智能分析引擎</span>
          <Tag color="blue">{analysisType}</Tag>
        </Space>
      }
      style={{
        borderRadius: designSystem.borderRadius.lg,
        boxShadow: designSystem.shadows.card
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 整体进度 */}
        <div>
          <div style={{ marginBottom: designSystem.spacing.sm }}>
            <Text strong>分析进度</Text>
            <Text style={{ float: 'right', color: designSystem.colors.text.secondary }}>
              {Math.round(overallProgress)}%
            </Text>
          </div>
          <Progress
            percent={overallProgress}
            strokeColor={{
              '0%': designSystem.colors.primary,
              '100%': designSystem.colors.success
            }}
            trailColor={designSystem.colors.background.secondary}
          />
        </div>

        {/* 分析步骤 */}
        <div>
          <Title level={5} style={{ marginBottom: designSystem.spacing.md }}>
            <BulbOutlined style={{ marginRight: designSystem.spacing.xs }} />
            分析步骤
          </Title>
          
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {analysisSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  size="small"
                  style={{
                    backgroundColor: step.status === 'processing' 
                      ? designSystem.colors.background.highlight
                      : 'transparent',
                    border: step.status === 'processing'
                      ? `1px solid ${designSystem.colors.primary}`
                      : `1px solid ${designSystem.colors.border}`,
                    borderRadius: designSystem.borderRadius.sm
                  }}
                >
                  <Space style={{ width: '100%' }} align="start">
                    <div style={{ marginTop: 4 }}>
                      {getStepIcon(step.status)}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: designSystem.spacing.xs }}>
                        <Text strong>{step.title}</Text>
                        <Text style={{ 
                          marginLeft: designSystem.spacing.sm,
                          color: designSystem.colors.text.secondary,
                          fontSize: '12px'
                        }}>
                          {step.description}
                        </Text>
                      </div>
                      
                      {step.status === 'processing' && (
                        <Progress
                          percent={step.progress}
                          size="small"
                          strokeColor={designSystem.colors.primary}
                          showInfo={false}
                        />
                      )}
                      
                      {step.status === 'completed' && step.result && (
                        <div style={{ marginTop: designSystem.spacing.xs }}>
                          <Space wrap>
                            {Object.entries(step.result).map(([key, value]) => (
                              <Tag key={key} color="green" size="small">
                                {key}: {typeof value === 'number' ? value.toLocaleString() : String(value)}
                              </Tag>
                            ))}
                          </Space>
                        </div>
                      )}
                    </div>
                  </Space>
                </Card>
              </motion.div>
            ))}
          </Space>
        </div>

        {/* 错误提示 */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert
                message="分析过程中出现错误"
                description={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 分析结果 */}
        <AnimatePresence>
          {analysisResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Alert
                message="分析完成"
                description={
                  <div>
                    <Paragraph style={{ marginBottom: designSystem.spacing.sm }}>
                      {analysisResults.summary}
                    </Paragraph>
                    <Space>
                      <Tag color="blue">置信度: {(analysisResults.confidence * 100).toFixed(1)}%</Tag>
                      <Tag color="green">洞察数量: {analysisResults.insights.length}</Tag>
                    </Space>
                  </div>
                }
                type="success"
                showIcon
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 操作按钮 */}
        <div style={{ textAlign: 'center' }}>
          <Button
            type="primary"
            size="large"
            icon={<ThunderboltOutlined />}
            onClick={startAnalysis}
            loading={isAnalyzing}
            disabled={isAnalyzing}
            style={{
              borderRadius: designSystem.borderRadius.md,
              height: '40px',
              paddingLeft: designSystem.spacing.lg,
              paddingRight: designSystem.spacing.lg
            }}
          >
            {isAnalyzing ? '分析中...' : '开始AI分析'}
          </Button>
        </div>
      </Space>
    </Card>
  )
}

export default AIAnalysisEngine