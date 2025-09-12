import React, { useState, useRef } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Space,
  message,
  Tabs,
  Upload,
  ColorPicker,
  Slider,
  Switch,
  Divider
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  SaveOutlined,
  UploadOutlined,
  CopyOutlined,
  FormatPainterOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import Handlebars from 'handlebars';

interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'chart' | 'table' | 'metric';
  content: string;
  style: {
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: 'normal' | 'bold';
    margin?: string;
    padding?: string;
    width?: string;
    height?: string;
  };
  position: {
    x: number;
    y: number;
  };
  data?: any;
}

interface TemplateCreatorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (template: any) => void;
  editingTemplate?: any;
}

const TemplateCreator: React.FC<TemplateCreatorProps> = ({
  visible,
  onClose,
  onSave,
  editingTemplate
}) => {
  const [form] = Form.useForm();
  const [elements, setElements] = useState<TemplateElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('design');
  const canvasRef = useRef<HTMLDivElement>(null);

  // 添加元素
  const addElement = (type: TemplateElement['type']) => {
    const newElement: TemplateElement = {
      id: `element_${Date.now()}`,
      type,
      content: getDefaultContent(type),
      style: getDefaultStyle(type),
      position: { x: 50, y: 50 },
      data: getDefaultData(type)
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  // 获取默认内容
  const getDefaultContent = (type: TemplateElement['type']): string => {
    switch (type) {
      case 'text':
        return '{{title}}';
      case 'image':
        return '{{imageUrl}}';
      case 'chart':
        return '{{#each charts}}{{name}}: {{value}}{{/each}}';
      case 'table':
        return '{{#each tableData}}<tr>{{#each this}}<td>{{this}}</td>{{/each}}</tr>{{/each}}';
      case 'metric':
        return '{{#each metrics}}{{label}}: {{value}}{{/each}}';
      default:
        return '';
    }
  };

  // 获取默认样式
  const getDefaultStyle = (type: TemplateElement['type']) => {
    const baseStyle = {
      fontSize: 14,
      color: '#333333',
      backgroundColor: 'transparent',
      textAlign: 'left' as const,
      fontWeight: 'normal' as const,
      margin: '10px',
      padding: '10px',
      width: 'auto',
      height: 'auto'
    };

    switch (type) {
      case 'text':
        return { ...baseStyle, fontSize: 16 };
      case 'metric':
        return { ...baseStyle, fontSize: 18, fontWeight: 'bold' as const };
      case 'table':
        return { ...baseStyle, width: '100%' };
      case 'chart':
        return { ...baseStyle, width: '300px', height: '200px' };
      default:
        return baseStyle;
    }
  };

  // 获取默认数据
  const getDefaultData = (type: TemplateElement['type']) => {
    switch (type) {
      case 'chart':
        return { chartType: 'bar', showLegend: true };
      case 'table':
        return { showHeader: true, bordered: true };
      default:
        return {};
    }
  };

  // 删除元素
  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  // 更新元素
  const updateElement = (id: string, updates: Partial<TemplateElement>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  // 生成模板代码
  const generateTemplateCode = (): string => {
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{title}}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .template-container { position: relative; width: 100%; min-height: 800px; }
    .element { position: absolute; }
  </style>
</head>
<body>
  <div class="template-container">
`;

    elements.forEach(element => {
      const styleStr = Object.entries(element.style)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
        .join('; ');
      
      html += `    <div class="element" style="left: ${element.position.x}px; top: ${element.position.y}px; ${styleStr}">
`;
      
      switch (element.type) {
        case 'text':
          html += `      <div>${element.content}</div>
`;
          break;
        case 'image':
          html += `      <img src="${element.content}" alt="Template Image" />
`;
          break;
        case 'chart':
          html += `      <div class="chart-container">${element.content}</div>
`;
          break;
        case 'table':
          html += `      <table border="${element.data?.bordered ? '1' : '0'}">
        ${element.data?.showHeader ? '<thead><tr>{{#each tableHeaders}}<th>{{this}}</th>{{/each}}</tr></thead>' : ''}
        <tbody>${element.content}</tbody>
      </table>
`;
          break;
        case 'metric':
          html += `      <div class="metrics">${element.content}</div>
`;
          break;
      }
      
      html += `    </div>
`;
    });

    html += `  </div>
</body>
</html>`;
    
    return html;
  };

  // 预览模板
  const previewTemplate = () => {
    const templateCode = generateTemplateCode();
    const template = Handlebars.compile(templateCode);
    
    // 模拟数据
    const mockData = {
      title: '示例报告',
      date: new Date().toLocaleDateString(),
      author: '模板创建者',
      summary: '这是一个示例报告摘要',
      metrics: [
        { label: '总收入', value: '¥1,234,567' },
        { label: '用户增长', value: '+15.2%' }
      ],
      charts: [
        { name: '收入', value: 85 },
        { name: '用户', value: 72 }
      ],
      tableHeaders: ['指标', '数值', '增长'],
      tableData: [
        ['收入', '¥1,234,567', '+15.2%'],
        ['用户', '12,345', '+8.5%']
      ]
    };
    
    try {
      const html = template(mockData);
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(html);
        newWindow.document.close();
      }
    } catch (error) {
      message.error('预览失败，请检查模板语法');
    }
  };

  // 保存模板
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const templateCode = generateTemplateCode();
      
      const template = {
        id: editingTemplate?.id || `template_${Date.now()}`,
        name: values.name,
        description: values.description,
        category: values.category,
        type: values.type,
        template: templateCode,
        elements: elements,
        thumbnail: '', // 可以生成缩略图
        tags: values.tags || [],
        isCustom: true,
        createdAt: editingTemplate?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      onSave(template);
      message.success('模板保存成功！');
      onClose();
    } catch (error) {
      message.error('请填写完整的模板信息');
    }
  };

  // 渲染元素属性编辑器
  const renderElementEditor = () => {
    const element = elements.find(el => el.id === selectedElement);
    if (!element) return null;

    return (
      <Card title="元素属性" size="small">
        <Form layout="vertical" size="small">
          <Form.Item label="内容">
            <Input.TextArea
              value={element.content}
              onChange={(e) => updateElement(element.id, { content: e.target.value })}
              rows={3}
              placeholder="支持 Handlebars 语法，如 {{title}}"
            />
          </Form.Item>
          
          <Form.Item label="字体大小">
            <Slider
              min={10}
              max={48}
              value={element.style.fontSize}
              onChange={(value) => updateElement(element.id, {
                style: { ...element.style, fontSize: value }
              })}
            />
          </Form.Item>
          
          <Form.Item label="文字颜色">
            <ColorPicker
              value={element.style.color}
              onChange={(color) => updateElement(element.id, {
                style: { ...element.style, color: color.toHexString() }
              })}
            />
          </Form.Item>
          
          <Form.Item label="背景颜色">
            <ColorPicker
              value={element.style.backgroundColor}
              onChange={(color) => updateElement(element.id, {
                style: { ...element.style, backgroundColor: color.toHexString() }
              })}
            />
          </Form.Item>
          
          <Form.Item label="对齐方式">
            <Select
              value={element.style.textAlign}
              onChange={(value) => updateElement(element.id, {
                style: { ...element.style, textAlign: value }
              })}
            >
              <Select.Option value="left">左对齐</Select.Option>
              <Select.Option value="center">居中</Select.Option>
              <Select.Option value="right">右对齐</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="字体粗细">
            <Switch
              checked={element.style.fontWeight === 'bold'}
              onChange={(checked) => updateElement(element.id, {
                style: { ...element.style, fontWeight: checked ? 'bold' : 'normal' }
              })}
              checkedChildren="粗体"
              unCheckedChildren="正常"
            />
          </Form.Item>
        </Form>
      </Card>
    );
  };

  const tabItems = [
    {
      key: 'design',
      label: '设计',
      children: (
        <Row gutter={16} style={{ height: '600px' }}>
          <Col span={4}>
            <Card title="元素库" size="small" style={{ height: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => addElement('text')}
                  block
                >
                  文本
                </Button>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => addElement('image')}
                  block
                >
                  图片
                </Button>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => addElement('chart')}
                  block
                >
                  图表
                </Button>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => addElement('table')}
                  block
                >
                  表格
                </Button>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => addElement('metric')}
                  block
                >
                  指标
                </Button>
              </Space>
            </Card>
          </Col>
          
          <Col span={14}>
            <Card title="画布" size="small" style={{ height: '100%' }}>
              <div
                ref={canvasRef}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '500px',
                  border: '1px dashed #d9d9d9',
                  backgroundColor: '#fafafa',
                  overflow: 'auto'
                }}
              >
                {elements.map(element => (
                  <div
                    key={element.id}
                    style={{
                      position: 'absolute',
                      left: element.position.x,
                      top: element.position.y,
                      border: selectedElement === element.id ? '2px solid #1890ff' : '1px dashed transparent',
                      cursor: 'move',
                      minWidth: '50px',
                      minHeight: '20px',
                      ...element.style
                    }}
                    onClick={() => setSelectedElement(element.id)}
                  >
                    <div style={{ position: 'relative' }}>
                      {element.content}
                      {selectedElement === element.id && (
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          style={{
                            position: 'absolute',
                            top: -25,
                            right: -5,
                            fontSize: '12px'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteElement(element.id);
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
          
          <Col span={6}>
            {renderElementEditor()}
          </Col>
        </Row>
      )
    },
    {
      key: 'code',
      label: '代码',
      children: (
        <div style={{ height: '600px' }}>
          <Card title="模板代码" size="small" style={{ height: '100%' }}>
            <Input.TextArea
              value={generateTemplateCode()}
              readOnly
              style={{ height: '500px', fontFamily: 'monospace' }}
            />
          </Card>
        </div>
      )
    }
  ];

  return (
    <Modal
      title="模板创建器"
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={[
        <Button key="preview" icon={<EyeOutlined />} onClick={previewTemplate}>
          预览
        </Button>,
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="save" type="primary" icon={<SaveOutlined />} onClick={handleSave}>
          保存模板
        </Button>
      ]}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="name"
              label="模板名称"
              rules={[{ required: true, message: '请输入模板名称' }]}
            >
              <Input placeholder="请输入模板名称" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="category"
              label="模板分类"
              rules={[{ required: true, message: '请选择模板分类' }]}
            >
              <Select placeholder="请选择分类">
                <Select.Option value="financial">财务报告</Select.Option>
                <Select.Option value="marketing">营销分析</Select.Option>
                <Select.Option value="operations">运营报告</Select.Option>
                <Select.Option value="sales">销售报告</Select.Option>
                <Select.Option value="custom">自定义</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="type"
              label="导出格式"
              rules={[{ required: true, message: '请选择导出格式' }]}
            >
              <Select placeholder="请选择格式">
                <Select.Option value="pdf">PDF</Select.Option>
                <Select.Option value="docx">Word</Select.Option>
                <Select.Option value="html">HTML</Select.Option>
                <Select.Option value="xlsx">Excel</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item name="description" label="模板描述">
          <Input.TextArea rows={2} placeholder="请输入模板描述" />
        </Form.Item>
      </Form>
      
      <Divider />
      
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </Modal>
  );
};

export default TemplateCreator;