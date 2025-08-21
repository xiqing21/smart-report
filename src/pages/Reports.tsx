import React, { useState } from 'react'
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Tag,
  Space,
  Avatar,
  Dropdown,
  Modal,
  message,
  Tooltip,
  Progress
} from 'antd'
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  EyeOutlined,
  MoreOutlined,

  FileTextOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons'
import { EnhancedButton, InteractiveCard, StatusTag, LikeButton, BookmarkButton } from '../components/InteractiveEnhancements'
import { AnimatedList } from '../components/AdvancedAnimations'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker

interface Report {
  id: string
  title: string
  description: string
  status: 'draft' | 'published' | 'reviewing' | 'archived'
  author: string
  authorAvatar?: string
  createTime: string
  updateTime: string
  views: number
  category: string
  tags: string[]
  progress?: number
  size: string
}

const Reports: React.FC = () => {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<any>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [loading] = useState(false)

  // 模拟数据
  const mockReports: Report[] = [
    {
      id: '1',
      title: '2024年第一季度销售分析报告',
      description: '详细分析第一季度各产品线销售情况，包含市场趋势和竞争对手分析',
      status: 'published',
      author: '张三',
      authorAvatar: '',
      createTime: '2024-01-15 14:30:00',
      updateTime: '2024-01-16 09:15:00',
      views: 156,
      category: '销售分析',
      tags: ['季度报告', '销售', '数据分析'],
      size: '2.3 MB'
    },
    {
      id: '2',
      title: '用户行为数据洞察报告',
      description: '基于用户行为数据的深度分析，发现用户使用模式和优化建议',
      status: 'draft',
      author: '李四',
      createTime: '2024-01-14 09:15:00',
      updateTime: '2024-01-14 16:45:00',
      views: 89,
      category: '用户研究',
      tags: ['用户行为', 'UX', '数据洞察'],
      progress: 65,
      size: '1.8 MB'
    },
    {
      id: '3',
      title: '市场竞争力分析报告',
      description: '全面分析市场竞争环境，评估公司产品竞争力和市场定位',
      status: 'reviewing',
      author: '王五',
      createTime: '2024-01-13 16:45:00',
      updateTime: '2024-01-13 18:20:00',
      views: 234,
      category: '市场分析',
      tags: ['竞争分析', '市场调研', '战略规划'],
      size: '3.1 MB'
    },
    {
      id: '4',
      title: '产品功能使用情况统计',
      description: '统计分析各产品功能的使用频率和用户满意度',
      status: 'published',
      author: '赵六',
      createTime: '2024-01-12 11:20:00',
      updateTime: '2024-01-12 15:30:00',
      views: 98,
      category: '产品分析',
      tags: ['功能分析', '用户体验', '产品优化'],
      size: '1.5 MB'
    },
    {
      id: '5',
      title: '年度财务总结报告',
      description: '2023年度财务状况全面总结，包含收入、支出和投资回报分析',
      status: 'archived',
      author: '钱七',
      createTime: '2023-12-28 10:00:00',
      updateTime: '2023-12-30 14:20:00',
      views: 445,
      category: '财务分析',
      tags: ['年度报告', '财务', '总结'],
      size: '4.2 MB'
    }
  ]

  const [reports, setReports] = useState<Report[]>(mockReports)



  const handleEdit = (record: Report) => {
    navigate(`/editor/${record.id}`)
  }

  const handleDelete = (record: Report) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除报告 "${record.title}" 吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        setReports(reports.filter(r => r.id !== record.id))
        message.success('报告删除成功')
      }
    })
  }

  const handleShare = (record: Report) => {
    message.success(`报告 "${record.title}" 分享链接已复制到剪贴板`)
  }

  const handleDownload = (record: Report) => {
    message.success(`正在下载报告 "${record.title}"`)
  }

  const getActionMenu = (record: Report) => ({
    items: [
      {
        key: 'edit',
        label: '编辑',
        icon: <EditOutlined />,
        onClick: () => handleEdit(record)
      },
      {
        key: 'share',
        label: '分享',
        icon: <ShareAltOutlined />,
        onClick: () => handleShare(record)
      },
      {
        key: 'download',
        label: '下载',
        icon: <DownloadOutlined />,
        onClick: () => handleDownload(record)
      },
      {
        type: 'divider' as const
      },
      {
        key: 'delete',
        label: '删除',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDelete(record)
      }
    ]
  })

  const columns: ColumnsType<Report> = [
    {
      title: '报告标题',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (text: string, record: Report) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            size={40} 
            icon={<FileTextOutlined />} 
            className="bg-blue-100 text-blue-600"
          />
          <div>
            <div 
              className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer truncate"
              onClick={() => handleEdit(record)}
            >
              {text}
            </div>
            <div className="text-xs text-gray-500 truncate max-w-xs">
              {record.description}
            </div>
          </div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string, record: Report) => (
        <div>
          <StatusTag 
            status={status === 'published' ? 'completed' : status === 'draft' ? 'new' : 'processing'}
            animated
          />
          {record.progress && (
            <div className="mt-1">
              <Progress percent={record.progress} size="small" />
            </div>
          )}
        </div>
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      )
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 120,
      render: (author: string) => (
        <div className="flex items-center space-x-2">
          <Avatar size={24} icon={<UserOutlined />} />
          <span>{author}</span>
        </div>
      )
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      width: 80,
      render: (views: number) => (
        <span className="flex items-center space-x-1">
          <EyeOutlined className="text-gray-400" />
          <span>{views}</span>
        </span>
      )
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 150,
      render: (time: string) => (
        <Tooltip title={time}>
          <span className="text-gray-600">
            {dayjs(time).format('MM-DD HH:mm')}
          </span>
        </Tooltip>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record: Report) => (
        <Space>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="分享">
            <Button 
              type="text" 
              size="small" 
              icon={<ShareAltOutlined />}
              onClick={() => handleShare(record)}
            />
          </Tooltip>
          <Dropdown menu={getActionMenu(record)} trigger={['click']}>
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ]

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchText.toLowerCase())
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter
    
    let matchesDate = true
    if (dateRange && dateRange.length === 2) {
      const reportDate = dayjs(report.updateTime)
      matchesDate = reportDate.isAfter(dateRange[0]) && reportDate.isBefore(dateRange[1])
    }
    
    return matchesSearch && matchesStatus && matchesCategory && matchesDate
  })

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys)
    }
  }

  const renderCardView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <AnimatePresence>
        <AnimatedList
          dataSource={filteredReports}
          staggerDelay={0.1}
          animationType="scale"
          renderItem={(report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              style={{ width: '100%' }}
            >
                <InteractiveCard
                  className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  effect="lift"
                  hoverable
                >
                  <Card
                    styles={{ body: { padding: '16px' } }}
                    style={{ width: '100%' }}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      {/* 左侧图标区域 */}
                      <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <FileTextOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                      </div>
                      
                      {/* 右侧内容区域 */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#262626' }}>
                            {report.title}
                          </h4>
                          <StatusTag 
                            status={report.status === 'published' ? 'completed' : report.status === 'draft' ? 'new' : 'processing'}
                            animated
                          />
                        </div>
                        
                        <p style={{ color: '#8c8c8c', fontSize: '14px', marginBottom: '12px', lineHeight: '1.4' }}>
                          {report.description}
                        </p>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <Tag color="blue" style={{ fontSize: '11px' }}>{report.category}</Tag>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#666' }}>
                            <UserOutlined style={{ fontSize: '11px' }} />
                            <span>{report.author}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#666' }}>
                            <EyeOutlined style={{ fontSize: '11px' }} />
                            <span>{report.views}</span>
                          </div>
                        </div>
                        
                        {report.progress && (
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                              <span>进度</span>
                              <span style={{ fontWeight: '500' }}>{report.progress}%</span>
                            </div>
                            <Progress percent={report.progress} size="small" strokeColor="#1890ff" />
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#999', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ClockCircleOutlined style={{ fontSize: '11px' }} />
                            <span>{dayjs(report.updateTime).format('MM-DD HH:mm')}</span>
                          </div>
                          <span style={{ fontWeight: '500' }}>{report.size}</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                          {report.tags.slice(0, 2).map((tag: string) => (
                            <Tag key={tag} style={{ fontSize: '10px', margin: 0, padding: '1px 4px', height: 'auto', lineHeight: '1.2' }}>{tag}</Tag>
                          ))}
                          {report.tags.length > 2 && (
                            <Tag style={{ fontSize: '10px', margin: 0, padding: '1px 4px', height: 'auto', lineHeight: '1.2' }}>+{report.tags.length - 2}</Tag>
                          )}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <Tooltip title="编辑">
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => handleEdit(report)}
                            />
                          </Tooltip>
                          <Tooltip title="分享">
                            <Button
                              type="text"
                              size="small"
                              icon={<ShareAltOutlined />}
                              onClick={() => handleShare(report)}
                            />
                          </Tooltip>
                          <Tooltip title="下载">
                            <Button
                              type="text"
                              size="small"
                              icon={<DownloadOutlined />}
                              onClick={() => handleDownload(report)}
                            />
                          </Tooltip>
                          <LikeButton initialLiked={false} likeCount={Math.floor(Math.random() * 20)} />
                          <BookmarkButton initialBookmarked={false} />
                          <Dropdown menu={getActionMenu(report)} trigger={['click']}>
                            <Button type="text" size="small" icon={<MoreOutlined />} />
                          </Dropdown>
                        </div>
                      </div>
                    </div>
                  </Card>
                </InteractiveCard>
            </motion.div>
          )}
        />
      </AnimatePresence>
    </div>
  )

  return (
    <div style={{ padding: '0', background: '#f5f5f5', minHeight: '100%' }}>
      {/* 页面标题和操作栏 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: '20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#262626', margin: 0 }}>报告管理</h1>
            <p style={{ color: '#8c8c8c', marginTop: '4px', marginBottom: 0 }}>管理和组织您的所有报告</p>
          </div>
          <EnhancedButton 
            type="primary" 
            size="large" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/editor')}
            className="shadow-lg"
            variant="glow"
          >
            创建报告
          </EnhancedButton>
        </div>

        {/* 筛选和搜索栏 */}
        <Card style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
            <Search
              placeholder="搜索报告标题或描述"
              allowClear
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
            
            <Select
              placeholder="状态筛选"
              style={{ width: 120 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">全部状态</Option>
              <Option value="draft">草稿</Option>
              <Option value="reviewing">审核中</Option>
              <Option value="published">已发布</Option>
              <Option value="archived">已归档</Option>
            </Select>
            
            <Select
              placeholder="分类筛选"
              style={{ width: 120 }}
              value={categoryFilter}
              onChange={setCategoryFilter}
            >
              <Option value="all">全部分类</Option>
              <Option value="销售分析">销售分析</Option>
              <Option value="用户研究">用户研究</Option>
              <Option value="市场分析">市场分析</Option>
              <Option value="产品分析">产品分析</Option>
              <Option value="财务分析">财务分析</Option>
            </Select>
            
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              value={dateRange}
              onChange={setDateRange}
            />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
              <span style={{ color: '#8c8c8c', fontSize: '14px' }}>
                共 {filteredReports.length} 个报告
              </span>
              <Space.Compact>
                <EnhancedButton
                  type={viewMode === 'table' ? 'primary' : 'default'}
                  icon={<UnorderedListOutlined />}
                  onClick={() => setViewMode('table')}
                  variant="pulse"
                >
                  列表
                </EnhancedButton>
                <EnhancedButton
                  type={viewMode === 'card' ? 'primary' : 'default'}
                  icon={<AppstoreOutlined />}
                  onClick={() => setViewMode('card')}
                  variant="pulse"
                >
                  卡片
                </EnhancedButton>
              </Space.Compact>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 批量操作栏 */}
      {selectedRowKeys.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '16px' }}
        >
          <Card style={{ background: '#e6f7ff', borderColor: '#91d5ff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#1890ff', fontWeight: '500' }}>
                已选择 {selectedRowKeys.length} 个报告
              </span>
              <Space>
                <Button size="small">批量分享</Button>
                <Button size="small">批量下载</Button>
                <Button size="small" danger>批量删除</Button>
              </Space>
            </div>
          </Card>
        </motion.div>
      )}

      {/* 报告列表 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {viewMode === 'table' ? (
          <Card className="shadow-sm">
            <Table
              columns={columns}
              dataSource={filteredReports}
              rowKey="id"
              rowSelection={rowSelection}
              loading={loading}
              pagination={{
                total: filteredReports.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
              }}
              scroll={{ x: 1200 }}
            />
          </Card>
        ) : (
          renderCardView()
        )}
      </motion.div>
    </div>
  )
}

export default Reports