// 浏览器环境下的模拟AI服务
// 由于智谱AI SDK依赖Node.js环境，在浏览器中使用模拟服务

export interface MockEmbeddingResponse {
  data: Array<{
    embedding: number[];
    index: number;
    object: 'embedding';
  }>;
  model: string;
  object: 'list';
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface MockChatResponse {
  id: string;
  choices: Array<{
    finish_reason: 'stop' | 'length';
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
  }>;
  created: number;
  model: string;
  object: 'chat.completion';
  usage?: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
}

// 生成随机向量
function generateRandomEmbedding(dimension: number = 1024): number[] {
  return Array.from({ length: dimension }, () => Math.random() * 2 - 1);
}

// 模拟智谱AI Embeddings API
export async function mockGetEmbedding(text: string): Promise<MockEmbeddingResponse> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
  
  return {
    data: [{
      embedding: generateRandomEmbedding(),
      index: 0,
      object: 'embedding'
    }],
    model: 'embedding-2',
    object: 'list',
    usage: {
      prompt_tokens: Math.ceil(text.length / 4),
      total_tokens: Math.ceil(text.length / 4)
    }
  };
}

// 模拟智谱AI Chat API
export async function mockChatCompletion(messages: Array<{ role: string; content: string }>): Promise<MockChatResponse> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  const lastMessage = messages[messages.length - 1];
  const userQuestion = lastMessage?.content || '';
  
  // 简单的模拟回答逻辑
  let response = '';
  if (userQuestion.includes('什么') || userQuestion.includes('如何') || userQuestion.includes('怎么')) {
    response = `根据您的问题"${userQuestion}"，我为您提供以下信息：\n\n这是一个基于智谱AI的智能问答系统的模拟回答。在实际部署时，这将连接到真实的智谱AI API服务。\n\n当前系统具备以下功能：\n1. 文档向量化存储\n2. 语义搜索与检索\n3. 智能问答对话\n4. 上下文记忆功能\n\n如需获得更准确的回答，请确保已正确配置智谱AI API密钥。`;
  } else if (userQuestion.includes('你好') || userQuestion.includes('hello')) {
    response = '您好！我是基于智谱AI的智能助手。我可以帮您回答问题、搜索知识库内容，并提供相关信息。请问有什么可以帮助您的吗？';
  } else {
    response = `感谢您的提问。基于当前的知识库内容，我理解您询问的是关于"${userQuestion}"的问题。\n\n这是一个模拟回答，展示了系统的基本对话能力。在生产环境中，系统会：\n\n1. 使用向量搜索在知识库中查找相关内容\n2. 结合上下文信息生成准确回答\n3. 提供信息来源和相似度评分\n\n请上传相关文档以获得更精准的答案。`;
  }
  
  return {
    id: `chatcmpl-${Date.now()}`,
    choices: [{
      finish_reason: 'stop',
      index: 0,
      message: {
        role: 'assistant',
        content: response
      }
    }],
    created: Math.floor(Date.now() / 1000),
    model: 'glm-4',
    object: 'chat.completion',
    usage: {
      completion_tokens: Math.ceil(response.length / 4),
      prompt_tokens: Math.ceil(userQuestion.length / 4),
      total_tokens: Math.ceil((response.length + userQuestion.length) / 4)
    }
  };
}

// 检查是否在浏览器环境
export function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}