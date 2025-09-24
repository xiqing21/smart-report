import React, { useState } from 'react'
import { Modal, Steps, Form, Input, Select, Card, Row, Col, Typography, Space, message, Progress, Tag } from 'antd'
import {
  FileTextOutlined,
  RobotOutlined,
  BulbOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
  BranchesOutlined,
  LineChartOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  FundOutlined,
  PieChartOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui'
import { designSystem } from '@/styles/design-system'
import AIRecommendationEngine from './AIRecommendationEngine'
import SmartInsights from './SmartInsights'
import AIAnalysisEngine from './AIAnalysisEngine'

const { Title, Text, Paragraph } = Typography
const { Step } = Steps

interface ReportCreationWizardProps {
  visible: boolean
  onCancel: () => void
  onSuccess: (reportData: any) => void
  templates?: Template[]
}

interface Template {
  id: string
  name: string
  description: string
  category: string
  features: string[]
  complexity: 'simple' | 'medium' | 'complex'
  aiEnabled: boolean
  icon: React.ReactNode
}

interface DataSource {
  id: string
  name: string
  type: string
  description: string
  icon: React.ReactNode
  aiCapable: boolean
}

const ReportCreationWizard: React.FC<ReportCreationWizardProps> = ({
  visible,
  onCancel,
  onSuccess,
  templates: externalTemplates
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [creationMode, setCreationMode] = useState<'traditional' | 'ai'>('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [selectedDataSource, setSelectedDataSource] = useState<string>('')
  const [aiAnalysisType, setAiAnalysisType] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showAIRecommendations, setShowAIRecommendations] = useState(false)
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([])
  const [showSmartInsights, setShowSmartInsights] = useState(false)
  const [showAIAnalysis, setShowAIAnalysis] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [form] = Form.useForm()

  const defaultTemplates: Template[] = [
    {
      id: '1',
      name: '销售分析模板',
      description: '适用于销售数据分析，包含趋势图、对比表、漏斗分析等',
      category: '销售',
      features: ['趋势分析', '对比图表', '漏斗分析', '目标达成'],
      complexity: 'medium',
      aiEnabled: true,
      icon: <BarChartOutlined />
    },
    {
      id: '2',
      name: '用户分析模板',
      description: '用户行为和画像分析，支持多维度数据展示',
      category: '用户',
      features: ['用户画像', '行为分析', '路径追踪', '留存分析'],
      complexity: 'complex',
      aiEnabled: true,
      icon: <UserOutlined />
    },
    {
      id: '3',
      name: '财务报告模板',
      description: '财务数据汇总和分析，符合财务报告规范',
      category: '财务',
      features: ['收支分析', '预算对比', '成本控制', '盈利分析'],
      complexity: 'medium',
      aiEnabled: false,
      icon: <FundOutlined />
    },
    {
      id: '4',
      name: '市场研究模板',
      description: '市场分析和竞争研究，包含SWOT分析等',
      category: '市场',
      features: ['SWOT分析', '市场份额', '竞争对比', '趋势预测'],
      complexity: 'complex',
      aiEnabled: true,
      icon: <PieChartOutlined />
    }
  ]

  const templates = externalTemplates || defaultTemplates

  const dataSources: DataSource[] = [
    {
      id: '1',
      name: '销售数据库',
      type: 'database',
      description: '包含销售订单、客户信息、产品数据等',
      icon: <DatabaseOutlined />,
      aiCapable: true
    },
    {
      id: '2',
      name: '用户行为数据',
      type: 'analytics',
      description: '用户访问、点击、转化等行为数据',
      icon: <UserOutlined />,
      aiCapable: true
    },
    {
      id: '3',
      name: '财务报表',
      type: 'financial',
      description: '财务收支、预算、成本等数据',
      icon: <FundOutlined />,
      aiCapable: false
    },
    {
      id: '4',
      name: '市场数据',
      type: 'market',
      description: '市场调研、竞争对手、行业数据',
      icon: <PieChartOutlined />,
      aiCapable: true
    }
  ]

  const aiAnalysisTypes = [
    {
      value: 'trend',
      label: '趋势分析',
      description: '分析数据的时间趋势和变化模式',
      icon: <LineChartOutlined />,
      color: designSystem.colors.primary
    },
    {
      value: 'anomaly',
      label: '异常检测',
      description: '识别数据中的异常值和异常模式',
      icon: <ExclamationCircleOutlined />,
      color: designSystem.colors.error
    },
    {
      value: 'correlation',
      label: '关联分析',
      description: '发现数据间的关联关系',
      icon: <BranchesOutlined />,
      color: designSystem.colors.secondary
    },
    {
      value: 'clustering',
      label: '聚类分析',
      description: '将数据分组并识别模式',
      icon: <BarChartOutlined />,
      color: designSystem.colors.success
    },
    {
      value: 'prediction',
      label: '预测分析',
      description: '基于历史数据预测未来趋势',
      icon: <ThunderboltOutlined />,
      color: designSystem.colors.warning
    }
  ]

  const steps = [
    {
      title: '选择创建方式',
      description: '传统创建或AI智能创建',
      icon: <BulbOutlined />
    },
    {
      title: '选择模板',
      description: '选择适合的报告模板',
      icon: <FileTextOutlined />
    },
    {
      title: '配置数据源',
      description: '选择数据源和分析参数',
      icon: <DatabaseOutlined />
    },
    {
      title: '完成创建',
      description: '确认信息并创建报告',
      icon: <CheckCircleOutlined />
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsLoading(true)
      setProgress(0)
      
      // 在选择AI模式后显示推荐
      if (currentStep === 0 && creationMode === 'ai') {
        setShowAIRecommendations(true)
      }
      
      // 在选择数据源后显示智能洞察
      if (currentStep === 2 && selectedDataSource && creationMode === 'ai') {
        setShowSmartInsights(true)
      }
      
      // 在最后一步显示AI分析选项
      if (currentStep === 3 && creationMode === 'ai') {
        setShowAIAnalysis(true)
      }
      
      // 模拟加载进度
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsLoading(false)
            setCurrentStep(currentStep + 1)
            return 100
          }
          return prev + 20
        })
      }, 100)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = () => {
    form.validateFields().then(values => {
      setIsLoading(true)
      setProgress(0)
      
      // 模拟创建进度
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsLoading(false)
            
            const reportData = {
              ...values,
              creationMode,
              selectedTemplate,
              selectedDataSource,
              aiAnalysisType: creationMode === 'ai' ? aiAnalysisType : null,
              createTime: new Date().toLocaleString('zh-CN'),
              status: creationMode === 'ai' ? 'analyzing' : 'draft'
            }
            
            onSuccess(reportData)
            message.success(`${creationMode === 'ai' ? 'AI智能' : '传统'}报告创建成功`)
            handleCancel()
            return 100
          }
          return prev + 10
        })
      }, 150)
    })
  }

  const handleCancel = () => {
    setCurrentStep(0)
    setCreationMode('')
    setSelectedTemplate('')
    setSelectedDataSource('')
    setAiAnalysisType('')
    setIsLoading(false)
    setProgress(0)
    form.resetFields()
    onCancel()
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ textAlign: 'center', marginBottom: designSystem.spacing.xl }}>
              <Title level={4} style={{ color: designSystem.colors.text.primary }}>
                选择报告创建方式
              </Title>
              <Text style={{ color: designSystem.colors.text.secondary }}>
                选择传统创建方式或AI智能创建方式
              </Text>
              {isLoading && (
                <div style={{ marginTop: designSystem.spacing.md }}>
                  <Progress percent={progress} size="small" />
                  <Text style={{ color: designSystem.colors.text.secondary, fontSize: '12px' }}>
                    正在准备下一步...
                  </Text>
                </div>
              )}
            </div>
            
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Card
                  hoverable
                  style={{
                    border: creationMode === 'traditional' 
                      ? `2px solid ${designSystem.colors.primary}` 
                      : `1px solid ${designSystem.colors.border.light}`,
                    borderRadius: designSystem.borderRadius.lg,
                    height: '200px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setCreationMode('traditional')}
                >
                  <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <FileTextOutlined style={{ 
                      fontSize: '48px', 
                      color: designSystem.colors.primary,
                      marginBottom: designSystem.spacing.md
                    }} />
                    <Title level={5} style={{ margin: 0, marginBottom: designSystem.spacing.sm }}>
                      传统创建
                    </Title>
                    <Text style={{ color: designSystem.colors.text.secondary }}>
                      使用预设模板快速创建报告
                    </Text>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  hoverable
                  style={{
                    border: creationMode === 'ai' 
                      ? `2px solid ${designSystem.colors.primary}` 
                      : `1px solid ${designSystem.colors.border.light}`,
                    borderRadius: designSystem.borderRadius.lg,
                    height: '200px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setCreationMode('ai')}
                >
                  <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <RobotOutlined style={{ 
                      fontSize: '48px', 
                      color: designSystem.colors.secondary,
                      marginBottom: designSystem.spacing.md
                    }} />
                    <Title level={5} style={{ margin: 0, marginBottom: designSystem.spacing.sm }}>
                      AI智能创建
                    </Title>
                    <Text style={{ color: designSystem.colors.text.secondary }}>
                      AI自动分析数据并生成洞察
                    </Text>
                  </div>
                </Card>
              </Col>
            </Row>
          </motion.div>
        )

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ textAlign: 'center', marginBottom: designSystem.spacing.xl }}>
              <Title level={4} style={{ color: designSystem.colors.text.primary }}>
                选择报告模板
              </Title>
              <Text style={{ color: designSystem.colors.text.secondary }}>
                {creationMode === 'ai' ? '选择支持AI分析的模板' : '选择适合的报告模板'}
              </Text>
              {creationMode === 'ai' && (
                <div>
                  <div style={{ 
                    marginTop: designSystem.spacing.md,
                    padding: designSystem.spacing.sm,
                    backgroundColor: designSystem.colors.background.secondary,
                    borderRadius: designSystem.borderRadius.md,
                    border: `1px solid ${designSystem.colors.primary}20`
                  }}>
                    <BulbOutlined style={{ color: designSystem.colors.primary, marginRight: designSystem.spacing.xs }} />
                    <Text style={{ color: designSystem.colors.text.secondary, fontSize: '12px' }}>
                      推荐：销售分析和用户分析模板具有强大的AI分析能力
                    </Text>
                  </div>
                  
                  {showAIRecommendations && (
                    <div style={{ marginTop: designSystem.spacing.lg }}>
                      <AIRecommendationEngine
                        context={{
                          selectedTemplate,
                          reportType: creationMode
                        }}
                        onRecommendationSelect={(recommendation) => {
                          setAiRecommendations(prev => [...prev, recommendation])
                        }}
                        maxRecommendations={2}
                      />
                    </div>
                  )}
                </div>
              )}
              {isLoading && (
                <div style={{ marginTop: designSystem.spacing.md }}>
                  <Progress percent={progress} size="small" />
                  <Text style={{ color: designSystem.colors.text.secondary, fontSize: '12px' }}>
                    正在加载数据源配置...
                  </Text>
                </div>
              )}
            </div>
            
            <Row gutter={[16, 16]}>
              {templates
                .filter(template => creationMode === 'traditional' || template.aiEnabled)
                .map(template => (
                <Col span={12} key={template.id}>
                  <Card
                    hoverable
                    style={{
                      border: selectedTemplate === template.id 
                        ? `2px solid ${designSystem.colors.primary}` 
                        : `1px solid ${designSystem.colors.border.light}`,
                      borderRadius: designSystem.borderRadius.lg,
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: designSystem.spacing.md }}>
                      <div style={{ 
                        fontSize: '24px', 
                        color: designSystem.colors.primary,
                        marginTop: '4px'
                      }}>
                        {template.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.sm, marginBottom: designSystem.spacing.xs }}>
                          <Title level={5} style={{ margin: 0 }}>
                            {template.name}
                          </Title>
                          {template.aiEnabled && (
                            <Tag color="blue" style={{ fontSize: '10px' }}>
                              AI支持
                            </Tag>
                          )}
                        </div>
                        <Paragraph style={{ 
                          margin: 0, 
                          marginBottom: designSystem.spacing.sm,
                          color: designSystem.colors.text.secondary,
                          fontSize: designSystem.typography.fontSize.sm
                        }}>
                          {template.description}
                        </Paragraph>
                        <Space wrap size="small">
                          {template.features.slice(0, 3).map(feature => (
                            <Tag key={feature} style={{ fontSize: '10px' }}>
                              {feature}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ textAlign: 'center', marginBottom: designSystem.spacing.xl }}>
              <Title level={4} style={{ color: designSystem.colors.text.primary }}>
                配置数据源
              </Title>
              <Text style={{ color: designSystem.colors.text.secondary }}>
                {creationMode === 'ai' ? '选择数据源和AI分析类型' : '选择报告的数据源'}
              </Text>
              {creationMode === 'ai' && selectedTemplate && (
                <div style={{ 
                  marginTop: designSystem.spacing.md,
                  padding: designSystem.spacing.sm,
                  backgroundColor: designSystem.colors.background.secondary,
                  borderRadius: designSystem.borderRadius.md,
                  border: `1px solid ${designSystem.colors.success}20`
                }}>
                  <ThunderboltOutlined style={{ color: designSystem.colors.success, marginRight: designSystem.spacing.xs }} />
                  <Text style={{ color: designSystem.colors.text.secondary, fontSize: '12px' }}>
                    智能推荐：基于您选择的模板，推荐使用趋势分析和异常检测
                  </Text>
                </div>
              )}
              {isLoading && (
                <div style={{ marginTop: designSystem.spacing.md }}>
                  <Progress percent={progress} size="small" />
                  <Text style={{ color: designSystem.colors.text.secondary, fontSize: '12px' }}>
                    正在准备报告创建...
                  </Text>
                </div>
              )}
            </div>
            
            <div style={{ marginBottom: designSystem.spacing.xl }}>
              <Title level={5} style={{ marginBottom: designSystem.spacing.md }}>
                选择数据源
              </Title>
              <Row gutter={[16, 16]}>
                {dataSources
                  .filter(source => creationMode === 'traditional' || source.aiCapable)
                  .map(source => (
                  <Col span={12} key={source.id}>
                    <Card
                      hoverable
                      style={{
                        border: selectedDataSource === source.id 
                          ? `2px solid ${designSystem.colors.primary}` 
                          : `1px solid ${designSystem.colors.border.light}`,
                        borderRadius: designSystem.borderRadius.lg,
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedDataSource(source.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.md }}>
                        <div style={{ fontSize: '20px', color: designSystem.colors.primary }}>
                          {source.icon}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.sm }}>
                            <Text strong>{source.name}</Text>
                            {source.aiCapable && (
                              <Tag color="green" style={{ fontSize: '10px' }}>
                                AI兼容
                              </Tag>
                            )}
                          </div>
                          <Text style={{ 
                            color: designSystem.colors.text.secondary,
                            fontSize: designSystem.typography.fontSize.sm
                          }}>
                            {source.description}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            {creationMode === 'ai' && (
              <div>
                <Title level={5} style={{ marginBottom: designSystem.spacing.md }}>
                  选择AI分析类型
                </Title>
                <Row gutter={[16, 16]}>
                  {aiAnalysisTypes.map(type => (
                    <Col span={12} key={type.value}>
                      <Card
                        hoverable
                        style={{
                          border: aiAnalysisType === type.value 
                            ? `2px solid ${designSystem.colors.primary}` 
                            : `1px solid ${designSystem.colors.border.light}`,
                          borderRadius: designSystem.borderRadius.lg,
                          cursor: 'pointer'
                        }}
                        onClick={() => setAiAnalysisType(type.value)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.md }}>
                          <div style={{ fontSize: '20px', color: type.color }}>
                            {type.icon}
                          </div>
                          <div>
                            <Text strong>{type.label}</Text>
                            <br />
                            <Text style={{ 
                              color: designSystem.colors.text.secondary,
                              fontSize: designSystem.typography.fontSize.sm
                            }}>
                              {type.description}
                            </Text>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
            
            {showSmartInsights && creationMode === 'ai' && selectedDataSource && (
              <div style={{ marginTop: designSystem.spacing.xl }}>
                <SmartInsights
                  dataSource={selectedDataSource}
                  reportType={creationMode}
                  onInsightAction={(insight, action) => {
                    if (action === 'apply') {
                      message.success(`已应用洞察: ${insight.title}`)
                    } else if (action === 'detail') {
                      message.info(`查看详情: ${insight.title}`)
                    }
                  }}
                />
              </div>
            )}
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ textAlign: 'center', marginBottom: designSystem.spacing.xl }}>
              <Title level={4} style={{ color: designSystem.colors.text.primary }}>
                完成创建
              </Title>
              <Text style={{ color: designSystem.colors.text.secondary }}>
                填写报告基本信息并完成创建
              </Text>
              {isLoading && (
                <div style={{ marginTop: designSystem.spacing.md }}>
                  <Progress percent={progress} size="small" />
                  <Text style={{ color: designSystem.colors.text.secondary, fontSize: '12px' }}>
                    {creationMode === 'ai' ? '正在启动AI分析引擎...' : '正在创建报告...'}
                  </Text>
                </div>
              )}
            </div>
            
            <Form
              form={form}
              layout="vertical"
              style={{ maxWidth: '500px', margin: '0 auto' }}
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
                        { label: 'AI分析', value: 'AI分析' },
                        { label: '智能洞察', value: '智能洞察' }
                      ]}
                    />
                  </Form.Item>
                  </Col>
                </Row>
              </Form>
              
              {showAIAnalysis && creationMode === 'ai' && (
                <div style={{ marginTop: designSystem.spacing.xl }}>
                  <AIAnalysisEngine
                    reportData={{
                      template: selectedTemplate,
                      dataSource: selectedDataSource,
                      analysisType: aiAnalysisType,
                      formData: form.getFieldsValue()
                    }}
                    analysisType={aiAnalysisType || '综合分析'}
                    onAnalysisComplete={(results) => {
                      setAnalysisResults(results)
                      message.success('AI分析完成！已生成智能洞察和建议')
                    }}
                    onAnalysisError={(error) => {
                      message.error(`分析过程中出现错误: ${error}`)
                    }}
                  />
                </div>
              )}
            </motion.div>
          )

      default:
        return null
    }
  }

  const canNext = () => {
    switch (currentStep) {
      case 0:
        return creationMode !== ''
      case 1:
        return selectedTemplate !== ''
      case 2:
        return selectedDataSource !== '' && (creationMode === 'traditional' || aiAnalysisType !== '')
      default:
        return true
    }
  }

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.sm }}>
          <BulbOutlined style={{ color: designSystem.colors.primary }} />
          <span>智能报告创建向导</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={null}
      destroyOnClose
    >
      <div style={{ padding: `${designSystem.spacing.lg} 0` }}>
        {/* 步骤指示器 */}
        <Steps
          current={currentStep}
          style={{ marginBottom: designSystem.spacing.xl }}
        >
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </Steps>

        {/* 步骤内容 */}
        <div style={{ minHeight: '400px', marginBottom: designSystem.spacing.xl }}>
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            上一步
          </Button>
          
          <div style={{ display: 'flex', gap: designSystem.spacing.sm }}>
            <Button variant="ghost" onClick={handleCancel}>
              取消
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!canNext()}
              >
                下一步
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleFinish}
                disabled={!canNext()}
              >
                {creationMode === 'ai' ? '开始AI分析' : '创建报告'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ReportCreationWizard