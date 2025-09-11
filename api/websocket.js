import { WebSocketServer } from 'ws';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from 'dotenv';

// 加载环境变量
config({ path: '.env.local' });

// Supabase配置
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration. Please check .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// WebSocket服务器配置
const WS_PORT = process.env.WS_PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

// 存储活跃连接
const activeConnections = new Map();

// 创建WebSocket服务器
const wss = new WebSocketServer({ 
  port: WS_PORT,
  verifyClient: async (info) => {
    try {
      const url = new URL(info.req.url, `http://${info.req.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) {
        console.log('WebSocket connection rejected: No token provided');
        return false;
      }
      
      // 验证JWT token
      const decoded = jwt.verify(token, JWT_SECRET);
      info.req.userId = decoded.userId;
      info.req.sessionToken = token;
      
      return true;
    } catch (error) {
      console.log('WebSocket connection rejected:', error.message);
      return false;
    }
  }
});

console.log(`WebSocket server started on port ${WS_PORT}`);

// 处理WebSocket连接
wss.on('connection', async (ws, req) => {
  const userId = req.userId;
  const sessionToken = req.sessionToken;
  const connectionId = uuidv4();
  
  console.log(`New WebSocket connection: ${connectionId} for user ${userId}`);
  
  // 存储连接信息
  const connectionInfo = {
    ws,
    userId,
    sessionToken,
    connectionId,
    subscriptions: new Set(),
    lastPing: Date.now()
  };
  
  activeConnections.set(connectionId, connectionInfo);
  
  try {
    // 在数据库中记录WebSocket会话
    await supabase
      .from('websocket_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        connection_id: connectionId,
        status: 'active'
      });
  } catch (error) {
    console.error('Failed to record WebSocket session:', error);
  }
  
  // 发送连接确认消息
  ws.send(JSON.stringify({
    type: 'connection_established',
    connectionId,
    timestamp: new Date().toISOString()
  }));
  
  // 处理消息
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      await handleMessage(connectionInfo, message);
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });
  
  // 处理连接关闭
  ws.on('close', async () => {
    console.log(`WebSocket connection closed: ${connectionId}`);
    activeConnections.delete(connectionId);
    
    try {
      // 更新数据库中的会话状态
      await supabase
        .from('websocket_sessions')
        .update({ status: 'inactive' })
        .eq('connection_id', connectionId);
    } catch (error) {
      console.error('Failed to update WebSocket session status:', error);
    }
  });
  
  // 处理连接错误
  ws.on('error', (error) => {
    console.error(`WebSocket error for connection ${connectionId}:`, error);
  });
  
  // 发送心跳
  const heartbeat = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.ping();
      connectionInfo.lastPing = Date.now();
    } else {
      clearInterval(heartbeat);
    }
  }, 30000); // 30秒心跳
  
  ws.on('pong', () => {
    connectionInfo.lastPing = Date.now();
  });
});

// 处理WebSocket消息
async function handleMessage(connectionInfo, message) {
  const { ws, userId, connectionId } = connectionInfo;
  
  switch (message.type) {
    case 'subscribe':
      await handleSubscribe(connectionInfo, message);
      break;
      
    case 'unsubscribe':
      await handleUnsubscribe(connectionInfo, message);
      break;
      
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      break;
      
    case 'task_control':
      await handleTaskControl(connectionInfo, message);
      break;
      
    default:
      ws.send(JSON.stringify({
        type: 'error',
        message: `Unknown message type: ${message.type}`
      }));
  }
}

// 处理订阅
async function handleSubscribe(connectionInfo, message) {
  const { ws, userId, subscriptions } = connectionInfo;
  const { topics } = message;
  
  if (!Array.isArray(topics)) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Topics must be an array'
    }));
    return;
  }
  
  // 验证用户是否有权限订阅这些主题
  const allowedTopics = [];
  for (const topic of topics) {
    if (await canSubscribeToTopic(userId, topic)) {
      subscriptions.add(topic);
      allowedTopics.push(topic);
    }
  }
  
  // 更新数据库中的订阅信息
  try {
    await supabase
      .from('websocket_sessions')
      .update({ 
        subscribed_topics: Array.from(subscriptions),
        last_ping: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('status', 'active');
  } catch (error) {
    console.error('Failed to update subscriptions:', error);
  }
  
  ws.send(JSON.stringify({
    type: 'subscription_confirmed',
    topics: allowedTopics,
    timestamp: new Date().toISOString()
  }));
}

// 处理取消订阅
async function handleUnsubscribe(connectionInfo, message) {
  const { ws, userId, subscriptions } = connectionInfo;
  const { topics } = message;
  
  if (!Array.isArray(topics)) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Topics must be an array'
    }));
    return;
  }
  
  topics.forEach(topic => subscriptions.delete(topic));
  
  // 更新数据库
  try {
    await supabase
      .from('websocket_sessions')
      .update({ 
        subscribed_topics: Array.from(subscriptions)
      })
      .eq('user_id', userId)
      .eq('status', 'active');
  } catch (error) {
    console.error('Failed to update subscriptions:', error);
  }
  
  ws.send(JSON.stringify({
    type: 'unsubscription_confirmed',
    topics,
    timestamp: new Date().toISOString()
  }));
}

// 处理任务控制
async function handleTaskControl(connectionInfo, message) {
  const { ws, userId } = connectionInfo;
  const { taskId, action, params } = message;
  
  try {
    // 验证用户是否有权限控制该任务
    const { data: task, error } = await supabase
      .from('processing_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('owner_id', userId)
      .single();
    
    if (error || !task) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Task not found or access denied'
      }));
      return;
    }
    
    // 执行任务控制操作
    let updateData = {};
    
    switch (action) {
      case 'pause':
        if (task.status === 'running') {
          updateData = { status: 'paused' };
        }
        break;
        
      case 'resume':
        if (task.status === 'paused') {
          updateData = { status: 'running' };
        }
        break;
        
      case 'cancel':
        if (['pending', 'running', 'paused'].includes(task.status)) {
          updateData = { status: 'cancelled' };
        }
        break;
        
      case 'restart':
        if (['completed', 'failed', 'cancelled'].includes(task.status)) {
          updateData = { 
            status: 'pending',
            progress: 0,
            error_message: null,
            retry_count: 0
          };
        }
        break;
        
      case 'update_params':
        if (params && task.status === 'paused') {
          updateData = { pipeline_config: { ...task.pipeline_config, ...params } };
        }
        break;
        
      default:
        ws.send(JSON.stringify({
          type: 'error',
          message: `Unknown action: ${action}`
        }));
        return;
    }
    
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('processing_tasks')
        .update(updateData)
        .eq('id', taskId);
      
      if (updateError) {
        throw updateError;
      }
      
      ws.send(JSON.stringify({
        type: 'task_control_success',
        taskId,
        action,
        timestamp: new Date().toISOString()
      }));
      
      // 广播任务状态更新
      if (updateData.status) {
        await broadcastToTopic('task_status_update', {
          taskId,
          status: updateData.status,
          progress: updateData.progress || task.progress,
          timestamp: new Date().toISOString()
        }, userId);
      }
    } else {
      ws.send(JSON.stringify({
        type: 'error',
        message: `Cannot ${action} task in current status: ${task.status}`
      }));
    }
  } catch (error) {
    console.error('Task control error:', error);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to control task'
    }));
  }
}

// 检查用户是否可以订阅特定主题
async function canSubscribeToTopic(userId, topic) {
  // 基本主题权限检查
  const userTopics = [
    'task_status_update',
    'data_quality_update',
    'eda_insights',
    'system_notifications'
  ];
  
  // 检查是否是用户特定的主题
  if (topic.startsWith(`user_${userId}_`)) {
    return true;
  }
  
  return userTopics.includes(topic);
}

// 广播消息到特定主题
async function broadcastToTopic(topic, payload, excludeUserId = null) {
  const message = JSON.stringify({
    type: 'broadcast',
    topic,
    payload,
    timestamp: new Date().toISOString()
  });
  
  for (const [connectionId, connectionInfo] of activeConnections) {
    const { ws, userId, subscriptions } = connectionInfo;
    
    // 跳过排除的用户
    if (excludeUserId && userId === excludeUserId) {
      continue;
    }
    
    // 检查是否订阅了该主题
    if (subscriptions.has(topic) && ws.readyState === ws.OPEN) {
      try {
        ws.send(message);
      } catch (error) {
        console.error(`Failed to send message to connection ${connectionId}:`, error);
      }
    }
  }
}

// 处理数据库中的实时消息队列
async function processMessageQueue() {
  try {
    const { data: messages, error } = await supabase
      .from('realtime_messages')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(100);
    
    if (error) {
      console.error('Failed to fetch messages:', error);
      return;
    }
    
    for (const message of messages) {
      try {
        if (message.target_user_id) {
          // 发送给特定用户
          await sendToUser(message.target_user_id, message.topic, message.payload);
        } else {
          // 广播到主题
          await broadcastToTopic(message.topic, message.payload);
        }
        
        // 标记消息为已发送
        await supabase
          .from('realtime_messages')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', message.id);
          
      } catch (error) {
        console.error(`Failed to process message ${message.id}:`, error);
        
        // 增加重试次数
        const newRetryCount = (message.retry_count || 0) + 1;
        if (newRetryCount >= message.max_retries) {
          await supabase
            .from('realtime_messages')
            .update({ status: 'failed' })
            .eq('id', message.id);
        } else {
          await supabase
            .from('realtime_messages')
            .update({ retry_count: newRetryCount })
            .eq('id', message.id);
        }
      }
    }
  } catch (error) {
    console.error('Error processing message queue:', error);
  }
}

// 发送消息给特定用户
async function sendToUser(userId, topic, payload) {
  const message = JSON.stringify({
    type: 'direct_message',
    topic,
    payload,
    timestamp: new Date().toISOString()
  });
  
  let sent = false;
  for (const [connectionId, connectionInfo] of activeConnections) {
    if (connectionInfo.userId === userId && connectionInfo.ws.readyState === connectionInfo.ws.OPEN) {
      try {
        connectionInfo.ws.send(message);
        sent = true;
      } catch (error) {
        console.error(`Failed to send direct message to user ${userId}:`, error);
      }
    }
  }
  
  return sent;
}

// 定期处理消息队列
setInterval(processMessageQueue, 5000); // 每5秒处理一次

// 定期清理过期连接
setInterval(async () => {
  const now = Date.now();
  const timeout = 60000; // 60秒超时
  
  for (const [connectionId, connectionInfo] of activeConnections) {
    if (now - connectionInfo.lastPing > timeout) {
      console.log(`Cleaning up expired connection: ${connectionId}`);
      connectionInfo.ws.terminate();
      activeConnections.delete(connectionId);
      
      try {
        await supabase
          .from('websocket_sessions')
          .update({ status: 'expired' })
          .eq('connection_id', connectionId);
      } catch (error) {
        console.error('Failed to update expired session:', error);
      }
    }
  }
}, 30000); // 每30秒检查一次

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('Shutting down WebSocket server...');
  
  // 关闭所有连接
  for (const [connectionId, connectionInfo] of activeConnections) {
    connectionInfo.ws.close(1000, 'Server shutting down');
  }
  
  // 更新数据库中的会话状态
  try {
    await supabase
      .from('websocket_sessions')
      .update({ status: 'inactive' })
      .eq('status', 'active');
  } catch (error) {
    console.error('Failed to update sessions on shutdown:', error);
  }
  
  wss.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});

// 导出广播函数供其他模块使用
export { broadcastToTopic, sendToUser };