import React, { useState } from 'react'
import { Row, Col, Table, Tag, Space, Modal, Form, Input, Select, message, Typography, Divider, Progress, Tooltip } from 'antd'
import {
  DatabaseOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  CloudServerOutlined,
  FileExcelOutlined,
  MonitorOutlined,
  SettingOutlined,
  LineChartOutlined,
  SafetyOutlined
} from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import type { ColumnsType } from 'antd/es/table'
import { Card, Button, Status } from '@/components/ui'
import { designSystem } from '@/styles/design-system'

const { Title, Text } = Typography

interface DataSource {
  id: string
  name: string
  type: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync: string
  recordCount: number
  description: string
  health: number
  category: 'database' | 'file' | 'api' | 'cloud'
}

const DataCenter: React.FC = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: '1',
      name: '销售数据库',
      type: 'MySQL',
      status: 'connected',
      lastSync: '2024-01-15 14:30:00',
      recordCount: 15420,
      description: '主要销售数据，包含订单、客户信息',
      health: 95,
      category: 'database'
    },
    {
      id: '2',
      name: '用户行为数据',
      type: 'MongoDB',
      status: 'connected',
      lastSync: '2024-01-15 14:25:00',
      recordCount: 89650,
      description: '用户访问日志和行为轨迹数据',
      health: 88,
      category: 'database'
    },
    {
      id: '3',
      name: '财务报表',
      type: 'Excel',
      status: 'error',
      lastSync: '2024-01-14 09:15:00',
      recordCount: 0,
      description: '月度财务数据表格',
      health: 0,
      category: 'file'
    },
    {
      id: '4',
      name: '产品库存',
      type: 'PostgreSQL',
      status: 'disconnected',
      lastSync: '2024-01-13 16:20:00',
      recordCount: 3280,
      description: '产品库存和供应链数据',
      health: 72,
      category: 'database'
    },
    {
      id: '5',
      name: 'API数据接口',
      type: 'REST API',
      status: 'connected',
      lastSync: '2024-01-15 15:00:00',
      recordCount: 25680,
      description: '第三方API数据接口',
      health: 92,
      category: 'api'
    },
    {
      id: '6',
      name: '云存储数据',
      type: 'AWS S3',
      status: 'connected',
      lastSync: '2024-01-15 14:45:00',
      recordCount: 156780,
      description: '云端存储的大数据文件',
      health: 98,
      category: 'cloud'
    }
  ])

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingSource, setEditingSource] = useState<DataSource | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [form] = Form.useForm()

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'database':
        return <DatabaseOutlined />
      case 'file':
        return <FileExcelOutlined />
      case 'api':
        return <CloudServerOutlined />
      case 'cloud':
        return <MonitorOutlined />
      default:
        return <DatabaseOutlined />
    }
  }

  const getTypeColor = (type: string) => {
    const colors = {
      'MySQL': designSystem.colors.primary,
      'PostgreSQL': designSystem.colors.secondary,
      'MongoDB': designSystem.colors.success,
      'Excel': designSystem.colors.warning,
      'REST API': designSystem.colors.info,
      'AWS S3': designSystem.colors.purple
    }
    return colors[type as keyof typeof colors] || designSystem.colors.gray
  }

  const handleSync = (record: DataSource) => {
    message.loading({ content: '正在同步数据...', key: 'sync' })
    setTimeout(() => {
      message.success({ content: '数据同步完成', key: 'sync' })
      setDataSources(prev => prev.map(item => 
        item.id === record.id 
          ? { ...item, lastSync: new Date().toLocaleString('zh-CN'), health: Math.min(100, item.health + 5) }
          : item
      ))
    }, 2000)
  }

  const handleEdit = (record: DataSource) => {
    setEditingSource(record)
    form.setFieldsValue(record)
    setIsModalVisible(true)
  }

  const handleDelete = (record: DataSource) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除数据源 "${record.name}" 吗？`,
      onOk: () => {
        setDataSources(prev => prev.filter(item => item.id !== record.id))
        message.success('数据源删除成功')
      }
    })
  }

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingSource) {
        setDataSources(prev => prev.map(item => 
          item.id === editingSource.id ? { ...item, ...values } : item
        ))
        message.success('数据源更新成功')
      } else {
        const newSource: DataSource = {
          id: Date.now().toString(),
          ...values,
          status: 'disconnected',
          lastSync: '从未同步',
          recordCount: 0,
          health: 0,
          category: 'database'
        }
        setDataSources(prev => [...prev, newSource])
        message.success('数据源添加成功')
      }
      setIsModalVisible(false)
      setEditingSource(null)
      form.resetFields()
    })
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    setEditingSource(null)
    form.resetFields()
  }

  const columns: ColumnsType<DataSource> = [
    {
      title: '数据源信息',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.sm }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: designSystem.borderRadius.md,
            background: `linear-gradient(135deg, ${getTypeColor(record.type)}20, ${getTypeColor(record.type)}40)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: getTypeColor(record.type),
            fontSize: '18px'
          }}>
            {getCategoryIcon(record.category)}
          </div>
          <div>
            <div style={{ 
              fontWeight: designSystem.typography.fontWeight.semibold,
              color: designSystem.colors.text.primary,
              fontSize: designSystem.typography.fontSize.sm
            }}>
              {text}
            </div>
            <div style={{ 
              color: designSystem.colors.text.secondary,
              fontSize: designSystem.typography.fontSize.xs,
              marginTop: '2px'
            }}>
              {record.description}
            </div>
          </div>
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag 
          color={getTypeColor(type)} 
          style={{ 
            borderRadius: designSystem.borderRadius.sm,
            fontWeight: designSystem.typography.fontWeight.medium
          }}
        >
          {type}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Status type={status === 'connected' ? 'success' : status === 'error' ? 'error' : 'warning'} text={status === 'connected' ? '已连接' : status === 'error' ? '连接错误' : '未连接'} />
    },
    {
      title: '健康度',
      dataIndex: 'health',
      key: 'health',
      render: (health) => (
        <div style={{ width: '80px' }}>
          <Progress 
            percent={health} 
            size="small" 
            strokeColor={{
              '0%': health > 80 ? designSystem.colors.success : health > 60 ? designSystem.colors.warning : designSystem.colors.error,
              '100%': health > 80 ? designSystem.colors.success : health > 60 ? designSystem.colors.warning : designSystem.colors.error,
            }}
            showInfo={false}
          />
          <Text style={{ fontSize: designSystem.typography.fontSize.xs, color: designSystem.colors.text.secondary }}>
            {health}%
          </Text>
        </div>
      )
    },
    {
      title: '记录数',
      dataIndex: 'recordCount',
      key: 'recordCount',
      render: (count) => (
        <div style={{ textAlign: 'right' }}>
          <div style={{ 
            fontWeight: designSystem.typography.fontWeight.semibold,
            color: designSystem.colors.text.primary
          }}>
            {count.toLocaleString()}
          </div>
          <div style={{ 
            fontSize: designSystem.typography.fontSize.xs,
            color: designSystem.colors.text.secondary
          }}>
            条记录
          </div>
        </div>
      )
    },
    {
      title: '最后同步',
      dataIndex: 'lastSync',
      key: 'lastSync',
      render: (lastSync) => (
        <Text style={{ 
          fontSize: designSystem.typography.fontSize.sm,
          color: designSystem.colors.text.secondary
        }}>
          {lastSync}
        </Text>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="同步数据">
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => handleSync(record)}
              disabled={record.status === 'error'}
            >
              <SyncOutlined />
            </Button>
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(record)}
            >
              <EditOutlined />
            </Button>
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(record)}
              style={{ color: designSystem.colors.error }}
            >
              <DeleteOutlined />
            </Button>
          </Tooltip>
        </Space>
      )
    }
  ]

  const dataSourceTypes = [
    { label: 'MySQL', value: 'MySQL' },
    { label: 'PostgreSQL', value: 'PostgreSQL' },
    { label: 'MongoDB', value: 'MongoDB' },
    { label: 'Oracle', value: 'Oracle' },
    { label: 'SQL Server', value: 'SQL Server' },
    { label: 'Excel', value: 'Excel' },
    { label: 'CSV', value: 'CSV' },
    { label: 'JSON', value: 'JSON' },
    { label: 'REST API', value: 'REST API' },
    { label: 'AWS S3', value: 'AWS S3' }
  ]

  const categories = [
    { label: '全部', value: 'all' },
    { label: '数据库', value: 'database' },
    { label: '文件', value: 'file' },
    { label: 'API', value: 'api' },
    { label: '云存储', value: 'cloud' }
  ]

  const filteredDataSources = selectedCategory === 'all' 
    ? dataSources 
    : dataSources.filter(ds => ds.category === selectedCategory)

  const connectedCount = dataSources.filter(ds => ds.status === 'connected').length
  const totalRecords = dataSources.reduce((sum, ds) => sum + ds.recordCount, 0)
  const errorCount = dataSources.filter(ds => ds.status === 'error').length
  const avgHealth = Math.round(dataSources.reduce((sum, ds) => sum + ds.health, 0) / dataSources.length)

  const statsCards = [
    {
      title: '总数据源',
      value: dataSources.length,
      icon: <DatabaseOutlined />,
      color: designSystem.colors.primary,
      trend: '+2 本月'
    },
    {
      title: '已连接',
      value: connectedCount,
      icon: <CheckCircleOutlined />,
      color: designSystem.colors.success,
      trend: `${Math.round((connectedCount / dataSources.length) * 100)}% 连接率`
    },
    {
      title: '总记录数',
      value: totalRecords.toLocaleString(),
      icon: <LineChartOutlined />,
      color: designSystem.colors.purple,
      trend: '+15.2% 本周'
    },
    {
      title: '平均健康度',
      value: `${avgHealth}%`,
      icon: <SafetyOutlined />,
      color: avgHealth > 80 ? designSystem.colors.success : avgHealth > 60 ? designSystem.colors.warning : designSystem.colors.error,
      trend: avgHealth > 80 ? '优秀' : avgHealth > 60 ? '良好' : '需关注'
    }
  ]

  return (
    <div style={{ padding: designSystem.spacing.lg }}>
      {/* 页面标题 - 玻璃拟态风格 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: designSystem.spacing.xl }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: designSystem.spacing.lg,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: designSystem.borderRadius.xl,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div>
            <Title level={2} style={{ 
              margin: 0, 
              color: designSystem.colors.text.primary,
              fontSize: designSystem.typography.fontSize.xxl,
              fontWeight: designSystem.typography.fontWeight.bold,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              数据中心
            </Title>
            <Text style={{ 
              color: designSystem.colors.text.secondary,
              fontSize: designSystem.typography.fontSize.md,
              marginTop: designSystem.spacing.xs
            }}>
              统一管理和监控所有数据源连接 • 实时监控数据健康状况
            </Text>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="primary"
              size="lg"
              onClick={() => setIsModalVisible(true)}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                borderRadius: designSystem.borderRadius.lg,
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)'
              }}
            >
              <PlusOutlined /> 添加数据源
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* 数据概览卡片 - 玻璃拟态风格 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Row gutter={[24, 24]} style={{ marginBottom: designSystem.spacing.xl }}>
          {statsCards.map((stat, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              >
                <Card 
                  hoverable
                  style={{ 
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: designSystem.borderRadius.xl,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 16px 48px rgba(99, 102, 241, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: designSystem.borderRadius.full,
                      background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}60)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      color: stat.color,
                      fontSize: '28px',
                      boxShadow: `0 8px 24px ${stat.color}30`
                    }}>
                      {stat.icon}
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                      style={{ 
                        fontSize: designSystem.typography.fontSize.xxxl, 
                        fontWeight: designSystem.typography.fontWeight.bold, 
                        color: designSystem.colors.text.primary,
                        marginBottom: designSystem.spacing.sm,
                        background: `linear-gradient(135deg, ${stat.color}, ${stat.color}aa)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      {stat.value}
                    </motion.div>
                    <div style={{ 
                      color: designSystem.colors.text.secondary, 
                      fontSize: designSystem.typography.fontSize.md,
                      marginBottom: designSystem.spacing.sm,
                      fontWeight: designSystem.typography.fontWeight.medium
                    }}>
                      {stat.title}
                    </div>
                    <motion.div 
                      style={{ 
                        color: stat.color, 
                        fontSize: designSystem.typography.fontSize.sm,
                        fontWeight: designSystem.typography.fontWeight.semibold,
                        background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}40)`,
                        padding: '4px 12px',
                        borderRadius: designSystem.borderRadius.lg,
                        display: 'inline-block'
                      }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {stat.trend}
                    </motion.div>
                  </motion.div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      {/* 数据源管理 - 玻璃拟态风格 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.sm }}>
              <DatabaseOutlined style={{ color: designSystem.colors.primary, fontSize: '24px' }} />
              <span style={{ 
                fontSize: designSystem.typography.fontSize.xl,
                fontWeight: designSystem.typography.fontWeight.semibold,
                background: `linear-gradient(135deg, ${designSystem.colors.primary}, ${designSystem.colors.primary}aa)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                数据源管理
              </span>
            </div>
          }
          extra={
            <div style={{ display: 'flex', gap: designSystem.spacing.sm }}>
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ 
                  width: '140px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: designSystem.borderRadius.lg
                }}
                dropdownStyle={{
                  background: 'rgba(30, 41, 59, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: designSystem.borderRadius.lg
                }}
                options={[
                  { value: 'all', label: '全部分类' },
                  ...categories.map(cat => ({ value: cat.value, label: cat.label }))
                ]}
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  type="primary" 
                  icon={<SyncOutlined />}
                  onClick={() => {
                    dataSources.forEach(ds => {
                      if (ds.status === 'connected') {
                        handleSync(ds)
                      }
                    })
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    borderRadius: designSystem.borderRadius.lg,
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  批量同步
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setIsModalVisible(true)}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    border: 'none',
                    borderRadius: designSystem.borderRadius.lg,
                    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  添加数据源
                </Button>
              </motion.div>
            </div>
          }
          style={{ 
            borderRadius: designSystem.borderRadius.xl,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
          headStyle={{
            background: 'transparent',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '24px'
          }}
          bodyStyle={{
            padding: '24px'
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Table
              columns={columns}
              dataSource={filteredDataSources}
              rowKey="id"
              scroll={{ x: 800 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 个数据源`,
                responsive: true,
                style: {
                  marginTop: '24px',
                  padding: '16px'
                }
              }}
              style={{ 
                borderRadius: designSystem.borderRadius.lg,
                overflow: 'hidden',
                background: 'transparent'
              }}
              className="glass-table"
            />
          </motion.div>
        </Card>
      </motion.div>

      {/* 添加/编辑数据源模态框 */}
      <Modal
        title={
          <span style={{ 
            fontSize: designSystem.typography.fontSize.lg,
            fontWeight: designSystem.typography.fontWeight.semibold
          }}>
            {editingSource ? '编辑数据源' : '添加数据源'}
          </span>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Divider style={{ margin: `${designSystem.spacing.md} 0` }} />
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: 'MySQL',
            category: 'database'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="数据源名称"
                rules={[{ required: true, message: '请输入数据源名称' }]}
              >
                <Input placeholder="请输入数据源名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="数据源类型"
                rules={[{ required: true, message: '请选择数据源类型' }]}
              >
                <Select options={dataSourceTypes} placeholder="请选择数据源类型" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入数据源描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default DataCenter