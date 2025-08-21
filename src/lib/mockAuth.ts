// 模拟认证服务，用于演示
interface MockUser {
  id: string
  email: string
  user_metadata: {
    full_name?: string
  }
  created_at: string
}

interface MockSession {
  user: MockUser
  access_token: string
  refresh_token: string
}

class MockAuthService {
  private users: Map<string, { email: string; password: string; user_metadata: any }> = new Map()
  private currentSession: MockSession | null = null
  private listeners: Array<(event: string, session: MockSession | null) => void> = []

  constructor() {
    // 预设一些测试用户
    this.users.set('test@demo.com', {
      email: 'test@demo.com',
      password: '123456',
      user_metadata: { full_name: '测试用户' }
    })
    this.users.set('admin@demo.com', {
      email: 'admin@demo.com',
      password: 'admin123',
      user_metadata: { full_name: '系统管理员' }
    })

    // 从 localStorage 恢复会话
    const savedSession = localStorage.getItem('mock_session')
    if (savedSession) {
      try {
        this.currentSession = JSON.parse(savedSession)
      } catch (e) {
        localStorage.removeItem('mock_session')
      }
    }
  }

  // 获取当前会话
  async getSession() {
    return {
      data: { session: this.currentSession },
      error: null
    }
  }

  // 登录
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const user = this.users.get(email)
    if (!user || user.password !== password) {
      return {
        data: { user: null, session: null },
        error: { message: '邮箱或密码错误' }
      }
    }

    const mockUser: MockUser = {
      id: `user_${Date.now()}`,
      email: user.email,
      user_metadata: user.user_metadata,
      created_at: new Date().toISOString()
    }

    const session: MockSession = {
      user: mockUser,
      access_token: `mock_token_${Date.now()}`,
      refresh_token: `mock_refresh_${Date.now()}`
    }

    this.currentSession = session
    localStorage.setItem('mock_session', JSON.stringify(session))
    
    // 通知监听器
    this.listeners.forEach(listener => listener('SIGNED_IN', session))

    return {
      data: { user: mockUser, session },
      error: null
    }
  }

  // 注册
  async signUp({ email, password, options }: { 
    email: string; 
    password: string; 
    options?: { data?: any } 
  }) {
    if (this.users.has(email)) {
      return {
        data: { user: null, session: null },
        error: { message: '该邮箱已被注册' }
      }
    }

    // 添加新用户
    this.users.set(email, {
      email,
      password,
      user_metadata: options?.data || {}
    })

    const mockUser: MockUser = {
      id: `user_${Date.now()}`,
      email,
      user_metadata: options?.data || {},
      created_at: new Date().toISOString()
    }

    const session: MockSession = {
      user: mockUser,
      access_token: `mock_token_${Date.now()}`,
      refresh_token: `mock_refresh_${Date.now()}`
    }

    this.currentSession = session
    localStorage.setItem('mock_session', JSON.stringify(session))
    
    // 通知监听器
    this.listeners.forEach(listener => listener('SIGNED_IN', session))

    return {
      data: { user: mockUser, session },
      error: null
    }
  }

  // 登出
  async signOut() {
    this.currentSession = null
    localStorage.removeItem('mock_session')
    
    // 通知监听器
    this.listeners.forEach(listener => listener('SIGNED_OUT', null))

    return { error: null }
  }

  // 重置密码
  async resetPasswordForEmail(email: string, _options?: any) {
    if (!this.users.has(email)) {
      return { error: { message: '该邮箱未注册' } }
    }
    
    // 模拟发送重置邮件
    console.log(`模拟发送密码重置邮件到: ${email}`)
    return { error: null }
  }

  // 更新用户
  async updateUser(updates: any) {
    if (!this.currentSession) {
      return { error: { message: '用户未登录' } }
    }

    // 更新当前会话中的用户信息
    this.currentSession.user = { ...this.currentSession.user, ...updates }
    localStorage.setItem('mock_session', JSON.stringify(this.currentSession))

    return {
      data: { user: this.currentSession.user },
      error: null
    }
  }

  // OAuth 登录（模拟）
  async signInWithOAuth({ provider }: { provider: string }) {
    // 模拟 OAuth 登录
    const mockUser: MockUser = {
      id: `${provider}_user_${Date.now()}`,
      email: `user@${provider}.com`,
      user_metadata: { full_name: `${provider} 用户` },
      created_at: new Date().toISOString()
    }

    const session: MockSession = {
      user: mockUser,
      access_token: `mock_${provider}_token_${Date.now()}`,
      refresh_token: `mock_${provider}_refresh_${Date.now()}`
    }

    this.currentSession = session
    localStorage.setItem('mock_session', JSON.stringify(session))
    
    // 通知监听器
    this.listeners.forEach(listener => listener('SIGNED_IN', session))

    return { error: null }
  }

  // 刷新会话
  async refreshSession() {
    if (!this.currentSession) {
      return {
        data: { session: null },
        error: { message: '无有效会话' }
      }
    }

    // 更新 token
    this.currentSession.access_token = `mock_token_${Date.now()}`
    this.currentSession.refresh_token = `mock_refresh_${Date.now()}`
    localStorage.setItem('mock_session', JSON.stringify(this.currentSession))

    return {
      data: { session: this.currentSession },
      error: null
    }
  }

  // 监听认证状态变化
  onAuthStateChange(callback: (event: string, session: MockSession | null) => void) {
    this.listeners.push(callback)
    
    // 立即触发当前状态
    setTimeout(() => {
      if (this.currentSession) {
        callback('SIGNED_IN', this.currentSession)
      } else {
        callback('SIGNED_OUT', null)
      }
    }, 100)

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = this.listeners.indexOf(callback)
            if (index > -1) {
              this.listeners.splice(index, 1)
            }
          }
        }
      }
    }
  }
}

// 创建模拟的 Supabase 客户端
export const createMockSupabaseClient = () => {
  const mockAuth = new MockAuthService()

  return {
    auth: mockAuth,
    from: (_table: string) => ({
      select: (_columns: string) => ({
        eq: (_column: string, _value: any) => ({
          single: async () => ({
            data: {
              user_id: 'mock_user_id',
              full_name: '测试用户',
              bio: '这是一个测试用户',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            error: null
          })
        })
      }),
      insert: async (data: any) => ({ data, error: null }),
      update: (data: any) => ({
        eq: (_column: string, _value: any) => ({
          async: async () => ({ data, error: null })
        })
      })
    })
  }
}

export default MockAuthService