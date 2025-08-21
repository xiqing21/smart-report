import type { User, Session } from '@supabase/supabase-js'
import type { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export interface AuthUser extends User {
  profile?: Profile
}

export interface AuthState {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  initialized: boolean
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterCredentials {
  email: string
  password: string
  confirmPassword: string
  fullName?: string
}

export interface ResetPasswordCredentials {
  email: string
}

export interface UpdatePasswordCredentials {
  password: string
  confirmPassword: string
}

export interface AuthContextType extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<{ error: Error | null }>
  signUp: (credentials: RegisterCredentials) => Promise<{ error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
  resetPassword: (credentials: ResetPasswordCredentials) => Promise<{ error: Error | null }>
  updatePassword: (credentials: UpdatePasswordCredentials) => Promise<{ error: Error | null }>
  signInWithProvider: (provider: 'google' | 'github') => Promise<{ error: Error | null }>
  updateProfile: (updates: ProfileUpdate) => Promise<{ error: Error | null }>
  refreshSession: () => Promise<void>
}

export type AuthProvider = 'google' | 'github'

export interface AuthError {
  message: string
  status?: number
}