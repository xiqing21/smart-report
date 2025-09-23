import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  Upload,
  Table,
  Space,
  Tag,
  Progress,
  Modal,
  Input,
  message,
  Tabs,
  List,
  Avatar,
  Tooltip,
  Popconfirm,
  Select,
  Divider,
  Typography,
  Row,
  Col,
  Statistic,
  Spin,
  Empty
} from 'antd';
import {
  UploadOutlined,
  FileTextOutlined,
  DeleteOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  BookOutlined,
  DatabaseOutlined,
  BrainCircuitOutlined,
  MessageOutlined,
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  HistoryOutlined,
  PlusOutlined,
  BulbOutlined
} from '@ant-design/icons';
import type { UploadProps, TableColumnsType } from 'antd';
import { documentProcessor, ProcessingProgress } from '../services/documentProcessor';
import { embeddingService } from '../services/ai/embeddingService';
import { chatService, ChatMessage } from '../services/ai/chatService';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadTime: string;
  status: 'processing' | 'completed' | 'failed';
  chunks: number;
  vectors: number;
}

interface SearchResult {
  id: string;
  content: string;
  similarity: number;
  source: string;
  metadata: Record<string, any>;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: SearchResult[];
}

interface ConversationItem {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  summary?: string;
  keywords?: string[];
}

