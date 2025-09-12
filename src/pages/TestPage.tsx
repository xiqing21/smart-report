import React from 'react';
import { Card, Typography, Button, Space } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const TestPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <ExperimentOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
            <Title level={2}>测试中心</Title>
            <Paragraph>
              欢迎来到智能报告系统测试中心。这里提供了完整的功能测试和性能测试工具。
            </Paragraph>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate('/test-runner')}
            >
              进入测试运行器
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default TestPage;