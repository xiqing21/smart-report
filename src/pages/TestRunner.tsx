import React, { useState } from 'react';
import { Card, Button, Progress, Alert, Tabs, Typography, Space, Divider } from 'antd';
import { PlayCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { performanceTest } from '../tests/performanceTest';
import { functionalTest } from '../tests/functionalTest';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface TestStatus {
  running: boolean;
  completed: boolean;
  results: string[];
  startTime?: number;
  endTime?: number;
}

const TestRunner: React.FC = () => {
  const [performanceStatus, setPerformanceStatus] = useState<TestStatus>({
    running: false,
    completed: false,
    results: []
  });
  
  const [functionalStatus, setFunctionalStatus] = useState<TestStatus>({
    running: false,
    completed: false,
    results: []
  });

  // 捕获控制台输出
  const captureConsoleOutput = (callback: () => void, setStatus: React.Dispatch<React.SetStateAction<TestStatus>>) => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const logs: string[] = [];

    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      logs.push(`[LOG] ${message}`);
      setStatus(prev => ({ ...prev, results: [...logs] }));
      originalLog(...args);
    };

    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      logs.push(`[ERROR] ${message}`);
      setStatus(prev => ({ ...prev, results: [...logs] }));
      originalError(...args);
    };

    console.warn = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      logs.push(`[WARN] ${message}`);
      setStatus(prev => ({ ...prev, results: [...logs] }));
      originalWarn(...args);
    };

    callback();

    // 恢复原始控制台方法
    setTimeout(() => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    }, 100);
  };

  // 运行性能测试
  const runPerformanceTest = async () => {
    setPerformanceStatus({
      running: true,
      completed: false,
      results: [],
      startTime: Date.now()
    });

    try {
      captureConsoleOutput(() => {
        performanceTest.runAllTests().then(() => {
          setPerformanceStatus(prev => ({
            ...prev,
            running: false,
            completed: true,
            endTime: Date.now()
          }));
        }).catch((error) => {
          setPerformanceStatus(prev => ({
            ...prev,
            running: false,
            completed: true,
            endTime: Date.now(),
            results: [...prev.results, `[ERROR] 测试执行失败: ${error.message}`]
          }));
        });
      }, setPerformanceStatus);
    } catch (error) {
      setPerformanceStatus(prev => ({
        ...prev,
        running: false,
        completed: true,
        endTime: Date.now(),
        results: [...prev.results, `[ERROR] 测试启动失败: ${error instanceof Error ? error.message : String(error)}`]
      }));
    }
  };

  // 运行功能测试
  const runFunctionalTest = async () => {
    setFunctionalStatus({
      running: true,
      completed: false,
      results: [],
      startTime: Date.now()
    });

    try {
      captureConsoleOutput(() => {
        functionalTest.runAllTests().then(() => {
          setFunctionalStatus(prev => ({
            ...prev,
            running: false,
            completed: true,
            endTime: Date.now()
          }));
        }).catch((error) => {
          setFunctionalStatus(prev => ({
            ...prev,
            running: false,
            completed: true,
            endTime: Date.now(),
            results: [...prev.results, `[ERROR] 测试执行失败: ${error.message}`]
          }));
        });
      }, setFunctionalStatus);
    } catch (error) {
      setFunctionalStatus(prev => ({
        ...prev,
        running: false,
        completed: true,
        endTime: Date.now(),
        results: [...prev.results, `[ERROR] 测试启动失败: ${error instanceof Error ? error.message : String(error)}`]
      }));
    }
  };

  // 运行所有测试
  const runAllTests = async () => {
    await runPerformanceTest();
    // 等待性能测试完成后再运行功能测试
    setTimeout(() => {
      runFunctionalTest();
    }, 1000);
  };

  // 清除测试结果
  const clearResults = () => {
    setPerformanceStatus({ running: false, completed: false, results: [] });
    setFunctionalStatus({ running: false, completed: false, results: [] });
  };

  // 格式化测试结果显示
  const formatResults = (results: string[]) => {
    return results.map((result, index) => {
      let color = '#000';
      let icon = null;
      
      if (result.includes('[ERROR]')) {
        color = '#ff4d4f';
        icon = <CloseCircleOutlined style={{ color, marginRight: 8 }} />;
      } else if (result.includes('✅')) {
        color = '#52c41a';
        icon = <CheckCircleOutlined style={{ color, marginRight: 8 }} />;
      } else if (result.includes('❌')) {
        color = '#ff4d4f';
        icon = <CloseCircleOutlined style={{ color, marginRight: 8 }} />;
      } else if (result.includes('[WARN]')) {
        color = '#faad14';
      }
      
      return (
        <div key={index} style={{ 
          marginBottom: 4, 
          fontFamily: 'monospace', 
          fontSize: '12px',
          color,
          display: 'flex',
          alignItems: 'center'
        }}>
          {icon}
          {result}
        </div>
      );
    });
  };

  // 计算测试时长
  const getTestDuration = (status: TestStatus) => {
    if (status.startTime && status.endTime) {
      return ((status.endTime - status.startTime) / 1000).toFixed(2);
    }
    return null;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>知识库系统测试中心</Title>
      <Paragraph>
        这里可以运行系统的性能测试和功能测试，验证知识库系统的各项功能是否正常工作。
      </Paragraph>

      <Alert
        message="测试说明"
        description="性能测试将验证系统响应时间和吞吐量；功能测试将验证各个功能模块的正确性。测试过程中请保持网络连接稳定。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Space style={{ marginBottom: 24 }}>
        <Button 
          type="primary" 
          icon={<PlayCircleOutlined />}
          onClick={runPerformanceTest}
          loading={performanceStatus.running}
          disabled={functionalStatus.running}
        >
          运行性能测试
        </Button>
        <Button 
          type="primary" 
          icon={<PlayCircleOutlined />}
          onClick={runFunctionalTest}
          loading={functionalStatus.running}
          disabled={performanceStatus.running}
        >
          运行功能测试
        </Button>
        <Button 
          type="default" 
          icon={<PlayCircleOutlined />}
          onClick={runAllTests}
          loading={performanceStatus.running || functionalStatus.running}
        >
          运行所有测试
        </Button>
        <Button onClick={clearResults}>
          清除结果
        </Button>
      </Space>

      <Tabs defaultActiveKey="performance">
        <TabPane tab="性能测试" key="performance">
          <Card 
            title={
              <Space>
                <ClockCircleOutlined />
                性能测试结果
                {performanceStatus.running && <Text type="secondary">(运行中...)</Text>}
                {performanceStatus.completed && (
                  <Text type="success">
                    (完成 - 耗时: {getTestDuration(performanceStatus)}秒)
                  </Text>
                )}
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            {performanceStatus.running && (
              <Progress percent={50} status="active" style={{ marginBottom: 16 }} />
            )}
            
            {performanceStatus.results.length > 0 ? (
              <div style={{ 
                maxHeight: '400px', 
                overflowY: 'auto', 
                backgroundColor: '#f5f5f5', 
                padding: '12px', 
                borderRadius: '4px',
                border: '1px solid #d9d9d9'
              }}>
                {formatResults(performanceStatus.results)}
              </div>
            ) : (
              <Text type="secondary">点击"运行性能测试"开始测试</Text>
            )}
          </Card>
        </TabPane>

        <TabPane tab="功能测试" key="functional">
          <Card 
            title={
              <Space>
                <CheckCircleOutlined />
                功能测试结果
                {functionalStatus.running && <Text type="secondary">(运行中...)</Text>}
                {functionalStatus.completed && (
                  <Text type="success">
                    (完成 - 耗时: {getTestDuration(functionalStatus)}秒)
                  </Text>
                )}
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            {functionalStatus.running && (
              <Progress percent={50} status="active" style={{ marginBottom: 16 }} />
            )}
            
            {functionalStatus.results.length > 0 ? (
              <div style={{ 
                maxHeight: '400px', 
                overflowY: 'auto', 
                backgroundColor: '#f5f5f5', 
                padding: '12px', 
                borderRadius: '4px',
                border: '1px solid #d9d9d9'
              }}>
                {formatResults(functionalStatus.results)}
              </div>
            ) : (
              <Text type="secondary">点击"运行功能测试"开始测试</Text>
            )}
          </Card>
        </TabPane>

        <TabPane tab="测试指标" key="metrics">
          <Card title="验收标准" style={{ marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <Card size="small" title="性能指标">
                <ul>
                  <li>平均响应时间 ≤ 2秒</li>
                  <li>向量化处理速度 ≥ 100文档/分钟</li>
                  <li>并发用户支持 ≥ 50人</li>
                  <li>系统可用性 ≥ 99.5%</li>
                </ul>
              </Card>
              
              <Card size="small" title="功能指标">
                <ul>
                  <li>问答准确率 ≥ 85%</li>
                  <li>语义搜索召回率 ≥ 90%</li>
                  <li>上下文记忆准确率 ≥ 95%</li>
                  <li>文档处理成功率 ≥ 98%</li>
                </ul>
              </Card>
              
              <Card size="small" title="容量指标">
                <ul>
                  <li>支持文档数量 ≥ 10万篇</li>
                  <li>单文档最大大小 ≤ 10MB</li>
                  <li>向量维度 = 1024</li>
                  <li>最大上下文长度 = 4000 tokens</li>
                </ul>
              </Card>
            </div>
          </Card>
          
          <Card title="测试覆盖范围">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <Title level={5}>向量化服务</Title>
                <ul>
                  <li>单文本向量化</li>
                  <li>批量文本向量化</li>
                  <li>文档处理</li>
                  <li>语义搜索</li>
                </ul>
              </div>
              
              <div>
                <Title level={5}>智能问答</Title>
                <ul>
                  <li>基础问答</li>
                  <li>知识检索问答</li>
                  <li>上下文问答</li>
                  <li>多轮对话</li>
                </ul>
              </div>
              
              <div>
                <Title level={5}>上下文管理</Title>
                <ul>
                  <li>创建对话上下文</li>
                  <li>获取对话历史</li>
                  <li>添加对话消息</li>
                  <li>删除对话上下文</li>
                </ul>
              </div>
              
              <div>
                <Title level={5}>错误处理</Title>
                <ul>
                  <li>输入验证</li>
                  <li>异常捕获</li>
                  <li>错误恢复</li>
                  <li>降级处理</li>
                </ul>
              </div>
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TestRunner;