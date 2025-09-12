import React, { useState } from 'react';
import { Card, Button, Badge, Tabs, Progress, Select, Input, Typography, Space, Row, Col } from 'antd';
import { toast } from 'sonner';
import {
  FileTextOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  GlobalOutlined,
  SettingOutlined,
  EyeOutlined,
  ShareAltOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { exportService } from '../services/exportService';
import type { ExportOptions, ExportProgress } from '../services/exportService';
import TemplateLibrary, { type Template as LibraryTemplate } from '../components/TemplateLibrary';
import TemplatePreview from '../components/TemplatePreview';
import TemplateCreator from '../components/TemplateCreator';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  extension: string;
  size?: string;
}

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  preview: string;
  downloads: number;
  rating: number;
}

interface ExportJob {
  id: string;
  format: string;
  template: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  downloadUrl?: string;
}

const exportFormats: ExportFormat[] = [
  {
    id: 'pdf',
    name: 'PDF报告',
    description: '专业格式，适合正式文档和打印',
    icon: <FileTextOutlined style={{ fontSize: '24px' }} />,
    extension: '.pdf',
    size: '高质量'
  },
  {
    id: 'docx',
    name: 'Word文档',
    description: '可编辑格式，便于后续修改',
    icon: <FileTextOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
    extension: '.docx',
    size: '可编辑'
  },
  {
    id: 'xlsx',
    name: 'Excel表格',
    description: '数据分析格式，包含图表和数据',
    icon: <FileExcelOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
    extension: '.xlsx',
    size: '数据丰富'
  },
  {
    id: 'pptx',
    name: 'PowerPoint',
    description: '演示文稿格式，适合汇报展示',
    icon: <FilePptOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
    extension: '.pptx',
    size: '演示友好'
  },
  {
    id: 'html',
    name: 'HTML网页',
    description: '网页格式，便于在线分享',
    icon: <GlobalOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
    extension: '.html',
    size: '在线友好'
  }
];

