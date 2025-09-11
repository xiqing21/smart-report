import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  Dropdown,
  Input,
  Space,
  Divider,
  Tooltip,
  Select,
  ColorPicker,
  Slider,
  Modal,
  Upload,
  Card,
  Row,
  Col,
  Typography,
  App,
  Switch
} from 'antd';
import { EnhancedButton } from '../components/InteractiveEnhancements';

import {
  SaveOutlined,
  PrinterOutlined,
  ShareAltOutlined,
  UndoOutlined,
  RedoOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,

  FontColorsOutlined,
  BgColorsOutlined,
  PictureOutlined,
  TableOutlined,
  LinkOutlined,
  FileTextOutlined,
  EyeOutlined,
  SettingOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ClockCircleOutlined,

  HistoryOutlined
} from '@ant-design/icons';
import { useParams, useLocation } from 'react-router-dom';
import { ReportService } from '../services/api/dataService';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface EditorState {
  title: string;
  content: string;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  alignment: 'left' | 'center' | 'right';
  isFullscreen: boolean;
}

interface OutlineItem {
  id: string;
  text: string;
  level: number;
  line: number;
}

const ReportEditor: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const { message } = App.useApp();
  
  // 获取从AI分析传递过来的数据
  const analysisData = location.state?.analysisData;
  
  // 获取模板ID参数
  const searchParams = new URLSearchParams(location.search);
  const templateId = searchParams.get('template');
  
  // 模板数据映射
  const templateData: Record<string, any> = {
    '1': {
      title: '年度业务分析报告',
      content: `# 年度业务分析报告

## 执行摘要
本报告分析了公司年度业务发展情况，涵盖财务表现、市场地位、运营效率等关键指标。

## 业务概况
### 财务表现
- 营业收入：同比增长15.2%
- 净利润：同比增长12.8%
- 毛利率：保持在35.6%的健康水平

### 市场表现
- 市场份额：在主要细分市场中排名前三
- 客户满意度：达到92.3%
- 品牌知名度：提升8.5个百分点

## 关键成就
1. **产品创新**：推出3款新产品，获得市场积极反响
2. **数字化转型**：完成核心业务系统升级
3. **团队建设**：员工满意度提升至89.2%

## 挑战与机遇
### 面临挑战
- 原材料成本上涨压力
- 市场竞争加剧
- 人才招聘难度增加

### 发展机遇
- 新兴市场需求增长
- 技术创新带来的效率提升
- 政策支持力度加大

## 未来展望
基于当前业务基础和市场环境分析，预计下一年度将继续保持稳健增长态势。

---
*报告生成时间：${new Date().toLocaleDateString()}*`
    },
    '2': {
      title: '市场调研报告',
      content: `# 市场调研报告

## 调研概述
本次调研旨在深入了解目标市场的消费者需求、竞争格局和发展趋势。

## 市场规模分析
### 整体市场
- 市场总规模：约500亿元
- 年增长率：8.3%
- 预计未来3年复合增长率：10.2%

### 细分市场
1. **高端市场**：占比35%，增长迅速
2. **中端市场**：占比50%，竞争激烈
3. **入门市场**：占比15%，价格敏感

## 消费者洞察
### 消费行为特征
- 品质导向：67%的消费者优先考虑产品质量
- 价格敏感：45%的消费者对价格较为敏感
- 品牌忠诚：32%的消费者有明确品牌偏好

### 购买决策因素
1. 产品质量（重要性：85%）
2. 价格合理性（重要性：72%）
3. 品牌声誉（重要性：58%）
4. 售后服务（重要性：51%）

## 竞争分析
### 主要竞争对手
- **竞争对手A**：市场份额25%，技术领先
- **竞争对手B**：市场份额20%，价格优势
- **竞争对手C**：市场份额15%，渠道广泛

## 市场机会
1. **技术创新空间**：新技术应用潜力巨大
2. **渠道下沉**：三四线城市需求增长
3. **个性化需求**：定制化产品市场兴起

## 建议与策略
基于调研结果，建议采取差异化竞争策略，重点关注产品创新和用户体验提升。

---
*调研时间：${new Date().toLocaleDateString()}*`
    },
    '3': {
      title: '财务分析报告',
      content: `# 财务分析报告

## 财务概况
本报告基于最新财务数据，全面分析公司财务状况和经营成果。

## 盈利能力分析
### 收入结构
- 主营业务收入：占总收入的85.2%
- 其他业务收入：占总收入的14.8%
- 收入增长率：同比增长18.5%

### 利润分析
- 毛利率：36.8%（同比提升2.1个百分点）
- 净利率：12.3%（同比提升1.5个百分点）
- ROE：15.6%（行业平均水平：12.8%）

## 财务状况分析
### 资产结构
- 流动资产：占总资产的45.3%
- 非流动资产：占总资产的54.7%
- 资产负债率：52.1%（处于合理区间）

### 现金流分析
- 经营活动现金流：净流入2.8亿元
- 投资活动现金流：净流出1.2亿元
- 筹资活动现金流：净流入0.5亿元

## 财务指标对比
### 偿债能力
- 流动比率：1.85（行业平均：1.62）
- 速动比率：1.23（行业平均：1.15）
- 资产负债率：52.1%（行业平均：58.3%）

### 运营效率
- 总资产周转率：1.2次/年
- 应收账款周转率：8.5次/年
- 存货周转率：6.2次/年

## 风险评估
### 主要风险
1. **市场风险**：行业周期性波动影响
2. **信用风险**：应收账款集中度较高
3. **流动性风险**：短期债务偿还压力

### 风险控制措施
- 加强应收账款管理
- 优化资本结构
- 建立风险预警机制

## 财务预测
基于当前财务状况和市场环境，预计下一财年将保持稳健增长。

---
*分析基准日：${new Date().toLocaleDateString()}*`
    },
    '4': {
      title: '项目进度报告',
      content: `# 项目进度报告

## 项目概况
项目名称：智能报告系统开发项目
项目周期：2024年1月 - 2024年6月
当前阶段：开发阶段

## 进度总览
### 整体进度
- 计划进度：65%
- 实际进度：68%
- 进度状态：✅ 超前完成

### 里程碑完成情况
1. **需求分析**：✅ 已完成（2024年1月）
2. **系统设计**：✅ 已完成（2024年2月）
3. **开发实施**：🔄 进行中（预计2024年4月完成）
4. **系统测试**：⏳ 待开始（2024年5月）
5. **上线部署**：⏳ 待开始（2024年6月）

## 各模块进度
### 前端开发
- 用户界面设计：100%
- 组件开发：85%
- 页面集成：70%
- 响应式适配：60%

### 后端开发
- 数据库设计：100%
- API接口开发：80%
- 业务逻辑实现：75%
- 性能优化：40%

### AI功能模块
- 智能分析引擎：90%
- 自然语言处理：85%
- 数据可视化：70%
- 报告生成：65%

## 资源使用情况
### 人力资源
- 前端开发：3人（计划3人）
- 后端开发：4人（计划4人）
- AI算法：2人（计划2人）
- 测试人员：2人（计划2人）

### 预算执行
- 总预算：500万元
- 已使用：320万元（64%）
- 剩余预算：180万元
- 预算状态：✅ 控制良好

## 风险与问题
### 当前风险
1. **技术风险**：AI模型训练时间可能延长
2. **资源风险**：关键开发人员可能离职
3. **进度风险**：第三方接口对接可能延期

### 已解决问题
- ✅ 数据库性能优化完成
- ✅ 前端兼容性问题解决
- ✅ API接口规范统一

## 下阶段计划
### 本月目标
1. 完成剩余API接口开发
2. 完成前端页面集成测试
3. 开始系统集成测试准备

### 下月计划
1. 启动系统测试阶段
2. 完成用户验收测试
3. 准备生产环境部署

---
*报告日期：${new Date().toLocaleDateString()}*
*下次更新：${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}*`
    }
  };
  
  // 生成AI分析报告内容
  const generateAIReportContent = () => {
    // 优先处理模板数据
    if (templateId && templateData[templateId]) {
      return templateData[templateId].content;
    }
    
    // 处理AI分析数据
    if (analysisData && analysisData.type === 'ai-analysis') {
      const { data } = analysisData;
      return `# 山西电网智能分析报告

## 执行摘要
本报告基于AI智能分析系统对山西电网数据进行深度分析，涵盖负荷增长、清洁能源占比及区域分布等关键指标。

## 关键发现

### 1. 负荷增长分析
- **总体增长率**: ${data.loadGrowth}%
- **增长趋势**: 呈现稳定上升态势，符合区域经济发展预期

### 2. 清洁能源发展
- **清洁能源占比**: ${data.cleanEnergyRatio}%
- **发展潜力**: 具备进一步提升空间，建议加大投入

### 3. 区域负荷分布
${data.regions.map((region: any) => 
  `- **${region.name}**: 负荷 ${region.load}，增长率 ${region.growth}`
).join('\n')}

## 趋势预测
基于历史数据和AI模型分析，预计未来12个月内：
1. 电网负荷将继续保持稳定增长
2. 清洁能源占比有望提升至15%以上
3. 各区域发展将更加均衡

## 建议与措施
1. **优化电网结构**: 重点关注高增长区域的电网建设
2. **推进清洁能源**: 加大风电、光伏等清洁能源项目投入
3. **智能化升级**: 持续完善智能电网监控和预警系统

## 结论
通过AI智能分析，山西电网整体运行状况良好，各项指标符合预期。建议继续加强智能化建设，提升电网运行效率和可靠性。

---
*本报告由AI智能分析系统自动生成，数据截止时间：${new Date().toLocaleDateString()}*`;
    }
    
    // 默认内容
    return id ? '这是一个示例报告内容。您可以在这里编辑您的报告内容，支持富文本编辑功能。\n\n本报告包含以下几个部分：\n1. 数据分析概述\n2. 关键指标解读\n3. 趋势预测\n4. 建议与总结\n\n请根据您的需要进行编辑和调整。' : '';
  };

  const editorRef = useRef<HTMLDivElement>(null);
  
  // 获取初始标题
  const getInitialTitle = () => {
    if (templateId && templateData[templateId]) {
      return templateData[templateId].title;
    }
    if (analysisData) {
      return '山西电网智能分析报告';
    }
    if (id) {
      return '智能报告分析 - 2024年度总结';
    }
    return '新建报告';
  };

  const [editorState, setEditorState] = useState<EditorState>({
    title: getInitialTitle(),
    content: generateAIReportContent(),
    fontSize: 14,
    fontFamily: 'Microsoft YaHei',
    textColor: '#333333',
    backgroundColor: '#ffffff',
    isBold: false,
    isItalic: false,
    isUnderline: false,
    alignment: 'left',
    isFullscreen: false
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [_isLoading, _setIsLoading] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState<string>('');
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const [outline, setOutline] = useState<OutlineItem[]>([]);

  // 加载现有报告数据
  React.useEffect(() => {
    const loadReport = async () => {
      if (id && id !== 'new') {
        _setIsLoading(true);
        try {
          console.log('📖 加载报告数据，ID:', id);
          const response = await ReportService.getReports(1, 50);
          
          if (response.success && response.data) {
            const report = response.data.find((r: any) => r.id === id);
            if (report) {
              console.log('✅ 找到报告数据:', report);
              
              // 解析报告内容
               let content = '';
               let formatting: any = {};
               
               if (typeof report.content === 'string') {
                 content = report.content;
               } else if (report.content && typeof report.content === 'object') {
                 // 处理AI分析生成的报告格式
                 if (report.content.aiResponse) {
                   content = report.content.aiResponse;
                 } else if (report.content.text) {
                   content = report.content.text;
                 } else if (report.content.analysisData) {
                   // 如果是AI分析数据，生成格式化的报告内容
                   const analysisData = report.content.analysisData;
                   content = generateAIReportContent({ data: analysisData, type: 'ai-analysis' });
                 } else {
                   content = report.content.summary || JSON.stringify(report.content, null, 2);
                 }
                 formatting = report.content.formatting || {};
               }
               
               setEditorState(prev => ({
                 ...prev,
                 title: report.title || '未命名报告',
                 content: content,
                 fontSize: report.content?.fontSize || prev.fontSize,
                 fontFamily: report.content?.fontFamily || prev.fontFamily,
                 textColor: report.content?.textColor || prev.textColor,
                 backgroundColor: report.content?.backgroundColor || prev.backgroundColor,
                 isBold: formatting.isBold || false,
                 isItalic: formatting.isItalic || false,
                 isUnderline: formatting.isUnderline || false,
                 alignment: formatting.alignment || 'left'
               }));
            } else {
              console.warn('⚠️ 未找到指定ID的报告:', id);
              message.warning('未找到指定的报告');
            }
          } else {
            console.error('❌ 加载报告失败:', response.error);
            message.error('加载报告失败');
          }
        } catch (error) {
          console.error('❌ 加载报告异常:', error);
          message.error('加载报告时发生错误');
        } finally {
          _setIsLoading(false);
        }
      }
    };
    
    loadReport();
  }, [id]);

  // 字体选项
  const fontFamilyOptions = [
    { label: '微软雅黑', value: 'Microsoft YaHei' },
    { label: '宋体', value: 'SimSun' },
    { label: '黑体', value: 'SimHei' },
    { label: '楷体', value: 'KaiTi' },
    { label: 'Arial', value: 'Arial' },
    { label: 'Times New Roman', value: 'Times New Roman' }
  ];

  // 字号选项
  const fontSizeOptions = [
    { label: '小五', value: 9 },
    { label: '五号', value: 10.5 },
    { label: '小四', value: 12 },
    { label: '四号', value: 14 },
    { label: '小三', value: 15 },
    { label: '三号', value: 16 },
    { label: '小二', value: 18 },
    { label: '二号', value: 22 },
    { label: '一号', value: 26 }
  ];

  // 保存报告
  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      console.log('💾 开始保存报告...');
      console.log('报告数据:', { title: editorState.title, content: editorState.content });
      
      const reportData = {
        title: editorState.title,
        content: {
          text: editorState.content,
          fontSize: editorState.fontSize,
          fontFamily: editorState.fontFamily,
          textColor: editorState.textColor,
          backgroundColor: editorState.backgroundColor,
          formatting: {
            isBold: editorState.isBold,
            isItalic: editorState.isItalic,
            isUnderline: editorState.isUnderline,
            alignment: editorState.alignment
          }
        },
        status: 'draft'
      };
      
      let result;
      if (id && id !== 'new') {
        // 更新现有报告
        result = await ReportService.updateReport(id, reportData);
      } else {
        // 创建新报告
        result = await ReportService.createReport(reportData);
      }
      
      if (result.success && result.data) {
        console.log('✅ 报告保存成功:', result.data);
        setLastSaved(new Date());
        message.success(`报告保存成功！报告ID: ${result.data.id}`);
        
        // 如果是新创建的报告，更新URL
        if (id === 'new' && result.data.id) {
          window.history.replaceState(null, '', `/editor/${result.data.id}`);
        }
      } else {
        console.error('❌ 报告保存失败:', result.error);
        message.error(`保存失败: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ 保存报告异常:', error);
      message.error(`保存异常: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 自动保存
  React.useEffect(() => {
    const autoSave = setInterval(() => {
      if (editorState.title && editorState.content.trim() && !isSaving) {
        // 检查内容是否有变化
        const currentContent = JSON.stringify({
          title: editorState.title,
          content: editorState.content,
          formatting: {
            fontSize: editorState.fontSize,
            fontFamily: editorState.fontFamily,
            textColor: editorState.textColor,
            backgroundColor: editorState.backgroundColor,
            isBold: editorState.isBold,
            isItalic: editorState.isItalic,
            isUnderline: editorState.isUnderline,
            alignment: editorState.alignment
          }
        });
        
        if (currentContent !== lastSavedContent) {
          console.log('🔄 内容有变化，自动保存中...');
          handleSave();
          setLastSavedContent(currentContent);
        }
      }
    }, 30000); // 30秒自动保存

    return () => clearInterval(autoSave);
  }, [editorState, isSaving, lastSavedContent]);

  // 统计字数
  React.useEffect(() => {
    const count = editorState.content.replace(/\s/g, '').length;
    setWordCount(count);
  }, [editorState.content]);

  // 大纲识别功能
  const generateOutline = useMemo(() => {
    const content = editorState.content || '';
    const lines = content.split('\n');
    const outlineItems: OutlineItem[] = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // 识别Markdown标题
      const markdownMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
      if (markdownMatch) {
        const level = markdownMatch[1].length;
        const text = markdownMatch[2];
        outlineItems.push({
          id: `outline-${index}`,
          text,
          level,
          line: index + 1
        });
        return;
      }
      
      // 识别数字编号标题 (1. 2. 3.)
      const numberMatch = trimmedLine.match(/^(\d+\.\s*)(.+)$/);
      if (numberMatch && trimmedLine.length > 5) {
        outlineItems.push({
          id: `outline-${index}`,
          text: numberMatch[2],
          level: 1,
          line: index + 1
        });
        return;
      }
      
      // 识别中文编号标题 (一、二、三、)
      const chineseMatch = trimmedLine.match(/^[一二三四五六七八九十]+[、．]\s*(.+)$/);
      if (chineseMatch && trimmedLine.length > 3) {
        outlineItems.push({
          id: `outline-${index}`,
          text: chineseMatch[1],
          level: 1,
          line: index + 1
        });
        return;
      }
      
      // 识别带括号的标题 ((1) (2) (3))
      const bracketMatch = trimmedLine.match(/^\([\d一二三四五六七八九十]+\)\s*(.+)$/);
      if (bracketMatch && trimmedLine.length > 4) {
        outlineItems.push({
          id: `outline-${index}`,
          text: bracketMatch[1],
          level: 2,
          line: index + 1
        });
        return;
      }
      
      // 识别关键词开头的标题
      const keywordMatch = trimmedLine.match(/^(概述|摘要|总结|结论|建议|分析|背景|目标|方法|结果|讨论|附录)[：:：]?\s*(.*)$/);
      if (keywordMatch) {
        outlineItems.push({
          id: `outline-${index}`,
          text: keywordMatch[0],
          level: 1,
          line: index + 1
        });
      }
    });
    
    return outlineItems;
  }, [editorState.content]);

  // 更新大纲
  useEffect(() => {
    setOutline(generateOutline);
  }, [generateOutline]);

  // Markdown渲染函数
  const renderMarkdown = (text: string) => {
    if (!isMarkdownMode) {
      return text;
    }
    
    let html = text
      // 标题
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // 粗体
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // 斜体
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // 代码
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // 链接
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      // 换行
      .replace(/\n/g, '<br/>');
    
    return html;
  };

  // 跳转到大纲项目
  const scrollToOutlineItem = (lineNumber: number) => {
    const textArea = document.querySelector('.document-page textarea') as HTMLTextAreaElement;
    if (textArea) {
      const lines = editorState.content.split('\n');
      let charCount = 0;
      for (let i = 0; i < lineNumber - 1; i++) {
        charCount += lines[i].length + 1; // +1 for newline
      }
      textArea.focus();
      textArea.setSelectionRange(charCount, charCount);
      textArea.scrollTop = (lineNumber - 1) * 20; // 估算行高
    }
  };

  // 格式化工具栏
  const formatToolbar = (
    <Space size="small">
      <Tooltip title="粗体">
            <EnhancedButton
              type={editorState.isBold ? 'primary' : 'text'}
              icon={<BoldOutlined />}
              size="small"
              onClick={() => setEditorState(prev => ({ ...prev, isBold: !prev.isBold }))}
              variant="bounce"
            >
              粗体
            </EnhancedButton>
          </Tooltip>
          <Tooltip title="斜体">
            <EnhancedButton
              type={editorState.isItalic ? 'primary' : 'text'}
              icon={<ItalicOutlined />}
              size="small"
              onClick={() => setEditorState(prev => ({ ...prev, isItalic: !prev.isItalic }))}
              variant="bounce"
            >
              斜体
            </EnhancedButton>
          </Tooltip>
          <Tooltip title="下划线">
            <EnhancedButton
              type={editorState.isUnderline ? 'primary' : 'text'}
              icon={<UnderlineOutlined />}
              size="small"
              onClick={() => setEditorState(prev => ({ ...prev, isUnderline: !prev.isUnderline }))}
              variant="bounce"
            >
              下划线
            </EnhancedButton>
          </Tooltip>
      <Divider type="vertical" />
      <Tooltip title="左对齐">
        <Button
          type={editorState.alignment === 'left' ? 'primary' : 'text'}
          icon={<AlignLeftOutlined />}
          size="small"
          onClick={() => setEditorState(prev => ({ ...prev, alignment: 'left' }))}
        />
      </Tooltip>
      <Tooltip title="居中对齐">
        <Button
          type={editorState.alignment === 'center' ? 'primary' : 'text'}
          icon={<AlignCenterOutlined />}
          size="small"
          onClick={() => setEditorState(prev => ({ ...prev, alignment: 'center' }))}
        />
      </Tooltip>
      <Tooltip title="右对齐">
        <Button
          type={editorState.alignment === 'right' ? 'primary' : 'text'}
          icon={<AlignRightOutlined />}
          size="small"
          onClick={() => setEditorState(prev => ({ ...prev, alignment: 'right' }))}
        />
      </Tooltip>
      <Divider type="vertical" />
      <Tooltip title="有序列表">
        <Button type="text" icon={<OrderedListOutlined />} size="small" />
      </Tooltip>
      <Tooltip title="无序列表">
        <Button type="text" icon={<UnorderedListOutlined />} size="small" />
      </Tooltip>
    </Space>
  );

  // 插入内容菜单
  const insertMenuItems = [
    {
      key: 'image',
      label: '插入图片',
      icon: <PictureOutlined />,
      onClick: () => setShowInsertModal(true)
    },
    {
      key: 'table',
      label: '插入表格',
      icon: <TableOutlined />
    },
    {
      key: 'link',
      label: '插入链接',
      icon: <LinkOutlined />
    }
  ];

  // 分享菜单
  const shareMenuItems = [
    {
      key: 'link',
      label: '生成分享链接',
      icon: <LinkOutlined />
    },
    {
      key: 'export',
      label: '导出PDF',
      icon: <FileTextOutlined />
    }
  ];

  // 文档历史版本数据
  const documentVersions = [
    {
      id: '1',
      version: 'v1.3',
      timestamp: '2024-01-15 14:30:25',
      author: '张三',
      description: '完善数据分析部分，添加图表说明'
    },
    {
      id: '2',
      version: 'v1.2',
      timestamp: '2024-01-15 10:15:42',
      author: '张三',
      description: '修订结论建议，优化格式'
    },
    {
      id: '3',
      version: 'v1.1',
      timestamp: '2024-01-14 16:45:18',
      author: '张三',
      description: '初始版本创建'
    }
  ];

  return (
    <div className={`report-editor ${editorState.isFullscreen ? 'fullscreen' : ''}`}>
      {/* 顶部工具栏 */}
      <motion.div
        className="editor-toolbar"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          background: '#ffffff',
          borderBottom: '1px solid var(--border-color)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        {/* 左侧工具组 */}
        <Space size="middle" wrap>
          <Space size="small">
            <EnhancedButton
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={isSaving}
              variant="glow"
            >
              {isSaving ? '保存中...' : '保存'}
            </EnhancedButton>
            <EnhancedButton icon={<UndoOutlined />} disabled variant="pulse">撤销</EnhancedButton>
            <EnhancedButton icon={<RedoOutlined />} disabled variant="pulse">重做</EnhancedButton>
          </Space>

          <Divider type="vertical" />

          {/* 字体设置 */}
          <Space size="small">
            <Select
              value={editorState.fontFamily}
              style={{ width: 120 }}
              size="small"
              options={fontFamilyOptions}
              onChange={(value) => setEditorState(prev => ({ ...prev, fontFamily: value }))}
            />
            <Select
              value={editorState.fontSize}
              style={{ width: 80 }}
              size="small"
              options={fontSizeOptions}
              onChange={(value) => setEditorState(prev => ({ ...prev, fontSize: value }))}
            />
          </Space>

          <Divider type="vertical" />

          {/* 格式化工具 */}
          {formatToolbar}

          <Divider type="vertical" />

          {/* 颜色工具 */}
          <Space size="small">
            <Tooltip title="字体颜色">
              <ColorPicker
                value={editorState.textColor}
                onChange={(color) => setEditorState(prev => ({ ...prev, textColor: color.toHexString() }))}
                size="small"
              >
                <Button type="text" icon={<FontColorsOutlined />} size="small" />
              </ColorPicker>
            </Tooltip>
            <Tooltip title="背景颜色">
              <ColorPicker
                value={editorState.backgroundColor}
                onChange={(color) => setEditorState(prev => ({ ...prev, backgroundColor: color.toHexString() }))}
                size="small"
              >
                <Button type="text" icon={<BgColorsOutlined />} size="small" />
              </ColorPicker>
            </Tooltip>
          </Space>

          <Divider type="vertical" />

          {/* 插入工具 */}
          <Dropdown menu={{ items: insertMenuItems }} trigger={['click']}>
            <Button type="text" icon={<PictureOutlined />} size="small">
              插入
            </Button>
          </Dropdown>
        </Space>

        {/* 右侧工具组 */}
        <Space size="small">
          <Tooltip title="预览模式">
            <EnhancedButton
              type={isPreviewMode ? 'primary' : 'text'}
              icon={<EyeOutlined />}
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              variant="pulse"
            >
              预览
            </EnhancedButton>
          </Tooltip>
          <Tooltip title="全屏编辑">
            <Button
              type="text"
              icon={editorState.isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={() => setEditorState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }))}
            />
          </Tooltip>
          <Button
            type="text"
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
          >
            打印
          </Button>
          <Dropdown menu={{ items: shareMenuItems }} trigger={['click']}>
            <Button type="text" icon={<ShareAltOutlined />}>
              分享
            </Button>
          </Dropdown>
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={() => setShowSettingsModal(true)}
          />
        </Space>
      </motion.div>

      {/* 编辑器主体 */}
      <div className="editor-main" style={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
        {/* 左侧大纲面板 */}
        <motion.div
          className="editor-outline"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={{
            width: '240px',
            background: '#fafafa',
            borderRight: '1px solid var(--border-color)',
            padding: '16px',
            overflow: 'auto'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <Title level={5} style={{ margin: 0 }}>文档大纲</Title>
            <Tooltip title={isMarkdownMode ? '关闭Markdown模式' : '开启Markdown模式'}>
              <Switch
                size="small"
                checked={isMarkdownMode}
                onChange={setIsMarkdownMode}
                checkedChildren="MD"
                unCheckedChildren="TXT"
              />
            </Tooltip>
          </div>
          <div className="outline-tree">
            {outline.length > 0 ? (
              outline.map((item) => (
                <div 
                  key={item.id}
                  className="outline-item" 
                  style={{ 
                    padding: '6px 8px', 
                    paddingLeft: `${8 + (item.level - 1) * 16}px`,
                    cursor: 'pointer',
                    borderRadius: '4px',
                    marginBottom: '2px',
                    fontSize: item.level === 1 ? '13px' : '12px'
                  }}
                  onClick={() => scrollToOutlineItem(item.line)}
                >
                  <Text 
                    type={item.level > 1 ? 'secondary' : 'default'}
                    style={{ 
                      fontWeight: item.level === 1 ? 500 : 400,
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={item.text}
                  >
                    {item.text}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '10px', opacity: 0.6 }}>
                    第{item.line}行
                  </Text>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  暂无大纲内容
                  <br />
                  <span style={{ fontSize: '11px' }}>
                    支持识别标题格式：<br />
                    # 标题 (Markdown)<br />
                    1. 标题 (数字)<br />
                    一、标题 (中文)
                  </span>
                </Text>
              </div>
            )}
          </div>
        </motion.div>

        {/* 中间编辑区域 */}
        <motion.div
          className="editor-content"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          style={{
            flex: 1,
            background: '#f5f5f5',
            padding: '24px',
            overflow: 'auto'
          }}
        >
          {/* 文档页面 */}
          <div
            ref={editorRef}
            className="document-page"
            style={{
              background: editorState.backgroundColor,
              minHeight: '800px',
              maxWidth: '800px',
              margin: '0 auto',
              padding: '60px 80px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              fontFamily: editorState.fontFamily,
              fontSize: `${editorState.fontSize}px`,
              color: editorState.textColor,
              lineHeight: 1.8
            }}
          >
            {/* 文档标题 */}
            <Input
              value={editorState.title}
              onChange={(e) => setEditorState(prev => ({ ...prev, title: e.target.value }))}
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                textAlign: 'center',
                border: 'none',
                background: 'transparent',
                marginBottom: '40px'
              }}
              placeholder="请输入报告标题"
            />

            {/* 文档内容 */}
            {isPreviewMode ? (
              <div
                style={{
                  textAlign: editorState.alignment,
                  fontWeight: editorState.isBold ? 'bold' : 'normal',
                  fontStyle: editorState.isItalic ? 'italic' : 'normal',
                  textDecoration: editorState.isUnderline ? 'underline' : 'none',
                  whiteSpace: 'pre-wrap'
                }}
                dangerouslySetInnerHTML={{
                  __html: isMarkdownMode ? renderMarkdown(editorState.content || '暂无内容') : (editorState.content || '暂无内容')
                }}
              />
            ) : (
              <TextArea
                value={editorState.content}
                onChange={(e) => setEditorState(prev => ({ ...prev, content: e.target.value }))}
                style={{
                  border: 'none',
                  background: 'transparent',
                  resize: 'none',
                  textAlign: editorState.alignment,
                  fontWeight: editorState.isBold ? 'bold' : 'normal',
                  fontStyle: editorState.isItalic ? 'italic' : 'normal',
                  textDecoration: editorState.isUnderline ? 'underline' : 'none',
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  color: 'inherit',
                  lineHeight: 'inherit'
                }}
                autoSize={{ minRows: 20 }}
                placeholder={isMarkdownMode ? "开始编写您的报告内容...\n\n支持Markdown语法：\n# 一级标题\n## 二级标题\n**粗体** *斜体*\n`代码` [链接](url)" : "开始编写您的报告内容..."}
              />
            )}
          </div>
        </motion.div>

        {/* 右侧属性面板 */}
        <motion.div
          className="editor-properties"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          style={{
            width: '280px',
            background: '#fafafa',
            borderLeft: '1px solid var(--border-color)',
            padding: '16px',
            overflow: 'auto'
          }}
        >
          <Title level={5} style={{ marginBottom: '16px' }}>文档属性</Title>
          
          {/* 文档信息 */}
          <Card size="small" style={{ marginBottom: '16px' }}>
            <Row gutter={[8, 8]}>
              <Col span={24}>
                <Text type="secondary">字数统计</Text>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  {wordCount.toLocaleString()}
                </div>
              </Col>
              <Col span={24}>
                <Text type="secondary">最后保存</Text>
                <div style={{ fontSize: '12px' }}>
                  <ClockCircleOutlined style={{ marginRight: '4px' }} />
                  {lastSaved.toLocaleTimeString()}
                </div>
              </Col>
            </Row>
          </Card>

          {/* 文档历史版本 */}
          <Card size="small">
            <Title level={5} style={{ marginBottom: '12px' }}>
              <HistoryOutlined style={{ marginRight: '8px' }} />
              历史版本 ({documentVersions.length})
            </Title>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {documentVersions.map((version, index) => (
                <div 
                  key={version.id}
                  style={{ 
                    padding: '8px', 
                    background: index === 0 ? '#e6f7ff' : '#f0f0f0', 
                    borderRadius: '6px',
                    border: index === 0 ? '1px solid #91d5ff' : 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => message.info(`切换到版本 ${version.version}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: '12px', color: index === 0 ? '#1890ff' : '#333' }}>
                      {version.version}
                      {index === 0 && <span style={{ marginLeft: '4px', fontSize: '10px' }}>(当前)</span>}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '10px' }}>
                      {version.timestamp.split(' ')[1]}
                    </Text>
                  </div>
                  <div style={{ marginTop: '4px', fontSize: '11px', color: '#666' }}>
                    {version.author} • {version.timestamp.split(' ')[0]}
                  </div>
                  <div style={{ marginTop: '2px', fontSize: '11px', color: '#999' }}>
                    {version.description}
                  </div>
                </div>
              ))}
            </Space>
          </Card>
        </motion.div>
      </div>

      {/* 底部状态栏 */}
      <motion.div
        className="editor-statusbar"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        style={{
          background: '#fafafa',
          borderTop: '1px solid var(--border-color)',
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#666'
        }}
      >
        <Space size="large">
          <span>第 1 页，共 1 页</span>
          <span>字数: {wordCount}</span>
          <span>字符数: {editorState.content.length}</span>
        </Space>
        <Space size="middle">
          <span>缩放: 100%</span>
          <Button type="text" size="small" icon={<HistoryOutlined />}>
            版本历史
          </Button>
        </Space>
      </motion.div>

      {/* 插入内容模态框 */}
      <Modal
        title="插入图片"
        open={showInsertModal}
        onCancel={() => setShowInsertModal(false)}
        footer={null}
        width={600}
      >
        <Upload.Dragger
          name="file"
          multiple={false}
          accept="image/*"
          beforeUpload={() => false}
          style={{ marginBottom: '16px' }}
        >
          <p className="ant-upload-drag-icon">
            <PictureOutlined style={{ fontSize: '48px', color: 'var(--primary-color)' }} />
          </p>
          <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
          <p className="ant-upload-hint">支持 JPG、PNG、GIF 格式，文件大小不超过 10MB</p>
        </Upload.Dragger>
      </Modal>

      {/* 设置模态框 */}
      <Modal
        title="编辑器设置"
        open={showSettingsModal}
        onCancel={() => setShowSettingsModal(false)}
        footer={null}
        width={500}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text strong>自动保存间隔</Text>
            <Slider
              min={10}
              max={300}
              defaultValue={30}
              marks={{ 10: '10s', 60: '1min', 180: '3min', 300: '5min' }}
              style={{ marginTop: '8px' }}
            />
          </div>
          <div>
            <Text strong>编辑器主题</Text>
            <Select
              defaultValue="light"
              style={{ width: '100%', marginTop: '8px' }}
              options={[
                { label: '浅色主题', value: 'light' },
                { label: '深色主题', value: 'dark' },
                { label: '护眼主题', value: 'green' }
              ]}
            />
          </div>
        </Space>
      </Modal>

      <style>{`
        .report-editor {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .report-editor.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          background: white;
        }
        
        .document-page {
          transition: all 0.3s ease;
        }
        
        .document-page:hover {
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
        }
        
        .outline-item:hover {
          background: rgba(24, 144, 255, 0.1);
          border-radius: 4px;
        }
        
        @media (max-width: 768px) {
          .editor-outline,
          .editor-properties {
            display: none;
          }
          
          .editor-toolbar {
            padding: 8px 16px;
          }
          
          .document-page {
            padding: 40px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportEditor;