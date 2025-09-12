import React, { useState, useEffect } from 'react';
import {
  Modal,
  Card,
  Row,
  Col,
  Button,
  Tag,
  Rate,
  Avatar,
  Typography,
  Divider,
  Tabs,
  Spin,
  message,
  Space,
  Tooltip,
  Image
} from 'antd';
import {
  DownloadOutlined,
  StarOutlined,
  StarFilled,
  EyeOutlined,
  UserOutlined,
  CalendarOutlined,
  DownloadOutlined as DownloadIcon,
  LikeOutlined,
  ShareAltOutlined,
  CodeOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { Template } from './TemplateLibrary';
import { templateService } from '../services/templateService';
import Handlebars from 'handlebars';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface TemplatePreviewProps {
  template: Template | null;
  visible: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
  onToggleFavorite: (templateId: string) => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  visible,
  onClose,
  onSelectTemplate,
  onToggleFavorite
}) => {
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (template && visible) {
      setIsFavorite(template.isFavorite);
      generatePreview();
    }
  }, [template, visible]);

  const generatePreview = async () => {
    if (!template) return;
    
    setLoading(true);
    try {
      // 编译Handlebars模板
      const compiledTemplate = Handlebars.compile(template.template);
      
      // 使用示例数据或默认数据生成预览
      const sampleData = template.sampleData || {
        title: '示例报告标题',
        summary: '这是一个示例摘要，展示模板的基本结构和样式。',
        metrics: [
          { name: '指标1', value: '100' },
          { name: '指标2', value: '85%' },
          { name: '指标3', value: '¥1,000' }
        ],
        charts: [
          {
            title: '示例图表',
            data: [
              { month: '1月', revenue: 1000 },
              { month: '2月', revenue: 1200 },
              { month: '3月', revenue: 1100 }
            ]
          }
        ]
      };
      
      const html = compiledTemplate(sampleData);
      
      // 添加基础样式
      const styledHtml = `
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .financial-report, .market-report, .project-report {
            background: #fff;
            border-radius: 8px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          h1 {
            color: #1890ff;
            border-bottom: 2px solid #1890ff;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          h2 {
            color: #595959;
            margin-top: 30px;
            margin-bottom: 15px;
          }
          h3 {
            color: #722ed1;
            margin-bottom: 10px;
          }
          .summary {
            background: #f6ffed;
            border: 1px solid #b7eb8f;
            border-radius: 6px;
            padding: 16px;
            margin: 20px 0;
          }
          .metric {
            display: inline-block;
            background: #fafafa;
            border: 1px solid #d9d9d9;
            border-radius: 6px;
            padding: 16px;
            margin: 8px;
            text-align: center;
            min-width: 120px;
          }
          .metric h3 {
            margin: 0 0 8px 0;
            font-size: 14px;
            color: #666;
          }
          .metric .value {
            font-size: 24px;
            font-weight: bold;
            color: #1890ff;
          }
          .executive-summary, .market-size {
            margin: 20px 0;
          }
          .progress-overview {
            background: #e6f7ff;
            border: 1px solid #91d5ff;
            border-radius: 6px;
            padding: 16px;
            margin: 20px 0;
          }
        </style>
        ${html}
      `;
      
      setPreviewHtml(styledHtml);
    } catch (error) {
      console.error('生成预览失败:', error);
      message.error('生成预览失败');
      setPreviewHtml('<p>预览生成失败，请检查模板格式</p>');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async () => {
    if (!template) return;
    
    try {
      await templateService.incrementDownloads(template.id);
      onSelectTemplate(template);
      onClose();
      message.success(`已选择模板: ${template.name}`);
    } catch (error) {
      console.error('Select template error:', error);
      onSelectTemplate(template);
      onClose();
      message.success(`已选择模板: ${template.name}`);
    }
  };

  // 处理分享
  const handleShare = async () => {
    if (!template) return;
    
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/template/${template.id}`);
      message.success('模板链接已复制到剪贴板');
    } catch (error) {
      message.error('分享失败');
      console.error('Share error:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!template) return;
    
    try {
      const newFavoriteStatus = await templateService.toggleFavorite(template.id);
      setIsFavorite(newFavoriteStatus);
      onToggleFavorite(template.id);
      message.success(newFavoriteStatus ? '已添加到收藏' : '已取消收藏');
    } catch (error) {
      message.error('操作失败');
      console.error('Toggle favorite error:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileTextOutlined />;
      case 'docx': return <FileTextOutlined />;
      case 'xlsx': return <FileTextOutlined />;
      case 'pptx': return <FileTextOutlined />;
      case 'html': return <CodeOutlined />;
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

  if (!template) return null;

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={null}
      className="template-preview-modal"
    >
      <div className="template-preview">
        {/* 模板头部信息 */}
        <Card className="mb-4">
          <Row gutter={[24, 16]}>
            <Col xs={24} md={16}>
              <div className="flex items-start space-x-4">
                <Image
                  width={120}
                  height={80}
                  src={template.thumbnail}
                  alt={template.name}
                  className="rounded-lg object-cover"
                  preview={false}
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Title level={3} className="mb-0">{template.name}</Title>
                    <Tag 
                      color={getTypeColor(template.type)}
                      icon={getTypeIcon(template.type)}
                    >
                      {template.type.toUpperCase()}
                    </Tag>
                  </div>
                  <Paragraph className="text-gray-600 mb-3">
                    {template.description}
                  </Paragraph>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Tag color="blue">{template.category}</Tag>
                    <Tag color="green">{template.industry}</Tag>
                    {template.tags.map(tag => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Avatar size={16} icon={<UserOutlined />} className="mr-1" />
                      {template.author}
                    </span>
                    <span className="flex items-center">
                      <CalendarOutlined className="mr-1" />
                      {template.updatedAt}
                    </span>
                    <span className="flex items-center">
                      <DownloadIcon className="mr-1" />
                      {template.downloads} 下载
                    </span>
                    <span className="flex items-center">
                      <Rate disabled defaultValue={template.rating} className="text-xs" />
                      <span className="ml-1">{template.rating}</span>
                    </span>
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="flex flex-col space-y-2">
                <Button
                  type="primary"
                  size="large"
                  icon={<DownloadOutlined />}
                  onClick={handleUseTemplate}
                  block
                >
                  使用此模板
                </Button>
                <Space className="w-full">
                  <Button
                    icon={isFavorite ? <StarFilled /> : <StarOutlined />}
                    onClick={handleToggleFavorite}
                    className={isFavorite ? 'text-yellow-500' : ''}
                  >
                    {isFavorite ? '已收藏' : '收藏'}
                  </Button>
                  <Button icon={<LikeOutlined />}>
                    点赞
                  </Button>
                  <Button icon={<ShareAltOutlined />} onClick={handleShare}>
                    分享
                  </Button>
                </Space>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 模板内容标签页 */}
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="预览效果" key="preview">
            <Card>
              <div className="template-preview-content">
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <Spin size="large" tip="生成预览中..." />
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 bg-white">
                    <div 
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                      className="preview-content"
                    />
                  </div>
                )}
              </div>
            </Card>
          </TabPane>
          
          <TabPane tab="模板代码" key="code">
            <Card>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Text code className="text-sm">
                  <pre className="whitespace-pre-wrap">{template.template}</pre>
                </Text>
              </div>
            </Card>
          </TabPane>
          
          <TabPane tab="示例数据" key="data">
            <Card>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Text code className="text-sm">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(template.sampleData, null, 2)}
                  </pre>
                </Text>
              </div>
            </Card>
          </TabPane>
          
          <TabPane tab="使用说明" key="instructions">
            <Card>
              <div className="prose max-w-none">
                <Title level={4}>如何使用此模板</Title>
                <Paragraph>
                  1. 点击"使用此模板"按钮选择模板
                </Paragraph>
                <Paragraph>
                  2. 在导出页面中，模板将自动应用到您的报告数据
                </Paragraph>
                <Paragraph>
                  3. 根据需要调整导出设置（格式、文件名等）
                </Paragraph>
                <Paragraph>
                  4. 点击导出按钮生成最终报告
                </Paragraph>
                
                <Divider />
                
                <Title level={4}>数据字段说明</Title>
                <Paragraph>
                  此模板支持以下数据字段：
                </Paragraph>
                <ul>
                  <li><Text code>title</Text> - 报告标题</li>
                  <li><Text code>summary</Text> - 报告摘要</li>
                  <li><Text code>metrics</Text> - 关键指标数组</li>
                  <li><Text code>charts</Text> - 图表数据数组</li>
                </ul>
                
                <Divider />
                
                <Title level={4}>自定义说明</Title>
                <Paragraph>
                  您可以基于此模板创建自己的版本，支持：
                </Paragraph>
                <ul>
                  <li>修改HTML结构和样式</li>
                  <li>添加新的数据字段</li>
                  <li>调整布局和设计</li>
                  <li>集成更多图表类型</li>
                </ul>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </Modal>
  );
};

export default TemplatePreview;