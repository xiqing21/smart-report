import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
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

  // Fetch user profile
  const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data
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
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          if (mounted) {
            setState(prev => ({ ...prev, loading: false, initialized: true }))
          }
          return
        }

        if (mounted) {
          await setUserWithProfile(session?.user || null, session)
          setState(prev => ({ ...prev, initialized: true }))
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setState(prev => ({ ...prev, loading: false, initialized: true }))
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: Session | null) => {
        if (mounted) {
          await setUserWithProfile(session?.user || null, session)
          
          // Log auth events
          if (event === 'SIGNED_IN' && session?.user) {
            await supabase.from('audit_logs').insert({
              user_id: session.user.id,
              action: 'sign_in',
              details: { event }
            })
          } else if (event === 'SIGNED_OUT') {
            await supabase.from('audit_logs').insert({
              action: 'sign_out',
              details: { event }
            })
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Sign in with email and password
  const signIn = async (credentials: LoginCredentials) => {
    try {
      setState((prev: AuthState) => ({ ...prev, loading: true }))
      
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (error) {
        setState((prev: AuthState) => ({ ...prev, loading: false }))
        return { error }
      }

      return { error: null }
    } catch (error) {
      setState((prev: AuthState) => ({ ...prev, loading: false }))
      return { error: error as Error }
    }
  }

  // Sign up with email and password
  const signUp = async (credentials: RegisterCredentials) => {
    try {
      setState((prev: AuthState) => ({ ...prev, loading: true }))
      
      const { error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName || ''
          }
        }
      })

      if (error) {
        setState((prev: AuthState) => ({ ...prev, loading: false }))
        return { error }
      }

      return { error: null }
    } catch (error) {
      setState((prev: AuthState) => ({ ...prev, loading: false }))
      return { error: error as Error }
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      setState((prev: AuthState) => ({ ...prev, loading: true }))
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setState((prev: AuthState) => ({ ...prev, loading: false }))
        return { error }
      }

      return { error: null }
    } catch (error) {
      setState((prev: AuthState) => ({ ...prev, loading: false }))
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

      const { error } = await supabase
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