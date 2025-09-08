import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { mockAuthService, type MockUser } from '../lib/mockAuth'
import type { AuthUser, AuthContextType, AuthState, Profile, ProfileUpdate, LoginCredentials, RegisterCredentials, ResetPasswordCredentials, UpdatePasswordCredentials } from '../types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false
  })

  // 将MockUser转换为AuthUser
  const convertMockUserToAuthUser = (mockUser: MockUser): AuthUser => ({
    id: mockUser.id,
    email: mockUser.email,
    app_metadata: {},
    aud: 'authenticated',
    user_metadata: {
      full_name: mockUser.name,
      avatar_url: mockUser.avatar || null
    },
    created_at: new Date().toISOString(),
    profile: {
      id: mockUser.id,
      user_id: mockUser.id,
      full_name: mockUser.name,
      avatar_url: mockUser.avatar || null,
      phone: null,
      bio: null,
      website: null,
      location: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  })

  // Fetch user profile - 暂时跳过profiles表查询
  const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
      // 暂时返回默认的用户资料，避免profiles表不存在的错误
      return {
        id: userId,
        user_id: userId,
        full_name: '测试用户',
        avatar_url: null,
        phone: null,
        bio: null,
        website: null,
        location: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  // Set user with profile
  const setUserWithProfile = async (user: User | null, session: Session | null) => {
    if (user) {
      const profile = await fetchUserProfile(user.id)
      const authUser: AuthUser = { ...user, profile: profile || undefined }
      setState(prev => ({ ...prev, user: authUser, session, loading: false }))
    } else {
      setState(prev => ({ ...prev, user: null, session: null, loading: false }))
    }
  }

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log('🔄 初始化认证状态...');
        
        // 使用mock认证服务
        const currentUser = mockAuthService.getCurrentUser();
        
        if (mounted) {
          if (currentUser) {
            console.log('✅ 发现已登录用户:', currentUser);
            const authUser = convertMockUserToAuthUser(currentUser);
            setState({
              user: authUser,
              session: null, // Mock模式下不需要session
              loading: false,
              initialized: true
            });
          } else {
            console.log('ℹ️ 未发现登录用户');
            setState({
              user: null,
              session: null,
              loading: false,
              initialized: true
            });
          }
        }
      } catch (error) {
        console.error('❌ 认证初始化错误:', error);
        if (mounted) {
          setState({
            user: null,
            session: null,
            loading: false,
            initialized: true
          });
        }
      }
    };

    initializeAuth();

    // 监听mock认证状态变化
    const unsubscribe = mockAuthService.onAuthStateChange((mockUser) => {
      if (mounted) {
        if (mockUser) {
          console.log('🔄 用户登录状态变化:', mockUser);
          const authUser = convertMockUserToAuthUser(mockUser);
          setState({
            user: authUser,
            session: null,
            loading: false,
            initialized: true
          });
        } else {
          console.log('🔄 用户登出');
          setState({
            user: null,
            session: null,
            loading: false,
            initialized: true
          });
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [])

  // Sign in with email and password
  const signIn = async (credentials: LoginCredentials) => {
    try {
      setState((prev: AuthState) => ({ ...prev, loading: true }))
      
      console.log('🔐 尝试登录:', credentials.email);
      const result = await mockAuthService.login(credentials.email, credentials.password);

      if (result.error) {
        setState((prev: AuthState) => ({ ...prev, loading: false }))
        return { error: new Error(result.error) }
      }

      // 用户状态将通过认证状态监听器自动更新
      console.log('✅ 登录成功');
      return { error: null }
    } catch (error) {
      setState((prev: AuthState) => ({ ...prev, loading: false }))
      console.error('❌ 登录失败:', error);
      return { error: error as Error }
    }
  }

  // Sign up with email and password
  const signUp = async (credentials: RegisterCredentials) => {
    try {
      setState((prev: AuthState) => ({ ...prev, loading: true }))
      
      console.log('📝 尝试注册:', credentials.email, credentials.fullName);
      const result = await mockAuthService.register(credentials.email, credentials.password, credentials.fullName || '');

      if (result.error) {
        setState((prev: AuthState) => ({ ...prev, loading: false }))
        return { error: new Error(result.error) }
      }

      console.log('✅ 注册成功');
      return { error: null }
    } catch (error) {
      setState((prev: AuthState) => ({ ...prev, loading: false }))
      console.error('❌ 注册失败:', error);
      return { error: error as Error }
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      console.log('🚪 用户登出');
      await mockAuthService.logout();
      
      // 用户状态将通过认证状态监听器自动更新
      return { error: null }
    } catch (error) {
      console.error('❌ 登出失败:', error);
      return { error: error as Error }
    }
  }

  // Reset password
  const resetPassword = async (credentials: ResetPasswordCredentials) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        credentials.email,
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      )

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Update password
  const updatePassword = async (credentials: UpdatePasswordCredentials) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: credentials.password
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Sign in with OAuth provider
  const signInWithProvider = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Update user profile
  const updateProfile = async (updates: ProfileUpdate) => {
    try {
      if (!state.user) {
        return { error: new Error('User not authenticated') }
      }

      const { error } = await (supabase as any)
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', state.user.id)

      if (error) {
        return { error: new Error(error.message) }
      }

      // Refresh user profile
      const profile = await fetchUserProfile(state.user.id)
      if (profile) {
        setState((prev: AuthState) => ({
        ...prev,
        user: prev.user ? { ...prev.user, profile } : null
      }))
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Refresh session
  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Error refreshing session:', error)
        return
      }

      await setUserWithProfile(session?.user || null, session)
    } catch (error) {
      console.error('Error refreshing session:', error)
    }
  }

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    signInWithProvider,
    updateProfile,
    refreshSession
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider