import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Presentation,
  Globe,
  Settings,
  Eye,
  Share2,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  AppstoreOutlined
} from 'lucide-react';
import { exportService, ExportOptions, ExportProgress } from '../services/exportService';
import { TemplateLibrary } from '../components/TemplateLibrary';
import { TemplatePreview } from '../components/TemplatePreview';
import TemplateCreator from '../components/TemplateCreator';
import type { Template } from '../components/TemplateLibrary';

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
    icon: <FileText className="h-6 w-6" />,
    extension: '.pdf',
    size: '高质量'
  },
  {
    id: 'docx',
    name: 'Word文档',
    description: '可编辑格式，便于后续修改',
    icon: <FileText className="h-6 w-6 text-blue-600" />,
    extension: '.docx',
    size: '可编辑'
  },
  {
    id: 'xlsx',
    name: 'Excel表格',
    description: '数据分析格式，包含图表和数据',
    icon: <FileSpreadsheet className="h-6 w-6 text-green-600" />,
    extension: '.xlsx',
    size: '数据丰富'
  },
  {
    id: 'pptx',
    name: 'PowerPoint',
    description: '演示文稿格式，适合汇报展示',
    icon: <Presentation className="h-6 w-6 text-orange-600" />,
    extension: '.pptx',
    size: '演示友好'
  },
  {
    id: 'html',
    name: 'HTML网页',
    description: '网页格式，便于在线分享',
    icon: <Globe className="h-6 w-6 text-purple-600" />,
    extension: '.html',
    size: '在线友好'
  }
];

const templates: Template[] = [
  {
    id: 'financial-report',
    name: '财务分析报告',
    category: '金融',
    description: '专业的财务数据分析模板，包含收入、支出、利润等关键指标',
    preview: '/templates/financial-preview.png',
    downloads: 1250,
    rating: 4.8
  },
  {
    id: 'market-research',
    name: '市场调研报告',
    category: '市场',
    description: '全面的市场分析模板，涵盖竞争分析、用户画像、趋势预测',
    preview: '/templates/market-preview.png',
    downloads: 980,
    rating: 4.6
  },
  {
    id: 'sales-performance',
    name: '销售业绩报告',
    category: '销售',
    description: '销售团队专用模板，展示业绩指标、目标达成、客户分析',
    preview: '/templates/sales-preview.png',
    downloads: 1100,
    rating: 4.7
  },
  {
    id: 'project-summary',
    name: '项目总结报告',
    category: '项目管理',
    description: '项目管理模板，包含进度跟踪、风险评估、成果展示',
    preview: '/templates/project-preview.png',
    downloads: 850,
    rating: 4.5
  },
  {
    id: 'hr-analytics',
    name: '人力资源分析',
    category: '人力资源',
    description: 'HR专用模板，员工绩效、招聘分析、培训效果评估',
    preview: '/templates/hr-preview.png',
    downloads: 720,
    rating: 4.4
  },
  {
    id: 'operations-dashboard',
    name: '运营数据看板',
    category: '运营',
    description: '运营团队模板，用户增长、活跃度、转化率等核心指标',
    preview: '/templates/operations-preview.png',
    downloads: 950,
    rating: 4.6
  }
];