const KnowledgeBase: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [chatting, setChatting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState('documents');
  const [uploadProgress, setUploadProgress] = useState<Record<string, ProcessingProgress>>({});
  const [stats, setStats] = useState({
    totalDocuments: 0,
    completedDocuments: 0,
    totalVectors: 0,
    totalChunks: 0
  });
  const [conversationId, setConversationId] = useState('');
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 加载文档列表和统计信息
  const loadDocuments = async () => {
    try {
      const { documents: docs } = await documentProcessor.getDocuments({ limit: 100 });
      setDocuments(docs);
      
      const statsData = await embeddingService.getDocumentStats();
      setStats(statsData);
    } catch (error) {
      console.error('加载文档列表失败:', error);
      message.error('加载文档列表失败');
    }
  };

  useEffect(() => {
    loadDocuments();
    loadConversationHistory();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // 文件上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    accept: '.pdf,.doc,.docx,.txt,.md',
    beforeUpload: (file) => {
      const isValidType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'].includes(file.type);
      if (!isValidType) {
        message.error('只支持 PDF、Word、TXT、Markdown 格式的文件！');
        return false;
      }
      const isLt50M = file.size / 1024 / 1024 < 50;
      if (!isLt50M) {
        message.error('文件大小不能超过 50MB！');
        return false;
      }
      return true;
    },
    customRequest: async ({ file, onSuccess, onError, onProgress }) => {
      try {
        setUploading(true);
        
        const results = await documentProcessor.processBatchDocuments([file as File], {
          userId: 'current_user'
        });
        
        // 设置进度监听
        const tempId = `temp_${Date.now()}`;
        documentProcessor.onProgress(tempId, (progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [(file as File).name]: progress
          }));
          onProgress?.({ percent: progress.progress });
        });
        
        if (results.successful.length > 0) {
          message.success(`${(file as File).name} 上传并向量化完成！`);
          await loadDocuments();
          onSuccess?.(null);
        } else {
          throw new Error(results.failed[0]?.error || '处理失败');
        }
        
      } catch (error) {
        message.error('上传失败！');
        onError?.(error as Error);
      } finally {
        setUploading(false);
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[(file as File).name];
          return newProgress;
        });
      }
    }
  };

  // 语义搜索
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      message.warning('请输入搜索内容！');
      return;
    }
    
    setSearching(true);
    
    try {
      const results = await embeddingService.semanticSearch(searchQuery, {
        limit: 10,
        threshold: 0.7,
        userId: 'current_user'
      });
      
      const formattedResults: SearchResult[] = results.map(result => ({
        id: result.id,
        content: result.content,
        similarity: result.similarity,
        source: result.document_name,
        metadata: result.metadata
      }));
      
      setSearchResults(formattedResults);
      message.success(`找到 ${results.length} 个相关结果`);
    } catch (error) {
      console.error('搜索失败:', error);
      message.error('搜索失败，请稍后重试');
    } finally {
      setSearching(false);
    }
  };

  // 创建新对话
  const handleCreateConversation = async () => {
    try {
      const conversation = await chatService.createConversation(undefined, '新对话');
      setConversationId(conversation.id);
      setChatMessages([]);
      message.success('创建新对话成功');
    } catch (error) {
      console.error('创建对话失败:', error);
      message.error('创建对话失败');
    }
  };

  // 加载对话历史
  const loadConversationHistory = async () => {
    try {
      const history = await chatService.getUserConversations('current_user');
      setConversationHistory(history);
    } catch (error) {
      console.error('加载对话历史失败:', error);
    }
  };

  // 选择历史对话
  const handleSelectConversation = async (selectedConversationId: string) => {
    try {
      const conversation = await chatService.getConversation(selectedConversationId);
      if (conversation) {
        setConversationId(selectedConversationId);
        // 转换消息格式
        const formattedMessages: ChatMessage[] = conversation.messages.map((msg: any) => ({
          id: msg.id,
          type: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          sources: msg.sources
        }));
        setChatMessages(formattedMessages);
        setShowHistoryModal(false);
      }
    } catch (error) {
      console.error('加载对话失败:', error);
      message.error('加载对话失败');
    }
  };

  // 删除对话
  const handleDeleteConversation = async (selectedConversationId: string) => {
    try {
      const success = await chatService.deleteConversation(selectedConversationId);
      if (success) {
        message.success('删除对话成功');
        loadConversationHistory();
        if (conversationId === selectedConversationId) {
          setConversationId('');
          setChatMessages([]);
        }
      } else {
        message.error('删除对话失败');
      }
    } catch (error) {
      console.error('删除对话失败:', error);
      message.error('删除对话失败');
    }
  };

  // 智能问答
  const handleChat = async () => {
    if (!chatInput.trim()) {
      message.warning('请输入问题！');
      return;
    }
    
    // 如果没有当前对话，创建一个新对话
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      try {
        const conversation = await chatService.createConversation(undefined, chatInput.substring(0, 20) + '...');
        currentConversationId = conversation.id;
        setConversationId(currentConversationId);
      } catch (error) {
        console.error('创建对话失败:', error);
        message.error('创建对话失败');
        return;
      }
    }
    
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      type: 'user',
      content: chatInput,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    setChatting(true);
    
    try {
       const response = await chatService.answerQuestion(currentInput, currentConversationId, 'current_user');
       
       const assistantMessage: ChatMessage = {
         id: `msg_${Date.now()}_assistant`,
         type: 'assistant',
         content: response.content,
         timestamp: new Date().toISOString(),
         sources: response.sources
       };
       
       setChatMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('发送消息失败:', error);
      message.error('发送消息失败，请稍后重试');
      
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        type: 'assistant',
        content: '抱歉，我暂时无法回答您的问题。请稍后重试。',
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatting(false);
    }
  };

  // 删除文档
  const handleDeleteDocument = async (id: string) => {
    try {
      await documentProcessor.deleteDocument(id);
      await loadDocuments();
      message.success('文档删除成功！');
    } catch (error) {
      console.error('删除文档失败:', error);
      message.error('删除文档失败');
    }
  };

  // 文档表格列定义
  const documentColumns: TableColumnsType<Document> = [
    {
      title: '文档名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <FileTextOutlined />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color="blue">{type.toUpperCase()}</Tag>
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (size) => `${(size / 1024 / 1024).toFixed(2)} MB`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          processing: { color: 'processing', text: '处理中' },
          completed: { color: 'success', text: '已完成' },
          failed: { color: 'error', text: '失败' }
        };
        const config = statusConfig[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '向量数',
      dataIndex: 'vectors',
      key: 'vectors',
      render: (vectors, record) => (
        <span>{record.status === 'completed' ? vectors : '-'}</span>
      )
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime',
      key: 'uploadTime'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="确定要删除这个文档吗？"
            onConfirm={() => handleDeleteDocument(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 统计数据
  const totalDocuments = stats.totalDocuments;
  const completedDocuments = stats.completedDocuments;
  const totalVectors = stats.totalVectors;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-8">
      {/* 页面标题 - 玻璃拟态风格 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              知识库管理
            </h1>
            <p className="text-gray-300 text-lg">智能文档管理与语义搜索，支持多格式文档的智能问答</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/30">
              <BrainCircuitOutlined className="text-green-400 text-lg" />
              <span className="text-green-300 font-medium">AI服务在线</span>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="primary"
                icon={<HistoryOutlined />}
                onClick={() => setShowHistoryModal(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 border-none rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                历史记录
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* 统计卡片 - 玻璃拟态风格 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-8"
      >
        <Row gutter={[24, 24]}>
          <Col span={6}>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Statistic
                  title={<span className="text-gray-300">文档总数</span>}
                  value={totalDocuments}
                  prefix={<DatabaseOutlined className="text-indigo-400 text-xl" />}
                  valueStyle={{ color: '#f0f9ff', fontSize: '28px', fontWeight: 'bold' }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col span={6}>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Statistic
                  title={<span className="text-gray-300">已处理文档</span>}
                  value={completedDocuments}
                  prefix={<FileTextOutlined className="text-green-400 text-xl" />}
                  valueStyle={{ color: '#f0f9ff', fontSize: '28px', fontWeight: 'bold' }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col span={6}>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Statistic
                  title={<span className="text-gray-300">向量总数</span>}
                  value={totalVectors}
                  prefix={<BulbOutlined className="text-purple-400 text-xl" />}
                  valueStyle={{ color: '#f0f9ff', fontSize: '28px', fontWeight: 'bold' }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col span={6}>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Statistic
                  title={<span className="text-gray-300">处理成功率</span>}
                  value={totalDocuments > 0 ? Math.round((completedDocuments / totalDocuments) * 100) : 0}
                  suffix="%"
                  prefix={<QuestionCircleOutlined className="text-cyan-400 text-xl" />}
                  valueStyle={{ color: '#f0f9ff', fontSize: '28px', fontWeight: 'bold' }}
                />
              </Card>
            </motion.div>
          </Col>
        </Row>
      </motion.div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} className="glass-tabs">
        {/* 文档管理 */}
        <TabPane tab="文档管理" key="documents">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <div className="mb-6">
              <Upload {...uploadProps}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    icon={<UploadOutlined />} 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    size="large"
                    loading={uploading}
                  >
                    上传文档
                  </Button>
                </motion.div>
              </Upload>
              <Text type="secondary" className="ml-4">
                支持 PDF、Word、TXT、Markdown、JSON 格式，最大 50MB
              </Text>
              
              {/* 上传进度显示 */}
              {Object.keys(uploadProgress).length > 0 && (
                <div className="mt-4">
                  <Title level={5}>处理进度</Title>
                  {Object.entries(uploadProgress).map(([fileName, progress]) => (
                    <div key={fileName} className="mb-3 p-3 bg-gray-50 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <Text strong>{fileName}</Text>
                        <Text type="secondary">{progress.stage}</Text>
                      </div>
                      <Progress percent={progress.progress} size="small" />
                      <Text type="secondary" className="text-xs">{progress.message}</Text>
                      {progress.error && (
                        <Text type="danger" className="text-xs block">{progress.error}</Text>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
              <Table
                columns={documentColumns}
                dataSource={documents}
                rowKey="id"
                className="glass-table"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 个文档`,
                  className: "glass-pagination"
                }}
              />
            </div>
          </motion.div>
        </TabPane>

        {/* 语义搜索 */}
        <TabPane tab="语义搜索" key="search">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
              <div className="mb-6">
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    placeholder="输入搜索内容，支持自然语言查询"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onPressEnter={handleSearch}
                    className="bg-white/20 border-white/30 text-white placeholder-white/70 rounded-l-xl"
                  />
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    loading={searching}
                    onClick={handleSearch}
                    disabled={searching}
                    className="bg-blue-500/80 border-blue-400 hover:bg-blue-600/90 rounded-r-xl px-6"
                  >
                    搜索
                  </Button>
                </Space.Compact>
              </div>
            
              {searchResults.length > 0 && (
                <List
                  itemLayout="vertical"
                  dataSource={searchResults}
                  renderItem={(item) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <List.Item
                        key={item.id}
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl mb-3 p-4 hover:bg-white/10 transition-all duration-300"
                        extra={
                          <div className="text-right">
                            <div className="text-sm text-white/70 mb-2">
                              相似度: {(item.similarity * 100).toFixed(1)}%
                            </div>
                            <Progress
                              percent={item.similarity * 100}
                              size="small"
                              showInfo={false}
                              strokeColor="#60a5fa"
                              trailColor="rgba(255,255,255,0.1)"
                            />
                          </div>
                        }
                      >
                        <List.Item.Meta
                          title={
                            <Space>
                              <FileTextOutlined className="text-blue-400" />
                              <span className="text-white font-medium">{item.source}</span>
                              <Tag color="blue" className="bg-blue-500/20 border-blue-400/30 text-blue-300">
                                {item.metadata?.page ? `第${item.metadata.page}页` : 
                                 item.metadata?.line ? `第${item.metadata.line}行` : '未知位置'}
                              </Tag>
                            </Space>
                          }
                          description={<div className="text-white/80 mt-2">{item.content}</div>}
                        />
                      </List.Item>
                    </motion.div>
                  )}
                />
              )}
            </Card>
          </motion.div>
        </TabPane>

        {/* 智能问答 */}
        <TabPane tab="智能问答" key="chat">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl"
              extra={
                <Space>
                  <Button
                    icon={<PlusOutlined />}
                    onClick={handleCreateConversation}
                    size="small"
                    className="bg-blue-500/20 border-blue-400/30 text-blue-300 hover:bg-blue-500/30 hover:text-blue-200"
                  >
                    新对话
                  </Button>
                  <Button
                    icon={<HistoryOutlined />}
                    onClick={() => {
                      loadConversationHistory();
                      setShowHistoryModal(true);
                    }}
                    size="small"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    历史对话
                  </Button>
                </Space>
              }
            >
              {conversationId && (
                <div className="mb-4">
                  <Tag color="blue" className="bg-blue-500/20 border-blue-400/30 text-blue-300">
                    当前对话: {conversationId.substring(0, 20)}...
                  </Tag>
                </div>
              )}
              <div className="h-96 overflow-y-auto mb-6 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                {chatMessages.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center text-white/70 mt-8"
                  >
                    <RobotOutlined className="text-4xl mb-4 text-blue-400" />
                    <p className="text-lg">开始与您的知识库对话吧！</p>
                    <p className="text-sm mt-2 text-white/60">我可以帮您查找文档内容、回答问题、总结信息等。</p>
                  </motion.div>
                ) : (
                  chatMessages.map((message, index) => (
                    <motion.div 
                      key={message.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}
                    >
                      <div className={`inline-block max-w-xs lg:max-w-md px-4 py-3 rounded-xl backdrop-blur-sm ${
                        message.type === 'user'
                          ? 'bg-blue-500/80 border border-blue-400/50 text-white shadow-lg'
                          : 'bg-white/10 border border-white/20 text-white shadow-lg'
                      }`}>
                        <div className="flex items-start space-x-2">
                          {message.type === 'assistant' && <RobotOutlined className="text-sm mt-1 text-blue-400" />}
                          {message.type === 'user' && <UserOutlined className="text-sm mt-1" />}
                          <div className="flex-1">
                            <div className="text-sm">{message.content}</div>
                            <div className="text-xs mt-2 opacity-70">
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {message.sources && message.sources.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 text-left"
                        >
                          <Text type="secondary" className="text-xs text-white/60">参考来源：</Text>
                          {message.sources.map((source, srcIndex) => (
                            <motion.div
                              key={srcIndex}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: srcIndex * 0.1 }}
                            >
                              <Tag className="mt-1 bg-white/10 border-white/20 text-white/80">
                                {source.document_name} (相似度: {(source.similarity * 100).toFixed(1)}%)
                              </Tag>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  ))
                )}
                
                {chatting && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-left mb-4"
                  >
                    <div className="inline-block bg-white/10 border border-white/20 px-4 py-3 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                        <span className="text-white/80">AI正在思考中...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>
            
              <Space.Compact style={{ width: '100%' }}>
                <TextArea
                  placeholder="输入您的问题，AI将基于知识库为您解答"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onPressEnter={(e) => {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      handleChat();
                    }
                  }}
                  autoSize={{ minRows: 1, maxRows: 3 }}
                  className="bg-white/20 border-white/30 text-white placeholder-white/70 rounded-l-xl"
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={chatting}
                  onClick={handleChat}
                  disabled={chatting || !chatInput.trim()}
                  className="bg-blue-500/80 border-blue-400 hover:bg-blue-600/90 rounded-r-xl px-6"
                >
                  发送
                </Button>
              </Space.Compact>
              
              <div className="mt-3 text-xs text-white/60">
                按 Enter 发送，Shift + Enter 换行
              </div>
            </Card>
          </motion.div>
        </TabPane>
      </Tabs>

      {/* 对话历史模态框 */}
      <Modal
        title={<span className="text-white font-medium">对话历史</span>}
        open={showHistoryModal}
        onCancel={() => setShowHistoryModal(false)}
        footer={null}
        width={600}
        className="glass-modal"
        styles={{
          mask: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)'
          },
          content: {
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px'
          }
        }}
      >
        <List
          dataSource={conversationHistory}
          renderItem={(item) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <List.Item
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl mb-3 p-4 hover:bg-white/10 transition-all duration-300"
                actions={[
                  <Button
                    type="link"
                    onClick={() => handleSelectConversation(item.id)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    选择
                  </Button>,
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteConversation(item.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    删除
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={<span className="text-white font-medium">{item.title}</span>}
                  description={
                    <div className="text-white/70">
                      <div className="mb-1">消息数: {item.messages?.length || 0}</div>
                      <div className="mb-1">创建时间: {new Date(item.createdAt).toLocaleString()}</div>
                      {item.summary && <div className="text-sm text-white/60">摘要: {item.summary}</div>}
                    </div>
                  }
                />
              </List.Item>
            </motion.div>
          )}
        />
      </Modal>
    </div>
  );
};

export default KnowledgeBase;