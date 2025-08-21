import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'
import { createMockSupabaseClient } from './mockAuth'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 检查是否为演示环境
const isDemoMode = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('demo.supabase.co')

export const supabase = isDemoMode 
  ? createMockSupabaseClient() as any
  : createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })

// Auth helpers
export const auth = supabase.auth

// Database helpers
export const db = supabase

export default supabase