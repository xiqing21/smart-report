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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Title level={2} className="mb-2">
          <BookOutlined className="mr-2" />
          向量知识库
        </Title>
        <Paragraph className="text-gray-600">
          构建智能知识库，支持文档向量化存储、语义搜索和智能问答
        </Paragraph>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="文档总数"
              value={totalDocuments}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已处理文档"
              value={completedDocuments}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="向量总数"
              value={totalVectors}
              prefix={<BulbOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="处理成功率"
              value={totalDocuments > 0 ? Math.round((completedDocuments / totalDocuments) * 100) : 0}
              suffix="%"
              prefix={<QuestionCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* 文档管理 */}
        <TabPane tab="文档管理" key="documents">
          <Card>
            <div className="mb-4">
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />} loading={uploading}>
                  上传文档
                </Button>
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
            
            <Table
              columns={documentColumns}
              dataSource={documents}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 个文档`
              }}
            />
          </Card>
        </TabPane>

        {/* 语义搜索 */}
        <TabPane tab="语义搜索" key="search">
          <Card>
            <div className="mb-4">
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder="输入搜索内容，支持自然语言查询"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onPressEnter={handleSearch}
                />
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  loading={searching}
                  onClick={handleSearch}
                  disabled={searching}
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
                  <List.Item
                    key={item.id}
                    extra={
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">
                          相似度: {(item.similarity * 100).toFixed(1)}%
                        </div>
                        <Progress
                          percent={item.similarity * 100}
                          size="small"
                          showInfo={false}
                        />
                      </div>
                    }
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <FileTextOutlined />
                          <span>{item.source}</span>
                          <Tag color="blue">
                            {item.metadata?.page ? `第${item.metadata.page}页` : 
                             item.metadata?.line ? `第${item.metadata.line}行` : '未知位置'}
                          </Tag>
                        </Space>
                      }
                      description={item.content}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </TabPane>

        {/* 智能问答 */}
        <TabPane tab="智能问答" key="chat">
          <Card
            extra={
              <Space>
                <Button
                  icon={<PlusOutlined />}
                  onClick={handleCreateConversation}
                  size="small"
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
                >
                  历史对话
                </Button>
              </Space>
            }
          >
            {conversationId && (
              <div className="mb-2">
                <Tag color="blue">当前对话: {conversationId.substring(0, 20)}...</Tag>
              </div>
            )}
            <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <RobotOutlined className="text-4xl mb-4" />
                  <p>开始与您的知识库对话吧！</p>
                  <p className="text-sm mt-2">我可以帮您查找文档内容、回答问题、总结信息等。</p>
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div key={message.id} className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border'
                    }`}>
                      <div className="flex items-start space-x-2">
                        {message.type === 'assistant' && <RobotOutlined className="text-sm mt-0.5" />}
                        {message.type === 'user' && <UserOutlined className="text-sm mt-0.5" />}
                        <div className="flex-1">
                          <div>{message.content}</div>
                          <div className="text-xs mt-1 opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 text-left">
                        <Text type="secondary" className="text-xs">参考来源：</Text>
                        {message.sources.map((source, index) => (
                          <Tag key={index} className="mt-1">
                            {source.document_name} (相似度: {(source.similarity * 100).toFixed(1)}%)
                          </Tag>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {chatting && (
                <div className="text-left mb-4">
                  <div className="inline-block bg-white border px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span>AI正在思考中...</span>
                    </div>
                  </div>
                </div>
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
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={chatting}
                onClick={handleChat}
                disabled={chatting || !chatInput.trim()}
              >
                发送
              </Button>
            </Space.Compact>
            
            <div className="mt-2 text-xs text-gray-500">
              按 Enter 发送，Shift + Enter 换行
            </div>
          </Card>
        </TabPane>
      </Tabs>

      {/* 对话历史模态框 */}
      <Modal
        title="对话历史"
        open={showHistoryModal}
        onCancel={() => setShowHistoryModal(false)}
        footer={null}
        width={600}
      >
        <List
          dataSource={conversationHistory}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  onClick={() => handleSelectConversation(item.id)}
                >
                  选择
                </Button>,
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteConversation(item.id)}
                >
                  删除
                </Button>
              ]}
            >
              <List.Item.Meta
                title={item.title}
                description={
                  <div>
                    <div>消息数: {item.messages?.length || 0}</div>
                    <div>创建时间: {new Date(item.createdAt).toLocaleString()}</div>
                    {item.summary && <div>摘要: {item.summary}</div>}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default KnowledgeBase;