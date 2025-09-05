import React, { useState, useEffect } from 'react';
import { Modal, Progress, Card, Row, Col, Typography, Space, Button } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DatabaseOutlined,
  BarChartOutlined,
  FileTextOutlined,
  SearchOutlined,
  EditOutlined,
  CheckCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface Agent {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  tasks: string[];
  color: string;
  gradient: string;
}

interface AgentProgressModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const AgentProgressModal: React.FC<AgentProgressModalProps> = ({ visible, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [agentProgress, setAgentProgress] = useState<{ [key: string]: number }>({});
  const [completedAgents, setCompletedAgents] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 五大智能体配置
  const agents: Agent[] = [
    {
      id: 'data-collection',
      name: '数据采集智能体',
      icon: <DatabaseOutlined />,
      description: '从营销2.0、智能电表、客服、设备管理、采集2.0等系统采集数据',
      tasks: [
        '连接营销2.0系统',
        '采集智能电表数据',
        '获取山西电网用电量数据',
        '同步电费缴费记录',
        '更新客户用电档案'
      ],
      color: '#1890ff',
      gradient: 'linear-gradient(135deg, #1890ff, #096dd9)'
    },
    {
      id: 'indicator-analysis',
      name: '指标分析智能体',
      icon: <BarChartOutlined />,
      description: '基于4000+营销指标和2000+智慧运营平台指标进行深度分析',
      tasks: [
        '计算电网负荷指标',
        '分析山西地区用电模式',
        '识别异常用电行为',
        '生成供电区域画像',
        '输出负荷分析报告'
      ],
      color: '#52c41a',
      gradient: 'linear-gradient(135deg, #52c41a, #389e0d)'
    },
    {
      id: 'policy-interpretation',
      name: '政策解读智能体',
      icon: <FileTextOutlined />,
      description: '基于总部政策研究团队支持，解读国网、省市各级政策',
      tasks: [
        '解读国网总部最新政策',
        '分析山西省电力政策影响',
        '评估清洁能源政策合规性',
        '生成政策执行建议',
        '更新山西电网合规清单'
      ],
      color: '#722ed1',
      gradient: 'linear-gradient(135deg, #722ed1, #531dab)'
    },
    {
      id: 'data-monitoring',
      name: '数据检测智能体',
      icon: <SearchOutlined />,
      description: '多源数据血缘追踪，4000+指标业务血缘管理，实时数据质量监控',
      tasks: [
        '检测电网数据完整性',
        '识别电力系统异常数据',
        '验证智能电表数据准确性',
        '生成电网数据质量报告',
        '推送电网运行异常告警'
      ],
      color: '#fa8c16',
      gradient: 'linear-gradient(135deg, #fa8c16, #d46b08)'
    },
    {
      id: 'report-generation',
      name: '报告生成智能体',
      icon: <EditOutlined />,
      description: '融合前四个智能体输出，智能生成标准化报告',
      tasks: [
        '整合山西电网分析结果',
        '应用国网标准报告模板',
        '生成电网负荷图表可视化',
        '格式化电网分析内容',
        '完成山西电网分析报告'
      ],
      color: '#13c2c2',
      gradient: 'linear-gradient(135deg, #13c2c2, #08979c)'
    }
  ];

  // 随机生成处理时间（8-15秒）
  const getRandomDuration = () => Math.floor(Math.random() * 7000) + 8000;

  // 开始处理
  const startProcessing = () => {
    setIsProcessing(true);
    setCurrentStep(0);
    setAgentProgress({});
    setCompletedAgents([]);

    // 串行启动智能体，增加真实感
    agents.forEach((agent, index) => {
      getRandomDuration();
      const startDelay = index * 1500; // 增加错开时间

      setTimeout(() => {
        // 开始进度动画，更慢更真实
        const progressInterval = setInterval(() => {
          setAgentProgress(prev => {
            const currentProgress = prev[agent.id] || 0;
            const increment = Math.random() * 3 + 1; // 1-4的随机增量，更慢
            const newProgress = Math.min(currentProgress + increment, 100);
            
            if (newProgress >= 100) {
              clearInterval(progressInterval);
              setCompletedAgents(prev => {
                if (!prev.includes(agent.id)) {
                  return [...prev, agent.id];
                }
                return prev;
              });
              return { ...prev, [agent.id]: 100 };
            }
            
            return { ...prev, [agent.id]: newProgress };
          });
        }, 300); // 增加到300ms间隔，更慢更真实
      }, startDelay);
    });
  };

  // 检查是否所有智能体都完成
  useEffect(() => {
    if (completedAgents.length === agents.length && isProcessing) {
      setTimeout(() => {
        setCurrentStep(1); // 进入完成状态
      }, 1000);
    }
  }, [completedAgents.length, agents.length, isProcessing]);

  // 模态框打开时自动开始处理
  useEffect(() => {
    if (visible) {
      setTimeout(startProcessing, 500);
    } else {
      // 重置状态
      setIsProcessing(false);
      setCurrentStep(0);
      setAgentProgress({});
      setCompletedAgents([]);
    }
  }, [visible]);

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  // 获取当前任务描述
  const getCurrentTask = (agent: Agent, progress: number) => {
    const taskIndex = Math.floor((progress / 100) * agent.tasks.length);
    if (taskIndex >= agent.tasks.length) {
      return '✅ 处理完成';
    }
    return `🔄 ${agent.tasks[taskIndex]}`;
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      maskClosable={false}
      closable={currentStep === 1}
    >
      <div style={{ padding: '20px 0' }}>
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <Title level={3} style={{ marginBottom: '8px' }}>
                  🤖 五大智能体协作处理中
                </Title>
                <Text type="secondary">
                  正在并行处理您的报告，请稍候...
                </Text>
              </div>

              <Row gutter={[16, 16]}>
                {agents.map((agent, index) => {
                  const progress = agentProgress[agent.id] || 0;
                  const isCompleted = completedAgents.includes(agent.id);
                  const isActive = progress > 0;

                  return (
                    <Col xs={24} sm={12} key={agent.id}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card
                          size="small"
                          style={{
                            background: isActive ? 'linear-gradient(135deg, #f0f9ff, #e6f7ff)' : '#fafafa',
                            border: isActive ? '1px solid #91d5ff' : '1px solid #d9d9d9',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <motion.div
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: agent.gradient,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '16px',
                                flexShrink: 0
                              }}
                              animate={isActive && !isCompleted ? {
                                rotate: [0, 360],
                                scale: [1, 1.1, 1]
                              } : {}}
                              transition={{
                                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                                scale: { duration: 1, repeat: Infinity }
                              }}
                            >
                              {isCompleted ? <CheckCircleOutlined /> : agent.icon}
                            </motion.div>
                            
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <Text strong style={{ fontSize: '14px' }}>
                                  {agent.name}
                                </Text>
                                {isActive && !isCompleted && (
                                  <LoadingOutlined style={{ color: agent.color }} />
                                )}
                                {isCompleted && (
                                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                )}
                              </div>
                              
                              <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                                {agent.description}
                              </Text>
                              
                              <Progress
                                percent={Math.round(progress)}
                                size="small"
                                strokeColor={agent.color}
                                showInfo={false}
                                style={{ marginBottom: '8px' }}
                              />
                              
                              {isActive && (
                                <motion.div
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3 }}
                                  style={{ fontSize: '11px', color: '#666' }}
                                >
                                  {isCompleted ? '✅ 处理完成' : getCurrentTask(agent, progress)}
                                </motion.div>
                              )}
                              
                              {/* 添加处理详情 */}
                              {isActive && !isCompleted && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.5 }}
                                  style={{ 
                                    fontSize: '10px', 
                                    color: '#999', 
                                    marginTop: '4px',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                  }}
                                >
                                  <span>进度: {Math.round(progress)}%</span>
                                  <span>耗时: {Math.floor(progress * 0.15)}s</span>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    </Col>
                  );
                })}
              </Row>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  已完成 {completedAgents.length} / {agents.length} 个智能体处理
                </Text>
              </div>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{ textAlign: 'center' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                style={{ fontSize: '64px', marginBottom: '20px' }}
              >
                🎉
              </motion.div>
              
              <Title level={3} style={{ color: '#52c41a', marginBottom: '16px' }}>
                智能报告生成完成！
              </Title>
              
              <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
                五大智能体已成功协作完成报告生成，您可以开始编辑和完善报告内容。
              </Text>
              
              <Space>
                <Button onClick={onClose}>稍后处理</Button>
                <Button type="primary" onClick={handleComplete}>
                  立即查看报告
                </Button>
              </Space>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};

export default AgentProgressModal;