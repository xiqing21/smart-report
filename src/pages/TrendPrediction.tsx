import React, { useState, useEffect } from 'react';
import { Card, Button, Select, DatePicker, Space, Spin, message, Row, Col, Typography, Statistic, Alert, Tag, Divider, Progress } from 'antd';
import { PlayCircleOutlined, StopOutlined, DownloadOutlined, SettingOutlined, RiseOutlined, WarningOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { motion } from 'framer-motion';
import * as dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 预测算法类型
interface PredictionAlgorithm {
  key: string;
  name: string;
  description: string;
  accuracy: number;
}

// 预测结果接口
interface PredictionResult {
  algorithm: string;
  predictions: Array<{
    date: string;
    value: number;
    confidence: number;
  }>;
  accuracy: number;
  trend: 'up' | 'down' | 'stable';
  anomalies: Array<{
    date: string;
    value: number;
    severity: 'low' | 'medium' | 'high';
    reason: string;
  }>;
}

// 预警规则接口
interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  enabled: boolean;
}

// 可用的预测算法
const ALGORITHMS: PredictionAlgorithm[] = [
  {
    key: 'arima',
    name: 'ARIMA模型',
    description: '自回归积分滑动平均模型，适用于平稳时间序列',
    accuracy: 85,
  },
  {
    key: 'linear',
    name: '线性回归',
    description: '基于线性趋势的预测模型，简单高效',
    accuracy: 78,
  },
  {
    key: 'exponential',
    name: '指数平滑',
    description: '指数平滑预测，适用于有趋势和季节性的数据',
    accuracy: 82,
  },
  {
    key: 'lstm',
    name: 'LSTM神经网络',
    description: '长短期记忆网络，适用于复杂非线性时间序列',
    accuracy: 88,
  },
];

// 模拟历史数据
const generateHistoricalData = () => {
  const data = [];
  const startDate = dayjs().subtract(12, 'month');
  
  for (let i = 0; i < 365; i++) {
    const date = startDate.add(i, 'day').format('YYYY-MM-DD');
    const baseValue = 100 + Math.sin(i * 0.02) * 20 + i * 0.1;
    const noise = (Math.random() - 0.5) * 10;
    const value = Math.max(0, baseValue + noise);
    
    data.push({ date, value });
  }
  
  return data;
};

