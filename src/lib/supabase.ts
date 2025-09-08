import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// 生产环境使用实际的Supabase配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
  (import.meta.env.PROD ? 'https://guctneudvvondncjnmgo.supabase.co' : 'https://your-project.supabase.co')
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
  (import.meta.env.PROD ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1Y3RuZXVkdnZvbmRuY2pubWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NzMyODQsImV4cCI6MjA3MjU0OTI4NH0.5q-0bSWtboPurPmgK0X6AKR-erTDoNEvazclWu3YMJM' : 'your-anon-key')

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Auth helpers
export const auth = supabase.auth

// Database helpers
export const db = supabase

// 导出类型
export type { Database } from '../types/database'

export default supabase