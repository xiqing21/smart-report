import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Typography,
  Tabs,
  Rate,
  Avatar,
  Tooltip,
  Modal,

  Badge,
  Empty,
  Pagination
} from 'antd';
import {
  EyeOutlined,
  DownloadOutlined,
  HeartOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  TableOutlined,
  BulbOutlined,
  TrophyOutlined,
  FireOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { EnhancedButton, InteractiveCard, StatusTag, LikeButton, BookmarkButton, Rating } from '../components/InteractiveEnhancements';
import { AnimatedList } from '../components/AdvancedAnimations';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  authorAvatar?: string;
  rating: number;
  downloads: number;
  likes: number;
  isLiked: boolean;
  isFavorite: boolean;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  isPremium: boolean;
  isNew: boolean;
  isHot: boolean;
  previewImages: string[];
}

const Templates: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);

  // 模拟模板数据
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      title: '年度业务分析报告',
      description: '专业的年度业务分析报告模板，包含完整的数据分析框架和可视化图表，适用于企业年终总结和业务回顾。',
      category: 'business',
      tags: ['年度报告', '业务分析', '数据可视化'],
      author: '张专家',
      authorAvatar: '',
      rating: 4.8,
      downloads: 1250,
      likes: 89,
      isLiked: false,
      isFavorite: true,
      thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20business%20annual%20report%20template%20with%20charts%20and%20graphs%2C%20modern%20corporate%20design%2C%20blue%20and%20white%20color%20scheme&image_size=landscape_4_3',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      isPremium: true,
      isNew: false,
      isHot: true,
      previewImages: []
    },
    {
      id: '2',
      title: '市场调研报告模板',
      description: '全面的市场调研报告模板，涵盖市场分析、竞争对手分析、消费者洞察等关键内容。',
      category: 'research',
      tags: ['市场调研', '竞争分析', '消费者洞察'],
      author: '李分析师',
      authorAvatar: '',
      rating: 4.6,
      downloads: 890,
      likes: 67,
      isLiked: true,
      isFavorite: false,
      thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=market%20research%20report%20template%20with%20survey%20data%20charts%2C%20consumer%20analysis%20graphs%2C%20professional%20layout&image_size=landscape_4_3',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18',
      isPremium: false,
      isNew: true,
      isHot: false,
      previewImages: []
    },
    {
      id: '3',
      title: '财务分析报告',
      description: '专业的财务分析报告模板，包含财务指标分析、趋势预测、风险评估等核心内容。',
      category: 'finance',
      tags: ['财务分析', '指标分析', '风险评估'],
      author: '王财务',
      authorAvatar: '',
      rating: 4.9,
      downloads: 1580,
      likes: 125,
      isLiked: false,
      isFavorite: false,
      thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=financial%20analysis%20report%20template%20with%20charts%20and%20financial%20data%2C%20professional%20accounting%20design&image_size=landscape_4_3',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-22',
      isPremium: true,
      isNew: false,
      isHot: true,
      previewImages: []
    },
    {
      id: '4',
      title: '项目进度报告',
      description: '项目管理专用的进度报告模板，清晰展示项目里程碑、任务完成情况和资源使用状态。',
      category: 'project',
      tags: ['项目管理', '进度跟踪', '里程碑'],
      author: '赵项目经理',
      authorAvatar: '',
      rating: 4.5,
      downloads: 720,
      likes: 54,
      isLiked: false,
      isFavorite: true,
      thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=project%20progress%20report%20template%20with%20gantt%20charts%20and%20milestone%20tracking%2C%20modern%20project%20management%20design&image_size=landscape_4_3',
      createdAt: '2024-01-12',
      updatedAt: '2024-01-19',
      isPremium: false,
      isNew: true,
      isHot: false,
      previewImages: []
    },
    {
      id: '5',
      title: '销售业绩报告',
      description: '销售团队专用的业绩报告模板，包含销售数据分析、目标达成情况、客户分析等。',
      category: 'sales',
      tags: ['销售分析', '业绩跟踪', '客户分析'],
      author: '孙销售总监',
      authorAvatar: '',
      rating: 4.7,
      downloads: 950,
      likes: 78,
      isLiked: true,
      isFavorite: false,
      thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=sales%20performance%20report%20template%20with%20revenue%20charts%20and%20customer%20analytics%2C%20professional%20sales%20dashboard&image_size=landscape_4_3',
      createdAt: '2024-01-08',
      updatedAt: '2024-01-21',
      isPremium: false,
      isNew: false,
      isHot: true,
      previewImages: []
    }
  ]);

  // 分类选项
  const categories = [
    { label: '全部模板', value: 'all', icon: <FileTextOutlined /> },
    { label: '商业分析', value: 'business', icon: <BarChartOutlined /> },
    { label: '市场调研', value: 'research', icon: <PieChartOutlined /> },
    { label: '财务报告', value: 'finance', icon: <LineChartOutlined /> },
    { label: '项目管理', value: 'project', icon: <TableOutlined /> },
    { label: '销售分析', value: 'sales', icon: <TrophyOutlined /> }
  ];

  // 排序选项
  const sortOptions = [
    { label: '最受欢迎', value: 'popular' },
    { label: '最新发布', value: 'newest' },
    { label: '下载最多', value: 'downloads' },
    { label: '评分最高', value: 'rating' }
  ];

  // 筛选模板
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchText.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 排序模板
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'downloads':
        return b.downloads - a.downloads;
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
      default:
        return (b.likes + b.downloads * 0.1) - (a.likes + a.downloads * 0.1);
    }
  });

  // 分页数据
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTemplates = sortedTemplates.slice(startIndex, startIndex + pageSize);

  // 切换喜欢状态
  const toggleLike = (templateId: string) => {
    setTemplates(prev => prev.map(template => {
      if (template.id === templateId) {
        return {
          ...template,
          isLiked: !template.isLiked,
          likes: template.isLiked ? template.likes - 1 : template.likes + 1
        };
      }
      return template;
    }));
  };

  // 切换收藏状态
  const toggleFavorite = (templateId: string) => {
    setTemplates(prev => prev.map(template => {
      if (template.id === templateId) {
        return { ...template, isFavorite: !template.isFavorite };
      }
      return template;
    }));
  };

  // 使用模板
  const useTemplate = (template: Template) => {
    navigate(`/editor?template=${template.id}`);
  };

  // 预览模板
  const previewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setPreviewVisible(true);
  };

  // 模板卡片组件
  const TemplateCard: React.FC<{ template: Template; index: number }> = ({ template, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
    >
      <Card
        hoverable
        className="template-card"
        cover={
          <div className="template-cover" style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
            <img
              src={template.thumbnail}
              alt={template.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* 标签覆盖层 */}
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap'
            }}>
              {template.isPremium && (
                <Tag color="gold" style={{ margin: 0 }}>
                  <TrophyOutlined style={{ marginRight: '4px' }} />高级
                </Tag>
              )}
              {template.isNew && (
                <Tag color="green" style={{ margin: 0 }}>
                  <BulbOutlined style={{ marginRight: '4px' }} />新品
                </Tag>
              )}
              {template.isHot && (
                <Tag color="red" style={{ margin: 0 }}>
                  <FireOutlined style={{ marginRight: '4px' }} />热门
                </Tag>
              )}
            </div>
            {/* 操作按钮覆盖层 */}
            <div className="template-actions" style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0,
              transition: 'opacity 0.3s ease'
            }}>
              <Space>
                <Tooltip title="预览模板">
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<EyeOutlined />}
                    onClick={() => previewTemplate(template)}
                  />
                </Tooltip>
                <Tooltip title="使用模板">
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<DownloadOutlined />}
                    onClick={() => useTemplate(template)}
                  />
                </Tooltip>
              </Space>
            </div>
          </div>
        }
        actions={[
          <LikeButton key="like" initialLiked={template.isLiked} likeCount={template.likes} onLike={() => toggleLike(template.id)} />,
          <BookmarkButton key="bookmark" initialBookmarked={template.isFavorite} onBookmark={() => toggleFavorite(template.id)} />,
          <span key="downloads">
            <DownloadOutlined style={{ marginRight: '4px' }} />
            {template.downloads}
          </span>
        ]}
      >
        <Card.Meta
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{template.title}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <StatusTag 
                  status={template.isPremium ? 'premium' : template.isHot ? 'hot' : template.isNew ? 'new' : 'completed'}
                  animated
                />
                <Rate disabled defaultValue={template.rating} style={{ fontSize: '12px' }} />
              </div>
            </div>
          }
          description={
            <div>
              <Paragraph
                ellipsis={{ rows: 2, expandable: false }}
                style={{ marginBottom: '12px', color: '#666' }}
              >
                {template.description}
              </Paragraph>
              <div style={{ marginBottom: '8px' }}>
                {template.tags.map(tag => (
                  <Tag key={tag} style={{ marginBottom: '4px' }}>
                    {tag}
                  </Tag>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size="small">
                  <Avatar size="small" icon={<UserOutlined />} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>{template.author}</Text>
                </Space>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Rating value={template.rating} readonly size="small" />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    <CalendarOutlined style={{ marginRight: '4px' }} />
                    {template.updatedAt}
                  </Text>
                </div>
              </div>
            </div>
          }
        />
      </Card>
    </motion.div>
  );

  return (
    <div className="templates-page" style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: '24px' }}
      >
        <div className="template-header">
          <div className="template-title">
            <Title level={2} style={{ marginBottom: '8px' }}>
              <FileTextOutlined style={{ marginRight: '12px', color: 'var(--primary-color)' }} />
              模板中心
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              精选专业报告模板，快速创建高质量报告
            </Text>
          </div>
          <EnhancedButton 
            type="primary" 
            size="large" 
            icon={<FileTextOutlined />}
            onClick={() => navigate('/reports/new')}
            variant="gradient"
          >
            创建自定义模板
          </EnhancedButton>
        </div>
      </motion.div>

      {/* 搜索和筛选栏 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        style={{
          background: '#ffffff',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          marginBottom: '24px'
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索模板名称、描述或标签"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
              size="large"
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              style={{ width: '100%' }}
              size="large"
              placeholder="选择分类"
            >
              {categories.map(category => (
                <Select.Option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              value={sortBy}
              onChange={setSortBy}
              style={{ width: '100%' }}
              size="large"
              placeholder="排序方式"
            >
              {sortOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button
                type={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
              >
                网格视图
              </Button>
              <Button
                type={viewMode === 'list' ? 'primary' : 'default'}
                onClick={() => setViewMode('list')}
              >
                列表视图
              </Button>
            </div>
          </Col>
        </Row>
      </motion.div>

      {/* 分类标签栏 */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        style={{ marginBottom: '24px' }}
      >
        <Tabs
          activeKey={selectedCategory}
          onChange={setSelectedCategory}
          size="large"
          type="card"
        >
          {categories.map(category => (
            <TabPane
              tab={
                <span>
                  {category.icon}
                  <span style={{ marginLeft: '8px' }}>{category.label}</span>
                  <Badge
                    count={category.value === 'all' ? templates.length : templates.filter(t => t.category === category.value).length}
                    style={{ marginLeft: '8px' }}
                    showZero
                  />
                </span>
              }
              key={category.value}
            />
          ))}
        </Tabs>
      </motion.div>

      {/* 模板网格 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        {paginatedTemplates.length > 0 ? (
          <>
            <AnimatedList
              dataSource={paginatedTemplates}
              staggerDelay={0.1}
              animationType="fade"
              renderItem={(template, index) => (
                <Col 
                xs={24} 
                sm={viewMode === 'list' ? 24 : 12} 
                md={viewMode === 'list' ? 24 : 8} 
                lg={viewMode === 'list' ? 24 : 6} 
                xl={viewMode === 'list' ? 24 : 4} 
                xxl={viewMode === 'list' ? 24 : 3} 
                key={template.id}
              >
                  <InteractiveCard
                  className={`${viewMode === 'list' ? 'w-full' : 'h-full'} hover:shadow-lg transition-shadow duration-300 cursor-pointer`}
                  effect="glow"
                  hoverable
                >
                  {viewMode === 'list' ? (
                    <Card
                      bodyStyle={{ padding: '16px' }}
                      className="w-full"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ 
                          width: '80px', 
                          height: '80px', 
                          background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          position: 'relative'
                        }}>
                          <img
                            src={template.thumbnail}
                            alt={template.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                          />
                          {template.isPremium && (
                            <Tag 
                             color="gold" 
                             style={{ position: 'absolute', top: '4px', right: '4px', fontSize: '10px' }}
                           >
                             高级
                           </Tag>
                          )}
                        </div>
                        
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <h3 
                              style={{ 
                                fontSize: '16px', 
                                fontWeight: '600', 
                                margin: 0, 
                                color: '#262626',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '60%'
                              }}
                              onClick={() => previewTemplate(template)}
                              title={template.title}
                            >
                              {template.title}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                              <Space size="small">
                                <Tooltip title="预览">
                                  <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => previewTemplate(template)} />
                                </Tooltip>
                                <Tooltip title="使用模板">
                                  <Button type="primary" size="small" icon={<DownloadOutlined />} onClick={() => useTemplate(template)} />
                                </Tooltip>
                                <LikeButton initialLiked={template.isLiked} likeCount={template.likes} onLike={() => toggleLike(template.id)} />
                                <BookmarkButton initialBookmarked={template.isFavorite} onBookmark={() => toggleFavorite(template.id)} />
                              </Space>
                            </div>
                          </div>
                          
                          <p style={{ 
                            color: '#666', 
                            fontSize: '14px', 
                            margin: '0 0 12px 0',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: '20px',
                            height: '40px'
                          }}>
                            {template.description}
                          </p>
                          
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Avatar size={20} icon={<UserOutlined />} />
                                <span style={{ fontSize: '13px', color: '#666' }}>{template.author}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#999' }}>
                                <DownloadOutlined style={{ fontSize: '12px' }} />
                                <span style={{ fontSize: '12px' }}>{template.downloads}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#999' }}>
                                <CalendarOutlined style={{ fontSize: '12px' }} />
                                <span style={{ fontSize: '12px' }}>{template.updatedAt}</span>
                              </div>
                              <Rate disabled value={template.rating} style={{ fontSize: '12px' }} />
                            </div>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                               {template.tags.slice(0, 3).map((tag: string) => (
                                 <Tag key={tag} style={{ fontSize: '11px', margin: 0 }}>{tag}</Tag>
                               ))}
                               {template.tags.length > 3 && (
                                 <Tag style={{ fontSize: '11px', margin: 0 }}>+{template.tags.length - 3}</Tag>
                               )}
                             </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <TemplateCard template={template} index={index} />
                  )}
                </InteractiveCard>
                </Col>
              )}
            />
            
            {/* 分页 */}
            {sortedTemplates.length > pageSize && (
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={sortedTemplates.length}
                  onChange={setCurrentPage}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total, range) => `第 ${range[0]}-${range[1]} 项，共 ${total} 项`}
                />
              </div>
            )}
          </>
        ) : (
          <Empty
            description="暂无匹配的模板"
            style={{ margin: '60px 0' }}
          >
            <Button type="primary" onClick={() => {
              setSearchText('');
              setSelectedCategory('all');
            }}>
              重置筛选条件
            </Button>
          </Empty>
        )}
      </motion.div>

      {/* 模板预览模态框 */}
      <Modal
        title={selectedTemplate?.title}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={900}
        footer={[
          <Button key="cancel" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>,
          <Button
            key="use"
            type="primary"
            onClick={() => {
              if (selectedTemplate) {
                useTemplate(selectedTemplate);
              }
            }}
          >
            使用此模板
          </Button>
        ]}
      >
        {selectedTemplate && (
          <div>
            <Row gutter={[24, 24]}>
              <Col span={16}>
                <img
                  src={selectedTemplate.thumbnail}
                  alt={selectedTemplate.title}
                  style={{ width: '100%', borderRadius: '8px' }}
                />
              </Col>
              <Col span={8}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Text strong>模板描述</Text>
                    <Paragraph style={{ marginTop: '8px' }}>
                      {selectedTemplate.description}
                    </Paragraph>
                  </div>
                  
                  <div>
                    <Text strong>标签</Text>
                    <div style={{ marginTop: '8px' }}>
                      {selectedTemplate.tags.map(tag => (
                        <Tag key={tag} style={{ marginBottom: '4px' }}>
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Text strong>作者信息</Text>
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar size="small" icon={<UserOutlined />} />
                      <span>{selectedTemplate.author}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Text strong>模板统计</Text>
                    <div style={{ marginTop: '8px' }}>
                      <Space direction="vertical" size="small">
                        <div>
                          <Rate disabled value={selectedTemplate.rating} style={{ fontSize: '14px' }} />
                          <span style={{ marginLeft: '8px' }}>{selectedTemplate.rating}</span>
                        </div>
                        <div>
                          <DownloadOutlined style={{ marginRight: '8px' }} />
                          下载 {selectedTemplate.downloads} 次
                        </div>
                        <div>
                          <HeartOutlined style={{ marginRight: '8px' }} />
                          {selectedTemplate.likes} 人喜欢
                        </div>
                      </Space>
                    </div>
                  </div>
                  
                  <div>
                    <Text strong>更新时间</Text>
                    <div style={{ marginTop: '8px' }}>
                      <ClockCircleOutlined style={{ marginRight: '8px' }} />
                      {selectedTemplate.updatedAt}
                    </div>
                  </div>
                </Space>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      <style>{`
        .template-card:hover .template-actions {
          opacity: 1 !important;
        }
        
        .template-card .ant-card-cover {
          border-radius: 8px 8px 0 0;
        }
        
        .template-cover {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        
        .templates-page .ant-tabs-card > .ant-tabs-content {
          margin-top: 0;
        }
        
        .templates-page .ant-tabs-card > .ant-tabs-content > .ant-tabs-tabpane {
          background: transparent;
          border: none;
        }
        
        @media (max-width: 768px) {
          .templates-page {
            padding: 16px;
          }
          
          .template-actions {
            opacity: 1 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Templates;