const Export: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('financial-report');
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedTemplateObj, setSelectedTemplateObj] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [creatorVisible, setCreatorVisible] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    progress: 0,
    status: 'preparing',
    message: '准备导出...'
  });
  const [customSettings, setCustomSettings] = useState({
    fileName: '智能报告',
    includeCharts: true,
    includeData: true,
    watermark: false,
    pageOrientation: 'portrait'
  });

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplateObj(template);
    setSelectedTemplate(template.id);
    toast.success(`已选择模板: ${template.name}`);
  };

  const handlePreviewTemplate = (template: Template) => {
    setPreviewTemplate(template);
    setIsPreviewVisible(true);
  };

  const handleToggleFavorite = (templateId: string) => {
    // 这里应该调用API更新收藏状态
    toast.success('收藏状态已更新');
  };

  // 处理模板创建
  const handleCreateTemplate = () => {
    setCreatorVisible(true);
  };

  // 处理模板保存
  const handleSaveTemplate = (template: any) => {
    // 这里可以调用模板服务保存模板
    console.log('保存模板:', template);
    toast.success('模板创建成功！');
    setCreatorVisible(false);
  };

  const handleExport = async () => {
    if (!customSettings.fileName.trim()) {
      toast.error('请输入文件名');
      return;
    }

    setIsExporting(true);
    const newJob: ExportJob = {
      id: Date.now().toString(),
      format: selectedFormat,
      template: selectedTemplate,
      status: 'processing',
      progress: 0,
      createdAt: new Date()
    };

    setExportJobs(prev => [newJob, ...prev]);
    toast.success('导出任务已开始');
    
    // 设置进度回调
    exportService.setProgressCallback((progress: ExportProgress) => {
      setExportProgress(progress);
    });

    try {
      // 准备导出数据
      const exportData = {
        title: customSettings.fileName,
        summary: '这是一个智能生成的报告摘要，包含了关键的业务洞察和数据分析结果。',
        metrics: [
          { name: '总收入', value: '¥1,234,567' },
          { name: '用户增长', value: '+23.5%' },
          { name: '转化率', value: '12.8%' },
          { name: '客户满意度', value: '4.8/5.0' }
        ],
        charts: [
          {
            title: '月度收入趋势',
            data: [
              { month: '1月', revenue: 100000 },
              { month: '2月', revenue: 120000 },
              { month: '3月', revenue: 150000 }
            ]
          }
        ],
        dataSource: '智能报告系统',
        reportPeriod: '2024年第一季度',
        executiveSummary: '本季度业务表现优异，各项关键指标均超预期完成。',
        financialMetrics: [
          { name: '营业收入', value: '¥1,234,567', change: 15.2 },
          { name: '净利润', value: '¥234,567', change: 8.7 },
          { name: '毛利率', value: '45.6%', change: -2.1 }
        ]
      };

      const options: ExportOptions = {
        format: selectedFormat as any,
        template: selectedTemplateObj?.template || selectedTemplate,
        data: exportData,
        fileName: customSettings.fileName,
        settings: customSettings
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

      // 下载文件
      await exportService.downloadFile(blob, customSettings.fileName, selectedFormat);
      toast.success('导出成功！');
      
      // 更新任务状态
      setExportJobs(prev => prev.map(job => {
        if (job.id === newJob.id) {
          return {
            ...job,
            progress: 100,
            status: 'completed',
            downloadUrl: `/downloads/${job.id}.${exportFormats.find(f => f.id === job.format)?.extension}`
          };
        }
        return job;
      }));
      
    } catch (error) {
      console.error('导出失败:', error);
      toast.error(`导出失败: ${error}`);
      
      // 更新任务状态为失败
      setExportJobs(prev => prev.map(job => {
        if (job.id === newJob.id) {
          return {
            ...job,
            status: 'failed'
          };
        }
        return job;
      }));
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusIcon = (status: ExportJob['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (status: ExportJob['status']) => {
    switch (status) {
      case 'pending': return '等待中';
      case 'processing': return '处理中';
      case 'completed': return '已完成';
      case 'failed': return '失败';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">导出与模板</h1>
          <p className="text-muted-foreground mt-2">
            选择导出格式和模板，生成专业的报告文档
          </p>
        </div>
        <Button 
          onClick={handleExport} 
          disabled={isExporting}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              导出中...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              开始导出
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="export" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export">导出设置</TabsTrigger>
          <TabsTrigger value="templates">模板库</TabsTrigger>
          <TabsTrigger value="history">导出历史</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 导出格式选择 */}
            <Card>
              <CardHeader>
                <CardTitle>选择导出格式</CardTitle>
                <CardDescription>
                  选择最适合您需求的文档格式
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {exportFormats.map((format) => (
                  <div
                    key={format.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedFormat === format.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedFormat(format.id)}
                  >
                    <div className="flex items-start space-x-3">
                      {format.icon}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{format.name}</h3>
                          <Badge variant="secondary">{format.size}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 自定义设置 */}
            <Card>
              <CardHeader>
                <CardTitle>导出设置</CardTitle>
                <CardDescription>
                  自定义您的导出选项
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fileName">文件名</Label>
                  <Input
                    id="fileName"
                    value={customSettings.fileName}
                    onChange={(e) => setCustomSettings(prev => ({ ...prev, fileName: e.target.value }))}
                    placeholder="输入文件名"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orientation">页面方向</Label>
                  <Select
                    value={customSettings.pageOrientation}
                    onValueChange={(value) => setCustomSettings(prev => ({ ...prev, pageOrientation: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">纵向</SelectItem>
                      <SelectItem value="landscape">横向</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>包含内容</Label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={customSettings.includeCharts}
                        onChange={(e) => setCustomSettings(prev => ({ ...prev, includeCharts: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">包含图表</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={customSettings.includeData}
                        onChange={(e) => setCustomSettings(prev => ({ ...prev, includeData: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">包含原始数据</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={customSettings.watermark}
                        onChange={(e) => setCustomSettings(prev => ({ ...prev, watermark: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">添加水印</span>
                    </label>
                  </div>
                </div>

                {/* 导出进度 */}
                {isExporting && (
                  <div className="space-y-2">
                    <Label>导出进度</Label>
                    <div className="space-y-2">
                      <Progress value={exportProgress.progress} className="w-full" />
                      <p className="text-sm text-muted-foreground">
                        {exportProgress.message}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="p-6">
            <TemplateLibrary
              onSelectTemplate={handleSelectTemplate}
              onPreviewTemplate={handlePreviewTemplate}
              onCreateTemplate={handleCreateTemplate}
            />
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">导出历史</h2>
            <p className="text-muted-foreground">
              查看您的导出记录和下载文件
            </p>
          </div>

          <Card>
            <CardContent className="p-0">
              {exportJobs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>暂无导出记录</p>
                </div>
              ) : (
                <div className="divide-y">
                  {exportJobs.map((job) => {
                    const format = exportFormats.find(f => f.id === job.format);
                    const template = templates.find(t => t.id === job.template);
                    
                    return (
                      <div key={job.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {format?.icon}
                            <div>
                              <h3 className="font-medium">
                                {customSettings.fileName}{format?.extension}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {template?.name} • {job.createdAt.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(job.status)}
                              <span className="text-sm">{getStatusText(job.status)}</span>
                            </div>
                            {job.status === 'processing' && (
                              <div className="w-24">
                                <Progress value={job.progress} className="h-2" />
                              </div>
                            )}
                            {job.status === 'completed' && job.downloadUrl && (
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                下载
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* 模板预览弹窗 */}
      <TemplatePreview
        template={previewTemplate}
        visible={isPreviewVisible}
        onClose={() => setIsPreviewVisible(false)}
        onSelectTemplate={handleSelectTemplate}
        onToggleFavorite={handleToggleFavorite}
      />
      
      {/* 模板创建器 */}
      <TemplateCreator
        visible={creatorVisible}
        onClose={() => setCreatorVisible(false)}
        onSave={handleSaveTemplate}
      />
    </div>
  );
};

export default Export;