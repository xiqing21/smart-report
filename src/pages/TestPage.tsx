import React, { useState } from 'react';
import { Card, Button, Input, message, Space, Divider, Typography } from 'antd';
import { aiServiceManager } from '../services/ai/AIServiceManager';
import { ReportService } from '../services/api/dataService';

const { Title, Text } = Typography;
const { TextArea } = Input;

const TestPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('请分析一下电网负荷的发展趋势');
  const [aiResponse, setAiResponse] = useState('');
  const [reportTitle, setReportTitle] = useState('AI测试报告');

  const testAIService = async () => {
    if (!prompt.trim()) {
      message.error('请输入测试提示词');
      return;
    }

    setLoading(true);
    try {
      console.log('🧪 开始测试AI服务...');
      const response = await aiServiceManager.callAI({
        prompt: prompt,
        systemPrompt: '你是一个专业的电网数据分析师，请提供专业、准确的分析。',
        parameters: {
          temperature: 0.7,
          maxTokens: 1000
        }
      });
      
      console.log('✅ AI服务响应:', response);
      setAiResponse(response.content);
      message.success(`AI服务调用成功！\n提供商: ${response.provider} (${response.model})\n响应时间: ${response.responseTime}ms`);
    } catch (error) {
      console.error('❌ AI服务调用失败:', error);
      message.error(`AI服务调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const saveReport = async () => {
    if (!aiResponse.trim()) {
      message.error('请先生成AI回复内容');
      return;
    }

    if (!reportTitle.trim()) {
      message.error('请输入报告标题');
      return;
    }

    setLoading(true);
    try {
      console.log('💾 开始保存报告到数据库...');
      const result = await ReportService.createReport({
        title: reportTitle,
        content: {
          prompt: prompt,
          aiResponse: aiResponse,
          generatedAt: new Date().toISOString()
        },
        status: 'draft'
      });
      
      if (result.success && result.data) {
        console.log('✅ 报告保存成功:', result.data);
        message.success(`报告保存成功！报告ID: ${result.data.id}`);
      } else {
        throw new Error(result.error || '保存失败');
      }
    } catch (error) {
      console.error('❌ 报告保存失败:', error);
      message.error(`报告保存失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const testFullWorkflow = async () => {
    await testAIService();
    // 等待AI响应完成后再保存
    setTimeout(() => {
      if (aiResponse) {
        saveReport();
      }
    }, 1000);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>🧪 AI服务与数据存储测试</Title>
      <Text type="secondary">
        这个页面用于测试AI服务调用和数据库存储功能是否正常工作。
      </Text>
      
      <Divider />
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* AI服务测试 */}
        <Card title="🤖 AI服务测试 (当前使用: 智谱GLM)" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>测试提示词:</Text>
              <TextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="输入要测试的AI提示词"
                rows={3}
                style={{ marginTop: 8 }}
              />
            </div>
            
            <Button 
              type="primary" 
              onClick={testAIService}
              loading={loading}
              size="large"
            >
              🚀 测试AI服务调用
            </Button>
            
            {aiResponse && (
              <div>
                <Text strong>AI回复内容:</Text>
                <Card size="small" style={{ marginTop: 8, backgroundColor: '#f6ffed' }}>
                  <Text>{aiResponse}</Text>
                </Card>
              </div>
            )}
          </Space>
        </Card>
        
        {/* 数据存储测试 */}
        <Card title="💾 数据存储测试" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>报告标题:</Text>
              <Input
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="输入报告标题"
                style={{ marginTop: 8 }}
              />
            </div>
            
            <Button 
              type="primary" 
              onClick={saveReport}
              loading={loading}
              disabled={!aiResponse}
              size="large"
            >
              💾 保存报告到数据库
            </Button>
          </Space>
        </Card>
        
        {/* 完整流程测试 */}
        <Card title="🔄 完整流程测试" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>测试完整的AI调用 → 数据存储流程 (使用智谱GLM)</Text>
            <Button 
              type="primary" 
              onClick={testFullWorkflow}
              loading={loading}
              size="large"
              style={{ backgroundColor: '#722ed1' }}
            >
              🎯 执行完整测试流程
            </Button>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default TestPage;