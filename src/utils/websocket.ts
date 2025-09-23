import { supabase } from './supabase';

type MessageHandler = (data: any) => void;
type ConnectionHandler = () => void;
type ErrorHandler = (error: Event) => void;

interface WebSocketMessage {
  type: string;
  topic?: string;
  payload?: any;
  timestamp?: string;
  connectionId?: string;
  topics?: string[];
  taskId?: string;
  action?: string;
  params?: any;
}

interface SubscriptionOptions {
  onMessage?: MessageHandler;
  onError?: ErrorHandler;
}

class WebSocketManager {
  private ws: WebSocket | null = null;
  private connectionId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private subscriptions = new Map<string, SubscriptionOptions>();
  private messageHandlers = new Map<string, MessageHandler[]>();
  private connectionHandlers: ConnectionHandler[] = [];
  private disconnectionHandlers: ConnectionHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !this.ws) {
        this.connect();
      } else if (document.visibilityState === 'hidden') {
        this.disconnect();
      }
    });

    // 监听网络状态变化
    window.addEventListener('online', () => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.connect();
      }
    });

    window.addEventListener('offline', () => {
      this.disconnect();
    });
  }

  async connect(): Promise<boolean> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return true;
    }

    this.isConnecting = true;

    try {
      // 获取当前用户会话
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        console.error('No valid session for WebSocket connection');
        this.isConnecting = false;
        return false;
      }

      // 生成WebSocket连接token
      const token = session.access_token;
      const wsUrl = `ws://localhost:8080?token=${encodeURIComponent(token)}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.connectionHandlers.forEach(handler => handler());
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.cleanup();
        this.disconnectionHandlers.forEach(handler => handler());
        
        // 自动重连
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.errorHandlers.forEach(handler => handler(error));
        this.isConnecting = false;
      };

      return true;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.isConnecting = false;
      return false;
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
    }
    this.cleanup();
  }

  private cleanup() {
    this.ws = null;
    this.connectionId = null;
    this.isConnecting = false;
    this.stopHeartbeat();
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.connect();
      }
    }, delay);
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000); // 30秒心跳
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'connection_established':
        this.connectionId = message.connectionId || null;
        console.log('WebSocket connection established:', this.connectionId);
        // 重新订阅之前的主题
        this.resubscribeAll();
        break;

      case 'subscription_confirmed':
        console.log('Subscription confirmed for topics:', message.topics);
        break;

      case 'unsubscription_confirmed':
        console.log('Unsubscription confirmed for topics:', message.topics);
        break;

      case 'broadcast':
      case 'direct_message':
        if (message.topic) {
          this.notifySubscribers(message.topic, message.payload);
        }
        break;

      case 'task_control_success':
        this.notifySubscribers('task_control_response', {
          success: true,
          taskId: message.taskId,
          action: message.action
        });
        break;

      case 'error':
        console.error('WebSocket server error:', message);
        this.notifySubscribers('error', message);
        break;

      case 'pong':
        // 心跳响应，无需处理
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private notifySubscribers(topic: string, data: any) {
    const handlers = this.messageHandlers.get(topic);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in message handler for topic ${topic}:`, error);
        }
      });
    }
  }

  private resubscribeAll() {
    if (this.subscriptions.size > 0) {
      const topics = Array.from(this.subscriptions.keys());
      this.send({
        type: 'subscribe',
        topics
      });
    }
  }

  send(message: WebSocketMessage): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected');
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      return false;
    }
  }

  subscribe(topic: string, options: SubscriptionOptions = {}): () => void {
    // 添加订阅
    this.subscriptions.set(topic, options);
    
    // 添加消息处理器
    if (options.onMessage) {
      if (!this.messageHandlers.has(topic)) {
        this.messageHandlers.set(topic, []);
      }
      this.messageHandlers.get(topic)!.push(options.onMessage);
    }

    // 发送订阅请求
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({
        type: 'subscribe',
        topics: [topic]
      });
    }

    // 返回取消订阅函数
    return () => {
      this.unsubscribe(topic, options.onMessage);
    };
  }

  unsubscribe(topic: string, handler?: MessageHandler) {
    if (handler) {
      // 移除特定处理器
      const handlers = this.messageHandlers.get(topic);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
        if (handlers.length === 0) {
          this.messageHandlers.delete(topic);
        }
      }
    } else {
      // 移除所有处理器
      this.messageHandlers.delete(topic);
    }

    // 如果没有更多处理器，取消订阅
    if (!this.messageHandlers.has(topic)) {
      this.subscriptions.delete(topic);
      
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({
          type: 'unsubscribe',
          topics: [topic]
        });
      }
    }
  }

  // 任务控制方法
  controlTask(taskId: string, action: string, params?: any): boolean {
    return this.send({
      type: 'task_control',
      taskId,
      action,
      params
    });
  }

  pauseTask(taskId: string): boolean {
    return this.controlTask(taskId, 'pause');
  }

  resumeTask(taskId: string): boolean {
    return this.controlTask(taskId, 'resume');
  }

  cancelTask(taskId: string): boolean {
    return this.controlTask(taskId, 'cancel');
  }

  restartTask(taskId: string): boolean {
    return this.controlTask(taskId, 'restart');
  }

  updateTaskParams(taskId: string, params: any): boolean {
    return this.controlTask(taskId, 'update_params', params);
  }

  // 事件监听器
  onConnect(handler: ConnectionHandler): () => void {
    this.connectionHandlers.push(handler);
    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.disconnectionHandlers.push(handler);
    return () => {
      const index = this.disconnectionHandlers.indexOf(handler);
      if (index > -1) {
        this.disconnectionHandlers.splice(index, 1);
      }
    };
  }

  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.push(handler);
    return () => {
      const index = this.errorHandlers.indexOf(handler);
      if (index > -1) {
        this.errorHandlers.splice(index, 1);
      }
    };
  }

  // 获取连接状态
  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  get readyState(): number {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED;
  }

  get connectionInfo() {
    return {
      connected: this.isConnected,
      connectionId: this.connectionId,
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: Array.from(this.subscriptions.keys())
    };
  }
}

// 创建全局WebSocket管理器实例
const wsManager = new WebSocketManager();

// 导出WebSocket管理器和相关类型
export default wsManager;
export type { MessageHandler, ConnectionHandler, ErrorHandler, WebSocketMessage, SubscriptionOptions };

// 便捷的Hook函数
export const useWebSocket = () => {
  return {
    connect: () => wsManager.connect(),
    disconnect: () => wsManager.disconnect(),
    subscribe: (topic: string, options: SubscriptionOptions) => wsManager.subscribe(topic, options),
    unsubscribe: (topic: string, handler?: MessageHandler) => wsManager.unsubscribe(topic, handler),
    send: (message: WebSocketMessage) => wsManager.send(message),
    controlTask: (taskId: string, action: string, params?: any) => wsManager.controlTask(taskId, action, params),
    pauseTask: (taskId: string) => wsManager.pauseTask(taskId),
    resumeTask: (taskId: string) => wsManager.resumeTask(taskId),
    cancelTask: (taskId: string) => wsManager.cancelTask(taskId),
    restartTask: (taskId: string) => wsManager.restartTask(taskId),
    updateTaskParams: (taskId: string, params: any) => wsManager.updateTaskParams(taskId, params),
    onConnect: (handler: ConnectionHandler) => wsManager.onConnect(handler),
    onDisconnect: (handler: ConnectionHandler) => wsManager.onDisconnect(handler),
    onError: (handler: ErrorHandler) => wsManager.onError(handler),
    isConnected: wsManager.isConnected,
    connectionInfo: wsManager.connectionInfo
  };
};