const TrendPrediction: React.FC = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('arima');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(3, 'month'),
    dayjs(),
  ]);
  const [predictionDays, setPredictionDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [historicalData] = useState(generateHistoricalData());
  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: '1',
      name: '数值异常高',
      condition: 'value > threshold',
      threshold: 150,
      enabled: true,
    },
    {
      id: '2',
      name: '数值异常低',
      condition: 'value < threshold',
      threshold: 50,
      enabled: true,
    },
    {
      id: '3',
      name: '增长率异常',
      condition: 'growth_rate > threshold',
      threshold: 20,
      enabled: false,
    },
  ]);

  // 模拟预测分析
  const runPrediction = async () => {
    setLoading(true);
    
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const algorithm = ALGORITHMS.find(a => a.key === selectedAlgorithm)!;
      const startDate = dayjs();
      
      // 生成预测数据
      const predictions = [];
      const baseValue = historicalData[historicalData.length - 1].value;
      
      for (let i = 1; i <= predictionDays; i++) {
        const date = startDate.add(i, 'day').format('YYYY-MM-DD');
        const trend = selectedAlgorithm === 'linear' ? 0.2 : Math.sin(i * 0.05) * 0.5;
        const value = baseValue + trend * i + (Math.random() - 0.5) * 5;
        const confidence = Math.max(60, 95 - i * 0.5); // 置信度随时间递减
        
        predictions.push({ date, value: Math.max(0, value), confidence });
      }
      
      // 生成异常检测结果
      const anomalies = predictions
        .filter((_, index) => Math.random() < 0.1) // 10%概率生成异常
        .map(pred => ({
          date: pred.date,
          value: pred.value,
          severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
          reason: ['数值异常波动', '趋势突变', '季节性异常'][Math.floor(Math.random() * 3)],
        }));
      
      // 判断整体趋势
      const firstValue = predictions[0].value;
      const finalValue = predictions[predictions.length - 1].value;
      const trend = finalValue > firstValue * 1.05 ? 'up' : 
                   finalValue < firstValue * 0.95 ? 'down' : 'stable';
      
      const result: PredictionResult = {
        algorithm: algorithm.name,
        predictions,
        accuracy: algorithm.accuracy,
        trend,
        anomalies,
      };
      
      setPredictionResult(result);
      message.success('预测分析完成！');
    } catch (error) {
      message.error('预测分析失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 生成图表配置
  const getChartOption = () => {
    if (!predictionResult) return {};
    
    const historicalSeries = {
      name: '历史数据',
      type: 'line',
      data: historicalData.slice(-90).map(item => [item.date, item.value]),
      itemStyle: { color: '#1890ff' },
      lineStyle: { width: 2 },
    };
    
    const predictionSeries = {
      name: '预测数据',
      type: 'line',
      data: predictionResult.predictions.map(item => [item.date, item.value]),
      itemStyle: { color: '#52c41a' },
      lineStyle: { width: 2, type: 'dashed' },
    };
    
    const confidenceSeries = {
      name: '置信区间',
      type: 'line',
      data: predictionResult.predictions.map(item => [
        item.date,
        item.value + (item.confidence / 100) * item.value * 0.1
      ]),
      itemStyle: { color: 'rgba(82, 196, 26, 0.3)' },
      lineStyle: { width: 1, type: 'dotted' },
      areaStyle: {
        color: 'rgba(82, 196, 26, 0.1)',
      },
    };
    
    return {
      title: {
        text: '时间序列预测分析',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      legend: {
        bottom: '5%',
        left: 'center',
      },
      xAxis: {
        type: 'time',
        name: '日期',
      },
      yAxis: {
        type: 'value',
        name: '数值',
      },
      series: [historicalSeries, predictionSeries, confidenceSeries],
      dataZoom: [
        {
          type: 'inside',
          start: 70,
          end: 100,
        },
        {
          start: 70,
          end: 100,
        },
      ],
    };
  };

  // 获取趋势图标和颜色
  const getTrendInfo = (trend: string) => {
    switch (trend) {
      case 'up':
        return { icon: '📈', color: '#52c41a', text: '上升趋势' };
      case 'down':
        return { icon: '📉', color: '#ff4d4f', text: '下降趋势' };
      default:
        return { icon: '➡️', color: '#1890ff', text: '平稳趋势' };
    }
  };

  // 获取异常严重程度颜色
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      default: return 'yellow';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title level={2} className="mb-6">
          📊 趋势预测与预警系统
        </Title>
        <Text type="secondary" className="block mb-6">
          基于历史数据进行时间序列分析，预测未来趋势并提供智能预警
        </Text>

        <Row gutter={[24, 24]}>
          {/* 左侧配置区域 */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" className="w-full" size="middle">
              {/* 预测配置 */}
              <Card title="⚙️ 预测配置">
                <Space direction="vertical" className="w-full" size="middle">
                  <div>
                    <Text strong>预测算法：</Text>
                    <Select
                      value={selectedAlgorithm}
                      onChange={setSelectedAlgorithm}
                      className="w-full mt-2"
                    >
                      {ALGORITHMS.map(algo => (
                        <Option key={algo.key} value={algo.key}>
                          <div>
                            <div>{algo.name}</div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              准确率: {algo.accuracy}%
                            </Text>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </div>
                  
                  <div>
                    <Text strong>历史数据范围：</Text>
                    <RangePicker
                      value={dateRange}
                      onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                      className="w-full mt-2"
                    />
                  </div>
                  
                  <div>
                    <Text strong>预测天数：</Text>
                    <Select
                      value={predictionDays}
                      onChange={setPredictionDays}
                      className="w-full mt-2"
                    >
                      <Option value={7}>7天</Option>
                      <Option value={15}>15天</Option>
                      <Option value={30}>30天</Option>
                      <Option value={60}>60天</Option>
                      <Option value={90}>90天</Option>
                    </Select>
                  </div>
                  
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={runPrediction}
                    loading={loading}
                    className="w-full"
                    size="large"
                  >
                    {loading ? '正在分析预测...' : '开始预测分析'}
                  </Button>
                </Space>
              </Card>

              {/* 预警规则 */}
              <Card title={<span className="text-white/90">🚨 预警规则</span>} className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg">
                <Space direction="vertical" className="w-full" size="small">
                  {alertRules.map(rule => (
                    <motion.div
                      key={rule.id}
                      className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex-1">
                        <Text strong className="text-white/90">{rule.name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }} className="text-white/60">
                          {rule.condition.replace('threshold', rule.threshold.toString())}
                        </Text>
                      </div>
                      <Tag color={rule.enabled ? 'green' : 'default'}>
                        {rule.enabled ? '启用' : '禁用'}
                      </Tag>
                    </motion.div>
                  ))}
                </Space>
              </Card>
            </Space>
          </Col>

          {/* 右侧结果展示区域 */}
          <Col xs={24} lg={16}>
            <Space direction="vertical" className="w-full" size="middle">
              {/* 预测结果统计 */}
              {predictionResult && (
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={6}>
                    <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg">
                      <Statistic
                        title={<span className="text-white/80">预测算法</span>}
                        value={predictionResult.algorithm}
                        valueStyle={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg">
                      <Statistic
                        title={<span className="text-white/80">预测准确率</span>}
                        value={predictionResult.accuracy}
                        suffix="%"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="趋势方向"
                        value={getTrendInfo(predictionResult.trend).text}
                        prefix={getTrendInfo(predictionResult.trend).icon}
                        valueStyle={{ 
                          color: getTrendInfo(predictionResult.trend).color,
                          fontSize: '16px'
                        }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="异常检测"
                        value={predictionResult.anomalies.length}
                        suffix="个异常点"
                        valueStyle={{ color: predictionResult.anomalies.length > 0 ? '#ff4d4f' : '#52c41a' }}
                      />
                    </Card>
                  </Col>
                </Row>
              )}

              {/* 图表展示 */}
              <Card
                title="📈 预测结果可视化"
                extra={
                  predictionResult && (
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() => message.info('导出功能开发中...')}
                    >
                      导出报告
                    </Button>
                  )
                }
                className="min-h-[500px]"
              >
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-96">
                    <Spin size="large" />
                    <Text className="mt-4">AI正在进行时间序列分析...</Text>
                    <Progress percent={Math.random() * 100} className="w-64 mt-2" />
                  </div>
                ) : predictionResult ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ReactECharts
                      option={getChartOption()}
                      style={{ height: '400px', width: '100%' }}
                      notMerge={true}
                      lazyUpdate={true}
                    />
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center h-96 text-gray-400">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🔮</div>
                      <Text type="secondary">请配置预测参数并开始分析</Text>
                    </div>
                  </div>
                )}
              </Card>

              {/* 异常检测结果 */}
              {predictionResult && predictionResult.anomalies.length > 0 && (
                <Card title="⚠️ 异常检测结果">
                  <Space direction="vertical" className="w-full" size="small">
                    {predictionResult.anomalies.map((anomaly, index) => (
                      <Alert
                        key={index}
                        message={`${anomaly.date} - ${anomaly.reason}`}
                        description={`异常值: ${anomaly.value.toFixed(2)}`}
                        type={anomaly.severity === 'high' ? 'error' : anomaly.severity === 'medium' ? 'warning' : 'info'}
                        showIcon
                      />
                    ))}
                  </Space>
                </Card>
              )}
            </Space>
          </Col>
        </Row>
      </motion.div>
    </div>
  );
};

export default TrendPrediction;