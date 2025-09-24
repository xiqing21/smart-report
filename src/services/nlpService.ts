// import { message } from 'antd';

// 图表配置接口
export interface ChartConfig {
  type: string;
  title: string;
  data: any[];
  options: any;
  description?: string;
}

// 智谱AI API配置
// const ZHIPU_API_CONFIG = {
//   baseURL: 'https://open.bigmodel.cn/api/paas/v4',
//   model: 'glm-4',
//   // 注意：实际使用时需要配置真实的API Key
//   apiKey: process.env.REACT_APP_ZHIPU_API_KEY || 'demo-key',
// };

// 图表类型映射
const CHART_TYPE_MAPPING = {
  '折线图': 'line',
  '线图': 'line',
  '趋势图': 'line',
  '柱状图': 'bar',
  '柱图': 'bar',
  '条形图': 'bar',
  '饼图': 'pie',
  '圆饼图': 'pie',
  '散点图': 'scatter',
  '点图': 'scatter',
  '面积图': 'area',
  '区域图': 'area',
  '雷达图': 'radar',
  '蜘蛛图': 'radar',
  '热力图': 'heatmap',
  '热图': 'heatmap',
  '漏斗图': 'funnel',
};

// 关键词提取
const extractKeywords = (text: string) => {
  const keywords = {
    chartType: '',
    dataType: '',
    timeRange: '',
    metrics: [] as string[],
    dimensions: [] as string[],
  };

  const lowerText = text.toLowerCase();

  // 提取图表类型
  for (const [keyword, type] of Object.entries(CHART_TYPE_MAPPING)) {
    if (lowerText.includes(keyword.toLowerCase())) {
      keywords.chartType = type;
      break;
    }
  }

  // 提取数据类型关键词
  const dataKeywords = ['销售', '收入', '用户', '访问', '转化', '点击', '浏览', '下载'];
  dataKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      keywords.metrics.push(keyword);
    }
  });

  // 提取时间范围
  const timeKeywords = ['月度', '季度', '年度', '日', '周', '月', '年'];
  timeKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      keywords.timeRange = keyword;
    }
  });

  // 提取维度
  const dimensionKeywords = ['地区', '城市', '产品', '类别', '渠道', '来源'];
  dimensionKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      keywords.dimensions.push(keyword);
    }
  });

  return keywords;
};

// 调用智谱AI API（模拟实现）
const callZhipuAI = async (prompt: string): Promise<any> => {
  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 由于这是演示版本，我们使用本地解析逻辑
  // 实际项目中应该调用真实的智谱AI API
  const keywords = extractKeywords(prompt);
  
  return {
    chartType: keywords.chartType || 'line',
    title: generateTitle(prompt, keywords),
    dataStructure: inferDataStructure(keywords),
    styling: generateStyling(keywords.chartType || 'line'),
  };
};

// 生成图表标题
const generateTitle = (prompt: string, keywords: any): string => {
  if (keywords.metrics.length > 0 && keywords.timeRange) {
    return `${keywords.metrics[0]}${keywords.timeRange}趋势图`;
  }
  
  if (keywords.metrics.length > 0) {
    return `${keywords.metrics[0]}数据分析`;
  }
  
  if (keywords.chartType === 'pie') {
    return '数据分布图';
  }
  
  return '数据可视化图表';
};

// 推断数据结构
const inferDataStructure = (keywords: any) => {
  if (keywords.chartType === 'pie') {
    return {
      type: 'categorical',
      xField: 'name',
      yField: 'value',
    };
  }
  
  if (keywords.timeRange) {
    return {
      type: 'timeSeries',
      xField: 'date',
      yField: 'value',
    };
  }
  
  return {
    type: 'numerical',
    xField: 'category',
    yField: 'value',
  };
};

// 生成样式配置
const generateStyling = (chartType: string) => {
  const baseStyle = {
    color: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
  };
  
  switch (chartType) {
    case 'line':
      return {
        ...baseStyle,
        smooth: true,
        areaStyle: { opacity: 0.3 },
      };
    case 'bar':
      return {
        ...baseStyle,
        barWidth: '60%',
      };
    case 'pie':
      return {
        ...baseStyle,
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
      };
    default:
      return baseStyle;
  }
};

// 生成ECharts配置
const generateEChartsOption = (aiResult: any, data: any[]): any => {
  const { chartType, title, styling } = aiResult;
  
  const baseOption = {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: chartType === 'pie' ? 'item' : 'axis',
    },
    legend: {
      bottom: '5%',
      left: 'center',
    },
    color: styling.color,
  };
  
  switch (chartType) {
    case 'pie':
      return {
        ...baseOption,
        series: [{
          name: '数据',
          type: 'pie',
          radius: styling.radius,
          center: styling.center,
          data: data.map(item => ({
            value: item.value,
            name: item.name || item.category || item.month,
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
      
    case 'bar':
      return {
        ...baseOption,
        grid: styling.grid,
        xAxis: {
          type: 'category',
          data: data.map(item => item.name || item.category || item.month),
        },
        yAxis: {
          type: 'value',
        },
        series: [{
          data: data.map(item => item.value),
          type: 'bar',
          barWidth: styling.barWidth,
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
          },
        }],
      };
      
    case 'line':
    default:
      return {
        ...baseOption,
        grid: styling.grid,
        xAxis: {
          type: 'category',
          data: data.map(item => item.name || item.category || item.month),
        },
        yAxis: {
          type: 'value',
        },
        series: [{
          data: data.map(item => item.value),
          type: 'line',
          smooth: styling.smooth,
          areaStyle: styling.areaStyle,
          lineStyle: {
            width: 3,
          },
          symbolSize: 6,
        }],
      };
  }
};

// 智能图表类型推荐
export const recommendChartType = (data: any[]): string[] => {
  if (!data || data.length === 0) return ['line'];
  
  const recommendations = [];
  
  // 基于数据特征推荐
  if (data.length <= 8) {
    recommendations.push('pie'); // 少量数据适合饼图
  }
  
  if (data.some(item => item.date || item.month || item.time)) {
    recommendations.push('line'); // 时间序列数据适合折线图
  }
  
  if (data.length > 3) {
    recommendations.push('bar'); // 多类别数据适合柱状图
  }
  
  // 如果有两个数值字段，推荐散点图
  const numericFields = Object.keys(data[0] || {}).filter(key => 
    typeof data[0][key] === 'number'
  );
  if (numericFields.length >= 2) {
    recommendations.push('scatter');
  }
  
  return recommendations.length > 0 ? recommendations : ['line', 'bar', 'pie'];
};

// 主要的NLP解析服务
export class NLPService {
  // 解析自然语言生成图表
  static async parseToChart(query: string, data: any[]): Promise<ChartConfig> {
    try {
      // 调用AI服务解析用户意图
      const aiResult = await callZhipuAI(query);
      
      // 生成ECharts配置
      const options = generateEChartsOption(aiResult, data);
      
      return {
        type: aiResult.chartType,
        title: aiResult.title,
        data,
        options,
        description: query,
      };
    } catch (error) {
      console.error('NLP解析失败:', error);
      
      // 降级到基础解析
      const keywords = extractKeywords(query);
      const chartType = keywords.chartType || 'line';
      
      return {
        type: chartType,
        title: generateTitle(query, keywords),
        data,
        options: generateEChartsOption({ 
          chartType, 
          title: generateTitle(query, keywords),
          styling: generateStyling(chartType)
        }, data),
        description: query,
      };
    }
  }
  
  // 智能数据分析
  static async analyzeData(data: any[]): Promise<{
    insights: string[];
    recommendations: string[];
    chartTypes: string[];
  }> {
    const insights = [];
    const recommendations = [];
    
    if (!data || data.length === 0) {
      return {
        insights: ['数据为空'],
        recommendations: ['请先上传数据'],
        chartTypes: [],
      };
    }
    
    // 数据量分析
    insights.push(`数据包含 ${data.length} 个记录`);
    
    // 数值分析
    const numericFields = Object.keys(data[0]).filter(key => 
      typeof data[0][key] === 'number'
    );
    
    if (numericFields.length > 0) {
      const values = data.map(item => item[numericFields[0]]);
      const max = Math.max(...values);
      const min = Math.min(...values);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      
      insights.push(`数值范围: ${min.toFixed(2)} - ${max.toFixed(2)}`);
      insights.push(`平均值: ${avg.toFixed(2)}`);
      
      // 趋势分析
      if (values.length > 2) {
        const trend = values[values.length - 1] > values[0] ? '上升' : '下降';
        insights.push(`整体趋势: ${trend}`);
      }
    }
    
    // 推荐建议
    if (data.length <= 5) {
      recommendations.push('数据量较少，建议使用饼图展示分布');
    } else if (data.length > 20) {
      recommendations.push('数据量较大，建议使用折线图或柱状图');
    }
    
    const chartTypes = recommendChartType(data);
    
    return {
      insights,
      recommendations,
      chartTypes,
    };
  }
  
  // 生成图表描述
  static generateChartDescription(config: ChartConfig): string {
    const { type, data } = config;
    
    switch (type) {
      case 'pie':
        return `饼图显示了 ${data.length} 个类别的数据分布情况`;
      case 'bar':
        return `柱状图对比了 ${data.length} 个项目的数值大小`;
      case 'line':
        return `折线图展示了 ${data.length} 个时间点的数据变化趋势`;
      case 'scatter':
        return `散点图显示了数据的分布和相关性`;
      default:
        return `图表展示了数据的可视化结果`;
    }
  }
}

export default NLPService;