const Export: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customSettings, setCustomSettings] = useState({
    fileName: '智能报告',
    includeCharts: true,
    includeData: true,
    watermark: false,
    pageOrientation: 'portrait' as 'portrait' | 'landscape'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    progress: 0,
    status: 'preparing',
    message: '准备导出...'
  });
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<LibraryTemplate | null>(null);
  const [creatorVisible, setCreatorVisible] = useState(false);

  const handleExport = async () => {
    if (!selectedFormat) {
      toast.error('请选择导出格式');
      return;
    }

    setIsExporting(true);
    setExportProgress({ progress: 0, status: 'preparing', message: '开始导出...' });

    try {
      const options: ExportOptions = {
        format: selectedFormat as 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'html',
        template: selectedTemplate,
        data: {
          title: customSettings.fileName,
          summary: '智能生成的报告摘要',
          metrics: [],
          charts: []
        },
        fileName: customSettings.fileName,
        settings: {
          includeCharts: customSettings.includeCharts,
          includeData: customSettings.includeData,
          watermark: customSettings.watermark,
          pageOrientation: customSettings.pageOrientation
        }
      };

      let blob: Blob;
      switch (selectedFormat) {
        case 'pdf':
          blob = await exportService.exportToPDF(options);
          break;
        case 'docx':
          blob = await exportService.exportToWord(options);
          break;
        case 'xlsx':
          blob = await exportService.exportToExcel(options);
          break;
        case 'pptx':
          blob = await exportService.exportToPowerPoint(options);
          break;
        case 'html':
          blob = await exportService.exportToHTML(options);
          break;
        default:
          throw new Error('不支持的导出格式');
      }

      // 创建下载链接
       const url = URL.createObjectURL(blob);
       const link = document.createElement('a');
       link.href = url;
       link.download = `${customSettings.fileName}${exportFormats.find(f => f.id === selectedFormat)?.extension || ''}`;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
       URL.revokeObjectURL(url);

      toast.success('导出成功！');
      
      // 添加到导出历史
      const newJob: ExportJob = {
        id: Date.now().toString(),
        format: selectedFormat,
        template: selectedTemplate || '默认模板',
        status: 'completed',
        progress: 100,
        createdAt: new Date()
      };
      setExportJobs(prev => [newJob, ...prev]);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('导出失败，请重试');
    } finally {
      setIsExporting(false);
      setExportProgress({ progress: 0, status: 'preparing', message: '准备导出...' });
    }
  };

  const tabItems = [
    {
      key: 'export',
      label: '导出设置',
      children: (
        <div style={{ padding: '20px 0' }}>
          <Row gutter={[24, 24]}>
            {/* 导出格式选择 */}
            <Col xs={24} lg={12}>
              <Card title="选择导出格式" className="mb-6">
                <Paragraph type="secondary" className="mb-4">
                  选择最适合您需求的文档格式
                </Paragraph>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {exportFormats.map((format) => (
                    <Card
                      key={format.id}
                      size="small"
                      className={`cursor-pointer transition-all ${
                        selectedFormat === format.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:border-gray-400'
                      }`}
                      onClick={() => setSelectedFormat(format.id)}
                    >
                      <div className="flex items-start space-x-3">
                        {format.icon}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <Title level={5} className="mb-0">{format.name}</Title>
                            <Badge color="blue" text={format.size} />
                          </div>
                          <Text type="secondary" className="text-sm">
                            {format.description}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  ))}
                </Space>
              </Card>
            </Col>

            {/* 导出设置 */}
            <Col xs={24} lg={12}>
              <Card title="导出设置" className="mb-6">
                <Paragraph type="secondary" className="mb-4">
                  自定义您的导出选项
                </Paragraph>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div>
                    <Text strong>文件名</Text>
                    <Input
                      value={customSettings.fileName}
                      onChange={(e) => setCustomSettings(prev => ({ ...prev, fileName: e.target.value }))}
                      placeholder="输入文件名"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Text strong>页面方向</Text>
                    <Select
                      value={customSettings.pageOrientation}
                      onChange={(value) => setCustomSettings(prev => ({ ...prev, pageOrientation: value }))}
                      style={{ width: '100%', marginTop: 8 }}
                    >
                      <Option value="portrait">纵向</Option>
                      <Option value="landscape">横向</Option>
                    </Select>
                  </div>

                  <div>
                    <Text strong>导出选项</Text>
                    <div className="mt-2 space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={customSettings.includeCharts}
                          onChange={(e) => setCustomSettings(prev => ({ ...prev, includeCharts: e.target.checked }))}
                        />
                        <Text>包含图表</Text>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={customSettings.includeData}
                          onChange={(e) => setCustomSettings(prev => ({ ...prev, includeData: e.target.checked }))}
                        />
                        <Text>包含原始数据</Text>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={customSettings.watermark}
                          onChange={(e) => setCustomSettings(prev => ({ ...prev, watermark: e.target.checked }))}
                        />
                        <Text>添加水印</Text>
                      </label>
                    </div>
                  </div>

                  {/* 导出进度 */}
                  {isExporting && (
                    <div>
                      <Text strong>导出进度</Text>
                      <div className="mt-2">
                        <Progress percent={exportProgress.progress} />
                        <Text type="secondary" className="text-sm mt-1">
                          {exportProgress.message}
                        </Text>
                      </div>
                    </div>
                  )}
                </Space>
              </Card>
            </Col>
          </Row>

          {/* 导出按钮 */}
          <div className="flex justify-center mt-6">
            <Space size="middle">
              <Button
                type="primary"
                size="large"
                icon={isExporting ? <LoadingOutlined /> : <DownloadOutlined />}
                onClick={handleExport}
                loading={isExporting}
                disabled={!selectedFormat}
              >
                {isExporting ? '导出中...' : '开始导出'}
              </Button>
              <Button
                size="large"
                icon={<EyeOutlined />}
                onClick={() => setPreviewVisible(true)}
              >
                预览
              </Button>
            </Space>
          </div>
        </div>
      )
    },
    {
      key: 'templates',
      label: '模板库',
      children: (
        <div style={{ padding: '20px 0' }}>
          <TemplateLibrary
             onSelectTemplate={(template: LibraryTemplate) => {
               setSelectedTemplate(template.id);
               toast.success(`已选择模板：${template.name}`);
             }}
             onPreviewTemplate={(template: LibraryTemplate) => {
               setSelectedTemplateForPreview(template);
               setPreviewVisible(true);
             }}
           />
        </div>
      )
    },
    {
      key: 'history',
      label: '导出历史',
      children: (
        <div style={{ padding: '20px 0' }}>
          <Card title="导出历史">
            {exportJobs.length === 0 ? (
              <div className="text-center py-8">
                <Text type="secondary">暂无导出记录</Text>
              </div>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {exportJobs.map((job) => (
                  <Card key={job.id} size="small">
                    <div className="flex items-center justify-between">
                      <div>
                        <Title level={5} className="mb-1">
                          {job.format.toUpperCase()} - {job.template}
                        </Title>
                        <Text type="secondary">
                          {job.createdAt.toLocaleString()}
                        </Text>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          status={job.status === 'completed' ? 'success' : job.status === 'failed' ? 'error' : 'processing'}
                          text={job.status === 'completed' ? '已完成' : job.status === 'failed' ? '失败' : '处理中'}
                        />
                        {job.status === 'completed' && job.downloadUrl && (
                          <Button
                            type="link"
                            size="small"
                            icon={<DownloadOutlined />}
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = job.downloadUrl!;
                              link.download = `export-${job.id}`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            下载
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </Space>
            )}
          </Card>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <Title level={2} className="mb-2">
          导出与模板
        </Title>
        <Paragraph type="secondary">
          将您的报告导出为多种格式，或使用专业模板创建精美文档
        </Paragraph>
      </div>

      <Tabs defaultActiveKey="export" items={tabItems} />

      {/* 模板预览弹窗 */}
      {selectedTemplateForPreview && (
        <TemplatePreview
          template={selectedTemplateForPreview}
          visible={previewVisible}
          onClose={() => {
            setPreviewVisible(false);
            setSelectedTemplateForPreview(null);
          }}
          onSelectTemplate={(template: LibraryTemplate) => {
            setSelectedTemplate(template.id);
            setPreviewVisible(false);
            setSelectedTemplateForPreview(null);
            toast.success(`已选择模板：${template.name}`);
          }}
          onToggleFavorite={(templateId: string) => {
            // 处理收藏/取消收藏逻辑
            console.log('Toggle favorite for template:', templateId);
          }}
        />
      )}

      {/* 模板创建器 */}
      <TemplateCreator
        visible={creatorVisible}
        onClose={() => setCreatorVisible(false)}
        onSave={(template: any) => {
           setCreatorVisible(false);
           toast.success('模板创建成功！');
         }}
      />
    </div>
  );
};

export default Export;