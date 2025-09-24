import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Space, Spin, message, Row, Col, Typography, Tag, Divider } from 'antd';
import { SendOutlined, ReloadOutlined, DownloadOutlined, SettingOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { motion } from 'framer-motion';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

// 图表类型定义
interface ChartConfig {
  type: string;
  title: string;
  data: any[];
  options: any;
}

// 图表类型选项
const CHART_TYPES = [
  { value: 'line', label: '折线图', icon: '📈' },
  { value: 'bar', label: '柱状图', icon: '📊' },
  { value: 'pie', label: '饼图', icon: '🥧' },
  { value: 'scatter', label: '散点图', icon: '⚪' },
  { value: 'area', label: '面积图', icon: '🏔️' },
  { value: 'radar', label: '雷达图', icon: '🕸️' },
  { value: 'heatmap', label: '热力图', icon: '🔥' },
  { value: 'funnel', label: '漏斗图', icon: '🔻' },
];

// 示例数据
const SAMPLE_DATA = {
  sales: [
    { month: '1月', value: 120 },
    { month: '2月', value: 132 },
    { month: '3月', value: 101 },
    { month: '4月', value: 134 },
    { month: '5月', value: 90 },
    { month: '6月', value: 230 },
  ],
  categories: [
    { name: '电子产品', value: 335 },
    { name: '服装', value: 310 },
    { name: '食品', value: 234 },
    { name: '图书', value: 135 },
    { name: '其他', value: 148 },
  ],
};

const ChartGeneration: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  const [suggestedCharts, setSuggestedCharts] = useState<string[]>([]);
  const [selectedDataset, setSelectedDataset] = useState('sales');

  // 模拟自然语言解析
  const parseNaturalLanguage = async (input: string): Promise<ChartConfig> => {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lowerInput = input.toLowerCase();
    let chartType = 'line';
    let data = SAMPLE_DATA.sales;
    let title = '数据可视化图表';
    
    // 简单的关键词匹配逻辑
    if (lowerInput.includes('饼图') || lowerInput.includes('pie') || lowerInput.includes('占比') || lowerInput.includes('比例')) {
      chartType = 'pie';
      data = SAMPLE_DATA.categories;
      title = '分类数据占比图';
    } else if (lowerInput.includes('柱状图') || lowerInput.includes('bar') || lowerInput.includes('对比')) {
      chartType = 'bar';
      title = '数据对比柱状图';
    } else if (lowerInput.includes('折线图') || lowerInput.includes('line') || lowerInput.includes('趋势')) {
      chartType = 'line';
      title = '数据趋势折线图';
    } else if (lowerInput.includes('散点图') || lowerInput.includes('scatter') || lowerInput.includes('分布')) {
      chartType = 'scatter';
      title = '数据分布散点图';
    }
    
    return generateChartConfig(chartType, data, title);
  };

  // 生成图表配置
  const generateChartConfig = (type: string, data: any[], title: string): ChartConfig => {
    // Handle different data structures
    const processedData = data.length > 0 && 'name' in data[0] 
      ? data.map((item: any) => ({ month: item.name, value: item.value }))
      : data;
    let options: any = {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        bottom: '5%',
        left: 'center',
      },
    };

    switch (type) {
      case 'pie':
        options = {
          ...options,
          series: [{
            name: '数据',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '50%'],
            data: processedData.map(item => ({
              value: item.value,
              name: item.name || item.month,
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          }],
        };
        break;
      case 'bar':
        options = {
          ...options,
          xAxis: {
            type: 'category',
            data: processedData.map(item => item.name || item.month),
          },
          yAxis: {
            type: 'value',
          },
          series: [{
            data: processedData.map(item => item.value),
            type: 'bar',
            itemStyle: {
              color: '#1890ff',
            },
          }],
        };
        break;
      case 'line':
      default:
        options = {
          ...options,
          xAxis: {
            type: 'category',
            data: processedData.map(item => item.name || item.month),
          },
          yAxis: {
            type: 'value',
          },
          series: [{
            data: processedData.map(item => item.value),
            type: 'line',
            smooth: true,
            itemStyle: {
              color: '#52c41a',
            },
            areaStyle: {
              color: 'rgba(82, 196, 26, 0.2)',
            },
          }],
        };
        break;
    }

    return {
      type,
      title,
      data: processedData,
      options,
    };
  };

  // 处理查询提交
  const handleSubmit = async () => {
    if (!query.trim()) {
      message.warning('请输入图表描述');
      return;
    }

    setLoading(true);
    try {
      const config = await parseNaturalLanguage(query);
      setChartConfig(config);
      
      // 生成推荐图表类型
      const suggestions = CHART_TYPES
        .filter(type => type.value !== config.type)
        .slice(0, 3)
        .map(type => type.value);
      setSuggestedCharts(suggestions);
      
      message.success('图表生成成功！');
    } catch (error) {
      message.error('图表生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 切换图表类型
  const switchChartType = (newType: string) => {
    if (chartConfig) {
      const newConfig = generateChartConfig(newType, chartConfig.data, chartConfig.title);
      setChartConfig(newConfig);
    }
  };

  // 下载图表
  const downloadChart = () => {
    message.info('图表下载功能开发中...');
  };

  return (
    <div className="p-8 bg-white text-gray-900 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-xl">
          <Title level={2} className="flex items-center gap-3 text-gray-900 mb-3">
            对话式图表生成
          </Title>
          <Text className="text-gray-600 text-lg">
            通过自然语言描述自动生成图表，让数据可视化更加智能便捷
          </Text>
        </div>
      </motion.div>

      <Row gutter={[24, 24]}>
          {/* 左侧输入区域 */}
          <Col xs={24} lg={8}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card 
                title={<span className="text-gray-900 text-lg">📝 图表描述</span>}
                className="bg-white border border-gray-200 rounded-2xl shadow-lg h-fit"
              >
                <Space direction="vertical" className="w-full" size="large">
                  <div>
                    <Text strong className="text-gray-700">数据集选择：</Text>
                    <Select
                      value={selectedDataset}
                      onChange={setSelectedDataset}
                      className="w-full mt-2 border border-gray-300 rounded-lg text-gray-900"
                    >
                      <Option value="sales" className="bg-white text-gray-900">销售数据</Option>
                      <Option value="categories" className="bg-white text-gray-900">分类数据</Option>
                    </Select>
                  </div>
                  
                  <div>
                    <Text strong className="text-gray-700">描述您想要的图表：</Text>
                    <TextArea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="例如：生成一个显示月度销售趋势的折线图"
                      rows={4}
                      className="w-full mt-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                    />
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSubmit}
                      loading={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 border-blue-600 text-white hover:shadow-lg transition-all duration-300 shadow-md rounded-xl"
                      size="large"
                    >
                      {loading ? '正在生成图表...' : '生成图表'}
                    </Button>
                  </motion.div>
                  
                  <div>
                    <Text strong className="text-gray-700">💡 示例查询：</Text>
                    <div className="mt-3 space-y-2">
                      {[
                        '生成销售趋势折线图',
                        '创建分类占比饼图',
                        '显示数据对比柱状图',
                      ].map((example, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Tag
                            className="cursor-pointer bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400 transition-all duration-300 rounded-full px-3 py-1"
                            onClick={() => setQuery(example)}
                          >
                            {example}
                          </Tag>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </Space>
              </Card>
            </motion.div>
          </Col>

          {/* 右侧图表展示区域 */}
          <Col xs={24} lg={16}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card
                title={<span className="text-gray-900 text-lg">📊 图表展示</span>}
                extra={
                  chartConfig && (
                    <Space>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          icon={<DownloadOutlined />}
                          onClick={downloadChart}
                          className="bg-green-600 hover:bg-green-700 border-green-600 text-white transition-all duration-300 shadow-md rounded-lg"
                        >
                          下载
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          icon={<ReloadOutlined />}
                          onClick={() => setChartConfig(null)}
                          className="bg-gray-600 hover:bg-gray-700 border-gray-600 text-white transition-all duration-300 shadow-md rounded-lg"
                        >
                          重置
                        </Button>
                      </motion.div>
                    </Space>
                  )
                }
                className="bg-white border border-gray-200 rounded-2xl shadow-lg min-h-[500px]"
              >
                {loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center h-96"
                  >
                    <Spin size="large" className="text-blue-600" />
                    <Text className="ml-3 text-gray-700">AI正在为您生成图表...</Text>
                  </motion.div>
                ) : chartConfig ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="p-6"
                  >
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                      <ReactECharts
                        option={chartConfig.options}
                        style={{ height: '400px', width: '100%' }}
                        notMerge={true}
                        lazyUpdate={true}
                      />
                    </div>
                    
                    {/* 图表类型切换 */}
                    {suggestedCharts.length > 0 && (
                      <>
                        <Divider className="border-gray-300" />
                        <div>
                          <Text strong className="text-gray-700">🔄 尝试其他图表类型：</Text>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {suggestedCharts.map(type => {
                              const chartType = CHART_TYPES.find(t => t.value === type);
                              return chartType ? (
                                <motion.div
                                  key={type}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    onClick={() => switchChartType(type)}
                                    className="bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400 transition-all duration-300 rounded-lg"
                                  >
                                    {chartType.icon} {chartType.label}
                                  </Button>
                                </motion.div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center justify-center h-96 text-gray-500"
                  >
                    <div className="text-center">
                      <motion.div 
                        className="text-6xl mb-4 text-blue-600"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        📈
                      </motion.div>
                      <Text className="text-gray-700 text-lg">请在左侧输入图表描述，开始生成您的专属图表</Text>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          </Col>
      </Row>
    </div>
  );
};

export default ChartGeneration;