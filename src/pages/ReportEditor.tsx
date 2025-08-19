import React, { useState, useRef } from 'react';
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
  message,
  Modal,
  Upload,
  Card,
  Row,
  Col,
  Typography
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
  TeamOutlined,
  CommentOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';

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

const ReportEditor: React.FC = () => {
  const { id } = useParams();

  const editorRef = useRef<HTMLDivElement>(null);
  
  const [editorState, setEditorState] = useState<EditorState>({
    title: id ? '智能报告分析 - 2024年度总结' : '新建报告',
    content: id ? '这是一个示例报告内容。您可以在这里编辑您的报告内容，支持富文本编辑功能。\n\n本报告包含以下几个部分：\n1. 数据分析概述\n2. 关键指标解读\n3. 趋势预测\n4. 建议与总结\n\n请根据您的需要进行编辑和调整。' : '',
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
  const handleSave = () => {
    setLastSaved(new Date());
    message.success('报告已保存');
  };

  // 自动保存
  React.useEffect(() => {
    const autoSave = setInterval(() => {
      if (editorState.content.trim()) {
        setLastSaved(new Date());
      }
    }, 30000); // 30秒自动保存

    return () => clearInterval(autoSave);
  }, [editorState.content]);

  // 统计字数
  React.useEffect(() => {
    const count = editorState.content.replace(/\s/g, '').length;
    setWordCount(count);
  }, [editorState.content]);

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
      key: 'team',
      label: '邀请协作',
      icon: <TeamOutlined />
    },
    {
      key: 'export',
      label: '导出PDF',
      icon: <FileTextOutlined />
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
              variant="glow"
            >
              保存
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
          <Title level={5} style={{ marginBottom: '16px' }}>文档大纲</Title>
          <div className="outline-tree">
            <div className="outline-item" style={{ padding: '8px 0', cursor: 'pointer' }}>
              <Text>1. 概述</Text>
            </div>
            <div className="outline-item" style={{ padding: '8px 0', paddingLeft: '16px', cursor: 'pointer' }}>
              <Text type="secondary">1.1 背景介绍</Text>
            </div>
            <div className="outline-item" style={{ padding: '8px 0', paddingLeft: '16px', cursor: 'pointer' }}>
              <Text type="secondary">1.2 目标设定</Text>
            </div>
            <div className="outline-item" style={{ padding: '8px 0', cursor: 'pointer' }}>
              <Text>2. 数据分析</Text>
            </div>
            <div className="outline-item" style={{ padding: '8px 0', cursor: 'pointer' }}>
              <Text>3. 结论建议</Text>
            </div>
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
              >
                {editorState.content || '暂无内容'}
              </div>
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
                placeholder="开始编写您的报告内容..."
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

          {/* 协作信息 */}
          <Card size="small" style={{ marginBottom: '16px' }}>
            <Title level={5} style={{ marginBottom: '12px' }}>
              <TeamOutlined style={{ marginRight: '8px' }} />
              协作成员
            </Title>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px'
                }}>
                  张
                </div>
                <Text>张三 (编辑中)</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#52c41a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px'
                }}>
                  李
                </div>
                <Text type="secondary">李四 (查看中)</Text>
              </div>
            </Space>
          </Card>

          {/* 评论面板 */}
          <Card size="small">
            <Title level={5} style={{ marginBottom: '12px' }}>
              <CommentOutlined style={{ marginRight: '8px' }} />
              评论 (2)
            </Title>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ padding: '8px', background: '#f0f0f0', borderRadius: '6px' }}>
                <Text strong style={{ fontSize: '12px' }}>王五</Text>
                <Text type="secondary" style={{ fontSize: '11px', marginLeft: '8px' }}>2分钟前</Text>
                <div style={{ marginTop: '4px', fontSize: '12px' }}>
                  这个数据分析部分需要补充更多细节
                </div>
              </div>
              <div style={{ padding: '8px', background: '#f0f0f0', borderRadius: '6px' }}>
                <Text strong style={{ fontSize: '12px' }}>赵六</Text>
                <Text type="secondary" style={{ fontSize: '11px', marginLeft: '8px' }}>5分钟前</Text>
                <div style={{ marginTop: '4px', fontSize: '12px' }}>
                  整体结构很清晰，建议增加图表展示
                </div>
              </div>
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