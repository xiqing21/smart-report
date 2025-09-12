import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Input,
  Select,
  Tag,
  Modal,
  Upload,
  Form,
  message,
  Tabs,
  Space,
  Tooltip,
  Avatar,
  Typography,
  Divider,
  Empty
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  EyeOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  UploadOutlined,
  FileTextOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { templateService } from '../services/templateService';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'html';
  thumbnail: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  downloads: number;
  rating: number;
  tags: string[];
  isFavorite: boolean;
  isPublic: boolean;
  template: string; // Handlebars template content
  sampleData?: any;
}

interface TemplateLibraryProps {
  onSelectTemplate: (template: Template) => void;
  onPreviewTemplate: (template: Template) => void;
  onCreateTemplate?: () => void;
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  onSelectTemplate,
  onPreviewTemplate,
  onCreateTemplate
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('public');
  const [categories, setCategories] = useState<string[]>([]);
  const [form] = Form.useForm();

  // 模拟模板数据
  const mockTemplates: Template[] = [
    {
      id: '1',
      name: '财务分析报告模板',
      description: '专业的财务分析报告模板，包含收入分析、成本控制、盈利能力等关键指标',
      category: '财务报告',
      industry: '金融',
      type: 'pdf',
      thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20financial%20report%20template%20with%20charts%20and%20graphs&image_size=landscape_4_3',
      author: '系统管理员',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      downloads: 1250,
      rating: 4.8,
      tags: ['财务', '分析', '专业'],
      isFavorite: true,
      isPublic: true,
      template: `
        <div class="financial-report">
          <h1>{{title}}</h1>
          <div class="summary">{{summary}}</div>
          {{#each metrics}}
          <div class="metric">
            <h3>{{name}}</h3>
            <span class="value">{{value}}</span>
          </div>
          {{/each}}
        </div>
      `,
      sampleData: {
        title: '2024年第一季度财务分析报告',
        summary: '本季度营收增长15%，净利润率提升2.3%',
        metrics: [
          { name: '营业收入', value: '¥1,250万' },
          { name: '净利润', value: '¥180万' },
          { name: '毛利率', value: '35.2%' }
        ]
      }
    },
    {
      id: '2',
      name: '市场调研报告模板',
      description: '全面的市场调研报告模板，涵盖市场规模、竞争分析、消费者洞察等内容',
      category: '市场分析',
      industry: '市场营销',
      type: 'docx',
      thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=market%20research%20report%20template%20with%20data%20visualization&image_size=landscape_4_3',
      author: '市场部',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18',
      downloads: 890,
      rating: 4.6,
      tags: ['市场', '调研', '分析'],
      isFavorite: false,
      isPublic: true,
      template: `
        <div class="market-report">
          <h1>{{title}}</h1>
          <section class="executive-summary">
            <h2>执行摘要</h2>
            <p>{{executiveSummary}}</p>
          </section>
          <section class="market-size">
            <h2>市场规模</h2>
            <p>市场总规模：{{marketSize}}</p>
          </section>
        </div>
      `
    },
    {
      id: '3',
      name: '项目进度报告模板',
      description: '项目管理专用进度报告模板，包含里程碑、风险评估、资源分配等',
      category: '项目管理',
      industry: '项目管理',
      type: 'pptx',
      thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=project%20progress%20report%20template%20with%20timeline%20and%20milestones&image_size=landscape_4_3',
      author: '项目部',
      createdAt: '2024-01-12',
      updatedAt: '2024-01-22',
      downloads: 650,
      rating: 4.7,
      tags: ['项目', '进度', '管理'],
      isFavorite: true,
      isPublic: true,
      template: `
        <div class="project-report">
          <h1>{{projectName}} - 进度报告</h1>
          <div class="progress-overview">
            <h2>项目概览</h2>
            <p>完成度：{{completionRate}}%</p>
          </div>
        </div>
      `
    }
  ];

  const categories = ['all', '财务报告', '市场分析', '项目管理', '运营分析', '人力资源'];
  const industries = ['all', '金融', '市场营销', '项目管理', '制造业', '零售业', '科技'];
  const types = ['all', 'pdf', 'docx', 'xlsx', 'pptx', 'html'];

  useEffect(() => {
    loadTemplates();
    loadCategories();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchText, selectedCategory, selectedIndustry, selectedType, activeTab]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      let templateData: Template[];
      
      if (activeTab === 'favorites') {
        templateData = await templateService.getFavoriteTemplates();
      } else if (activeTab === 'my') {
        templateData = mockTemplates.filter(t => t.author === '当前用户');
      } else {
        templateData = mockTemplates;
      }
      
      setTemplates(templateData);
    } catch (error) {
      message.error('加载模板失败');
      console.error('Load templates error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadCategories = async () => {
    try {
      const categoryList = categories.filter(c => c !== 'all');
      setCategories(categoryList);
    } catch (error) {
      console.error('Load categories error:', error);
    }
  };

  const filterTemplates = () => {
    let filtered = templates.filter(template => {
      if (activeTab === 'favorites' && !template.isFavorite) return false;
      if (activeTab === 'my' && template.author !== '当前用户') return false;
      if (activeTab === 'public' && !template.isPublic) return false;
      
      return (
        (searchText === '' || 
         template.name.toLowerCase().includes(searchText.toLowerCase()) ||
         template.description.toLowerCase().includes(searchText.toLowerCase()) ||
         template.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
        ) &&
        (selectedCategory === 'all' || template.category === selectedCategory) &&
        (selectedIndustry === 'all' || template.industry === selectedIndustry) &&
        (selectedType === 'all' || template.type === selectedType)
      );
    });
    
    setFilteredTemplates(filtered);
  };

  const handleToggleFavorite = async (templateId: string) => {
    try {
      const template = templates.find(t => t.id === templateId);
      const newFavoriteStatus = !template?.isFavorite;
      
      setTemplates(prev => prev.map(template => 
        template.id === templateId 
          ? { ...template, isFavorite: newFavoriteStatus }
          : template
      ));
      
      message.success(newFavoriteStatus ? '已添加到收藏' : '已取消收藏');
    } catch (error) {
      message.error('操作失败');
      console.error('Toggle favorite error:', error);
    }
  };

  const handleCreateTemplate = async (values: any) => {
    try {
      // 模拟创建模板
      const newTemplate: Template = {
        id: Date.now().toString(),
        name: values.name,
        description: values.description,
        category: values.category,
        industry: values.industry,
        type: values.type,
        thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=custom%20report%20template&image_size=landscape_4_3',
        author: '当前用户',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        downloads: 0,
        rating: 0,
        tags: values.tags || [],
        isFavorite: false,
        isPublic: values.isPublic || false,
        template: values.template || '<div>{{title}}</div>'
      };
      
      setTemplates(prev => [newTemplate, ...prev]);
      setIsCreateModalVisible(false);
      form.resetFields();
      message.success('模板创建成功');
    } catch (error) {
      message.error('创建模板失败');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileTextOutlined />;
      case 'docx': return <FileTextOutlined />;
      case 'xlsx': return <BarChartOutlined />;
      case 'pptx': return <PieChartOutlined />;
      case 'html': return <LineChartOutlined />;
      default: return <FileTextOutlined />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pdf': return '#ff4d4f';
      case 'docx': return '#1890ff';
      case 'xlsx': return '#52c41a';
      case 'pptx': return '#fa8c16';
      case 'html': return '#722ed1';
      default: return '#666666';
    }
  };

  return (
    <div className="template-library">
      <div className="mb-6">
        <Title level={3}>模板库</Title>
        <Text type="secondary">选择或创建适合您需求的报告模板</Text>
      </div>

      {/* 搜索和筛选 */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索模板名称、描述或标签"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              style={{ width: '100%' }}
              placeholder="选择分类"
            >
              {categories.map(category => (
                <Option key={category} value={category}>
                  {category === 'all' ? '全部分类' : category}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={selectedIndustry}
              onChange={setSelectedIndustry}
              style={{ width: '100%' }}
              placeholder="选择行业"
            >
              {industries.map(industry => (
                <Option key={industry} value={industry}>
                  {industry === 'all' ? '全部行业' : industry}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={selectedType}
              onChange={setSelectedType}
              style={{ width: '100%' }}
              placeholder="选择格式"
            >
              {types.map(type => (
                <Option key={type} value={type}>
                  {type === 'all' ? '全部格式' : type.toUpperCase()}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            {onCreateTemplate ? (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onCreateTemplate}
                style={{ width: '100%' }}
              >
                创建模板
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateModalVisible(true)}
                style={{ width: '100%' }}
              >
                创建模板
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      {/* 模板标签页 */}
      <Tabs activeKey={activeTab} onChange={(key) => {
        setActiveTab(key);
        loadTemplates();
      }} className="mb-6">
        <TabPane tab="公共模板" key="public" />
        <TabPane tab="我的收藏" key="favorites" />
        <TabPane tab="我的模板" key="my" />
      </Tabs>

      {/* 模板网格 */}
      {filteredTemplates.length === 0 ? (
        <Empty
          description="暂无符合条件的模板"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredTemplates.map(template => (
            <Col xs={24} sm={12} md={8} lg={6} key={template.id}>
              <Card
                hoverable
                cover={
                  <div className="relative">
                    <img
                      alt={template.name}
                      src={template.thumbnail}
                      style={{ height: 160, objectFit: 'cover' }}
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        type="text"
                        icon={template.isFavorite ? <StarFilled /> : <StarOutlined />}
                        onClick={() => handleToggleFavorite(template.id)}
                        style={{ 
                          color: template.isFavorite ? '#faad14' : '#ffffff',
                          backgroundColor: 'rgba(0,0,0,0.5)'
                        }}
                      />
                    </div>
                    <div className="absolute top-2 left-2">
                      <Tag 
                        color={getTypeColor(template.type)}
                        icon={getTypeIcon(template.type)}
                      >
                        {template.type.toUpperCase()}
                      </Tag>
                    </div>
                  </div>
                }
                actions={[
                  <Tooltip title="预览">
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => onPreviewTemplate(template)}
                    />
                  </Tooltip>,
                  <Tooltip title="使用模板">
                    <Button
                      type="text"
                      icon={<DownloadOutlined />}
                      onClick={() => {
                        onSelectTemplate(template);
                        setTemplates(prev => prev.map(t => 
                          t.id === template.id 
                            ? { ...t, downloads: t.downloads + 1 }
                            : t
                        ));
                      }}
                    />
                  </Tooltip>,
                  <Tooltip title="编辑">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      disabled={template.author !== '当前用户'}
                    />
                  </Tooltip>
                ]}
              >
                <Card.Meta
                  title={
                    <div className="flex justify-between items-start">
                      <span className="truncate">{template.name}</span>
                    </div>
                  }
                  description={
                    <div>
                      <Text type="secondary" className="text-sm line-clamp-2">
                        {template.description}
                      </Text>
                      <div className="mt-2">
                        <Tag color="blue">{template.category}</Tag>
                        <Tag color="green">{template.industry}</Tag>
                      </div>
                      <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                        <span>下载 {template.downloads}</span>
                        <span>评分 {template.rating}</span>
                      </div>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <Avatar size={16} className="mr-1" />
                        <span>{template.author}</span>
                        <span className="ml-2">{template.updatedAt}</span>
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* 创建模板弹窗 */}
      <Modal
        title="创建新模板"
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTemplate}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="模板名称"
                rules={[{ required: true, message: '请输入模板名称' }]}
              >
                <Input placeholder="输入模板名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="导出格式"
                rules={[{ required: true, message: '请选择导出格式' }]}
              >
                <Select placeholder="选择导出格式">
                  <Option value="pdf">PDF</Option>
                  <Option value="docx">Word</Option>
                  <Option value="xlsx">Excel</Option>
                  <Option value="pptx">PowerPoint</Option>
                  <Option value="html">HTML</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="模板分类"
                rules={[{ required: true, message: '请选择模板分类' }]}
              >
                <Select placeholder="选择模板分类">
                  {categories.filter(c => c !== 'all').map(category => (
                    <Option key={category} value={category}>{category}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="industry"
                label="适用行业"
                rules={[{ required: true, message: '请选择适用行业' }]}
              >
                <Select placeholder="选择适用行业">
                  {industries.filter(i => i !== 'all').map(industry => (
                    <Option key={industry} value={industry}>{industry}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="模板描述"
            rules={[{ required: true, message: '请输入模板描述' }]}
          >
            <Input.TextArea rows={3} placeholder="描述模板的用途和特点" />
          </Form.Item>

          <Form.Item
            name="template"
            label="模板内容 (Handlebars)"
            rules={[{ required: true, message: '请输入模板内容' }]}
          >
            <Input.TextArea 
              rows={8} 
              placeholder="输入Handlebars模板代码，例如：<h1>{{title}}</h1>" 
            />
          </Form.Item>

          <Form.Item name="tags" label="标签">
            <Select
              mode="tags"
              placeholder="添加标签"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setIsCreateModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                创建模板
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TemplateLibrary;