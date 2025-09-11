import React, { useState, useEffect } from 'react'
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
  Tooltip,
  Progress,
  App
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
import { ReportService } from '../services/api/dataService'
import type { Report as DatabaseReport } from '../types/database'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker

// 使用数据库Report类型，并添加显示需要的字段
interface Report extends DatabaseReport {
  author?: string
  authorAvatar?: string
  category?: string
  progress?: number
  size?: string
  description?: string
}

const Reports: React.FC = () => {
  const navigate = useNavigate()
  const { modal, message } = App.useApp()
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<any>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [loading, setLoading] = useState(true)

  // 处理函数
  const handleEdit = (record: Report) => {
    navigate(`/editor/${record.id}`)
  }

  const handleShare = (record: Report) => {
    // 复制分享链接到剪贴板
    const shareUrl = `${window.location.origin}/reports/${record.id}`
    navigator.clipboard.writeText(shareUrl).then(() => {
      message.success('分享链接已复制到剪贴板')
    }).catch(() => {
      message.error('复制失败，请手动复制链接')
    })
  }

  const handleDownload = (record: Report) => {
    try {
      // 创建报告内容
      const reportContent = `# ${record.title}

**创建时间**: ${new Date(record.created_at).toLocaleString()}
**状态**: ${record.status === 'draft' ? '草稿' : record.status === 'published' ? '已发布' : '已归档'}
**作者**: ${record.author || '系统用户'}

## 报告内容

${typeof record.content === 'string' ? record.content : JSON.stringify(record.content, null, 2)}

---
生成时间: ${new Date().toLocaleString()}`;
      
      // 创建下载链接
      const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${record.title.replace(/[^\w\s-]/g, '')}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      message.success(`报告「${record.title}」下载成功`);
    } catch (error) {
      console.error('下载报告失败:', error);
      message.error('下载失败，请重试');
    }
  };

  // 批量删除处理函数
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的报告');
      return;
    }

    const modalInstance = modal.confirm({
      title: '批量删除确认',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个报告吗？此操作不可恢复。`,
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger' as const,
      centered: true,
      maskClosable: false,
      zIndex: 9999,
      width: 400,
      onOk: async () => {
        try {
          console.log('🔄 开始批量删除，报告IDs:', selectedRowKeys);
          let successCount = 0;
          let failCount = 0;

          // 逐个删除报告
          for (const reportId of selectedRowKeys) {
            try {
              const response = await ReportService.deleteReport(reportId as string);
              if (response.success) {
                successCount++;
              } else {
                failCount++;
                console.error('删除报告失败:', reportId, response.error);
              }
            } catch (error) {
              failCount++;
              console.error('删除报告异常:', reportId, error);
            }
          }

          // 更新UI状态
          if (successCount > 0) {
            setReports(prevReports => 
              prevReports.filter(r => !selectedRowKeys.includes(r.id))
            );
            setSelectedRowKeys([]);
          }

          // 显示结果消息
          if (failCount === 0) {
            message.success(`成功删除 ${successCount} 个报告`);
          } else if (successCount === 0) {
            message.error(`删除失败，共 ${failCount} 个报告删除失败`);
          } else {
            message.warning(`删除完成：成功 ${successCount} 个，失败 ${failCount} 个`);
          }
        } catch (error) {
          console.error('批量删除异常:', error);
          message.error('批量删除失败，请检查网络连接');
        }
      }
    });
  };

  // 批量下载处理函数
  const handleBatchDownload = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要下载的报告');
      return;
    }

    try {
      const selectedReports = reports.filter(report => selectedRowKeys.includes(report.id));
      
      if (selectedReports.length === 1) {
        // 单个报告直接下载
        handleDownload(selectedReports[0]);
        return;
      }

      // 多个报告打包下载
      let zipContent = '';
      selectedReports.forEach((report, index) => {
        const reportContent = `# ${report.title}\n\n**创建时间**: ${new Date(report.created_at).toLocaleString()}\n**状态**: ${report.status === 'draft' ? '草稿' : report.status === 'published' ? '已发布' : '已归档'}\n**作者**: ${report.author || '系统用户'}\n\n## 报告内容\n\n${typeof report.content === 'string' ? report.content : JSON.stringify(report.content, null, 2)}\n\n---\n生成时间: ${new Date().toLocaleString()}`;
        
        zipContent += `=== 报告 ${index + 1}: ${report.title} ===\n\n${reportContent}\n\n${'='.repeat(80)}\n\n`;
      });

      // 创建合并文件下载
      const blob = new Blob([zipContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `批量报告_${selectedReports.length}个_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      message.success(`成功下载 ${selectedReports.length} 个报告`);
      setSelectedRowKeys([]); // 清除选中状态
    } catch (error) {
      console.error('批量下载失败:', error);
      message.error('批量下载失败，请重试');
    }
  };

  // 批量分享处理函数
  const handleBatchShare = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要分享的报告');
      return;
    }
    
    const shareUrls = selectedRowKeys.map(id => `${window.location.origin}/reports/${id}`);
    const shareText = shareUrls.join('\n');
    
    navigator.clipboard.writeText(shareText).then(() => {
      message.success(`已复制 ${selectedRowKeys.length} 个报告的分享链接到剪贴板`);
    }).catch(() => {
      message.error('复制失败，请手动复制链接');
    });
  };

  const handleDelete = async (record: Report) => {
    console.log('🗑️ handleDelete 被调用，报告ID:', record.id, '标题:', record.title)
    
    const modalInstance = modal.confirm({
      title: '确认删除',
      content: `确定要删除报告「${record.title}」吗？此操作不可恢复。`,
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger' as const,
      centered: true,
      maskClosable: false,
      zIndex: 9999,
      width: 400,
      className: 'delete-confirm-modal',
      getContainer: () => document.body,
      autoFocusButton: 'ok',
      onOk: async () => {
        console.log('🔄 用户确认删除，开始执行删除操作...')
        try {
          console.log('📡 调用 ReportService.deleteReport，ID:', record.id)
          const response = await ReportService.deleteReport(record.id)
          console.log('📥 删除API响应:', response)
          
          if (response.success) {
            console.log('✅ 删除成功，更新UI状态')
            message.success('报告删除成功')
            // 从列表中移除已删除的报告
            setReports(prevReports => {
              const newReports = prevReports.filter(r => r.id !== record.id)
              console.log('📋 更新报告列表，删除前:', prevReports.length, '删除后:', newReports.length)
              return newReports
            })
            // 清除选中状态
            setSelectedRowKeys(prevKeys => {
              const newKeys = prevKeys.filter(key => key !== record.id)
              console.log('🔑 更新选中状态，删除前:', prevKeys, '删除后:', newKeys)
              return newKeys
            })
          } else {
            console.error('❌ 删除失败:', response.error)
            message.error(`删除失败: ${response.error || '未知错误'}`)
          }
        } catch (error) {
          console.error('❌ 删除报告异常:', error)
          message.error('删除失败，请检查网络连接')
        }
      },
      onCancel: () => {
        console.log('❌ 用户取消删除操作')
      }
    })
    
    console.log('📋 Modal.confirm 已调用，modal实例:', modalInstance)
    
    // 调试：检查DOM中是否有Modal元素
    setTimeout(() => {
      const modalElements = document.querySelectorAll('.ant-modal, .ant-modal-confirm')
      console.log('🔍 DOM中的Modal元素数量:', modalElements.length)
      modalElements.forEach((el, index) => {
        console.log(`📋 Modal元素 ${index}:`, el, '可见性:', window.getComputedStyle(el).display)
      })
      
      const maskElements = document.querySelectorAll('.ant-modal-mask')
      console.log('🎭 DOM中的Mask元素数量:', maskElements.length)
      maskElements.forEach((el, index) => {
        console.log(`🎭 Mask元素 ${index}:`, el, '可见性:', window.getComputedStyle(el).display)
      })
    }, 100)
  }



  const [reports, setReports] = useState<Report[]>([])

  // 获取报告数据
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        const response = await ReportService.getReports(1, 50) // 获取前50条报告
        
        if (response.success && response.data) {
          // 将数据库报告转换为UI需要的格式
          const formattedReports: Report[] = response.data.map((report: any) => {
            // 从content字段提取描述信息
            let description = '暂无描述';
            if (report.content) {
              if (typeof report.content === 'string') {
                // 如果content是字符串，取前100个字符作为描述
                description = report.content.substring(0, 100) + (report.content.length > 100 ? '...' : '');
              } else if (typeof report.content === 'object') {
                // 如果content是对象，优先使用text字段
                const text = report.content.text || report.content.summary || '';
                description = text.substring(0, 100) + (text.length > 100 ? '...' : '');
              }
            }
            
            return {
              ...report,
              author: '系统用户', // 默认作者
              authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
              category: report.type === 'ai-analysis' ? 'AI分析报告' : '智能报告', // 根据类型设置分类
              progress: 100, // 已保存的报告默认为完成状态
              size: '未知大小',
              description: description
            };
          })
          
          setReports(formattedReports)
          console.log('✅ 成功从Supabase获取报告:', formattedReports.length, '条')
        } else {
          // API调用失败，显示空列表
          setReports([])
          if (response.error) {
            message.error(`获取报告数据失败: ${response.error}`)
          } else {
            message.info('暂无报告数据')
          }
        }
      } catch (error) {
        console.error('获取报告失败:', error)
        setReports([])
        message.error('获取报告数据失败，请检查网络连接')
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])







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
              {record.description || '暂无描述'}
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
      dataIndex: 'updated_at',
      key: 'updated_at',
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
                         (report.description?.toLowerCase().includes(searchText.toLowerCase()) ?? false)
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter
    
    let matchesDate = true
    if (dateRange && dateRange.length === 2) {
      const reportDate = dayjs(report.updated_at)
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
                          {report.description || '暂无描述'}
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
                            <span>{dayjs(report.updated_at).format('MM-DD HH:mm')}</span>
                          </div>
                          <span style={{ fontWeight: '500' }}>{report.size}</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                          {report.tags?.slice(0, 2).map((tag: string) => (
                            <Tag key={tag} style={{ fontSize: '10px', margin: 0, padding: '1px 4px', height: 'auto', lineHeight: '1.2' }}>{tag}</Tag>
                          ))}
                          {report.tags && report.tags.length > 2 && (
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
                <Button size="small" onClick={handleBatchShare}>批量分享</Button>
                <Button size="small" onClick={handleBatchDownload}>批量下载</Button>
                <Button size="small" danger onClick={handleBatchDelete}>批量删除</Button>
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