// 简化的本地认证系统
// Simplified Local Authentication System

export interface MockUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

const MOCK_USERS: MockUser[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'test@demo.com',
    name: '测试用户',
    avatar: undefined
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'admin@demo.com',
    name: '管理员',
    avatar: undefined
  }
];

class MockAuthService {
  private currentUser: MockUser | null = null;
  private listeners: ((user: MockUser | null) => void)[] = [];

  constructor() {
    // 从localStorage恢复用户状态
    const savedUser = localStorage.getItem('mock_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('mock_user');
      }
    }
  }

  // 登录
  async login(email: string, password: string): Promise<{ user: MockUser | null; error: string | null }> {
    console.log('🔐 Mock登录尝试:', email);
    
    // 简单的用户验证
    const user = MOCK_USERS.find(u => u.email === email);
    if (!user) {
      return { user: null, error: '用户不存在' };
    }

    // 简单的密码验证（实际项目中不要这样做）
    if (password !== '123456' && password !== 'admin123') {
      return { user: null, error: '密码错误' };
    }

    this.currentUser = user;
    localStorage.setItem('mock_user', JSON.stringify(user));
    this.notifyListeners();
    
    console.log('✅ Mock登录成功:', user);
    return { user, error: null };
  }

  // 注册
  async register(email: string, password: string, name: string): Promise<{ user: MockUser | null; error: string | null }> {
    console.log('📝 Mock注册尝试:', email, name);
    
    // 检查用户是否已存在
    const existingUser = MOCK_USERS.find(u => u.email === email);
    if (existingUser) {
      return { user: null, error: '用户已存在' };
    }

    // 创建新用户
    const newUser: MockUser = {
      id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      avatar: undefined
    };

    MOCK_USERS.push(newUser);
    this.currentUser = newUser;
    localStorage.setItem('mock_user', JSON.stringify(newUser));
    this.notifyListeners();
    
    console.log('✅ Mock注册成功:', newUser);
    return { user: newUser, error: null };
  }

  // 登出
  async logout(): Promise<void> {
    console.log('👋 Mock登出');
    this.currentUser = null;
    localStorage.removeItem('mock_user');
    this.notifyListeners();
  }

  // 获取当前用户
  getCurrentUser(): MockUser | null {
    return this.currentUser;
  }

  // 检查是否已登录
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // 添加状态监听器
  onAuthStateChange(callback: (user: MockUser | null) => void): () => void {
    this.listeners.push(callback);
    
    // 返回取消监听的函数
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // 通知所有监听器
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.currentUser));
  }

  // 自动登录（用于测试）
  async autoLogin(): Promise<void> {
    if (!this.currentUser) {
      console.log('🤖 自动登录测试用户');
      await this.login('test@demo.com', '123456');
    }
  }
}

// 导出单例实例
export const mockAuthService = new MockAuthService();

// 保持向后兼容的导出
export const mockAuth = {
  login: (email: string, password: string) => mockAuthService.login(email, password),
  logout: () => mockAuthService.logout(),
  getCurrentUser: () => mockAuthService.getCurrentUser(),
  isAuthenticated: () => mockAuthService.isAuthenticated()
};

// 自动登录（仅在开发环境）
if (import.meta.env.DEV) {
  // 延迟自动登录，避免在初始化时立即执行
  setTimeout(() => {
    mockAuthService.autoLogin();
  }, 100);
}

export default MockAuthService