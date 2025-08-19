# 智能报告生成系统Supabase集成实施方案

## 1. 项目概述

### 1.1 技术栈选择
- **前端框架**: React 18 + TypeScript + Vite
- **UI组件库**: Ant Design + Tailwind CSS
- **状态管理**: Zustand
- **后端服务**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **图表库**: ECharts + React-ECharts
- **富文本编辑**: Quill.js
- **部署平台**: Vercel (前端) + Supabase (后端)

### 1.2 项目结构
```
smart-report/
├── src/
│   ├── components/          # 通用组件
│   │   ├── ui/             # 基础UI组件
│   │   ├── charts/         # 图表组件
│   │   ├── editor/         # 编辑器组件
│   │   └── layout/         # 布局组件
│   ├── pages/              # 页面组件
│   │   ├── auth/           # 认证页面
│   │   ├── dashboard/      # 工作台
│   │   ├── reports/        # 报告管理
│   │   ├── editor/         # 报告编辑器
│   │   ├── templates/      # 模板中心
│   │   └── analytics/      # AI分析中心
│   ├── hooks/              # 自定义Hooks
│   ├── stores/             # Zustand状态管理
│   ├── services/           # API服务层
│   ├── utils/              # 工具函数
│   ├── types/              # TypeScript类型定义
│   └── styles/             # 样式文件
├── public/                 # 静态资源
├── supabase/              # Supabase配置
│   ├── migrations/        # 数据库迁移
│   └── functions/         # Edge Functions
└── docs/                  # 项目文档
```

## 2. Supabase环境配置

### 2.1 项目初始化

**安装Supabase CLI**
```bash
npm install -g @supabase/cli
```

**初始化项目**
```bash
supabase init
supabase start
```

**环境变量配置**
```env
# .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2.2 数据库设计与迁移

**用户扩展表**
```sql
-- 创建用户配置表
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'analyst', 'user', 'viewer')),
    department VARCHAR(100),
    position VARCHAR(100),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建RLS策略
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);
```

**报告相关表**
```sql
-- 报告分类表
CREATE TABLE report_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#1890FF',
    icon VARCHAR(50),
    parent_id UUID REFERENCES report_categories(id),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 报告表
CREATE TABLE reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
    category_id UUID REFERENCES report_categories(id),
    template_id UUID REFERENCES report_templates(id),
    author_id UUID REFERENCES auth.users(id) NOT NULL,
    reviewer_id UUID REFERENCES auth.users(id),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    version INTEGER DEFAULT 1,
    is_public BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_reports_author ON reports(author_id);
CREATE INDEX idx_reports_category ON reports(category_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- RLS策略
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports" ON reports
    FOR SELECT USING (auth.uid() = author_id OR is_public = true);

CREATE POLICY "Users can create reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own reports" ON reports
    FOR UPDATE USING (auth.uid() = author_id);
```

**模板相关表**
```sql
-- 报告模板表
CREATE TABLE report_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    preview_image TEXT,
    content JSONB NOT NULL DEFAULT '{}',
    category_id UUID REFERENCES report_categories(id),
    author_id UUID REFERENCES auth.users(id) NOT NULL,
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 模板评分表
CREATE TABLE template_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES report_templates(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(template_id, user_id)
);
```

**数据源和分析表**
```sql
-- 数据源表
CREATE TABLE data_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('database', 'api', 'file', 'manual')),
    connection_config JSONB NOT NULL DEFAULT '{}',
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI分析任务表
CREATE TABLE analysis_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('trend', 'anomaly', 'correlation', 'forecast')),
    data_source_id UUID REFERENCES data_sources(id) NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    result JSONB,
    error_message TEXT,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.3 存储桶配置

**创建存储桶**
```sql
-- 创建存储桶
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true),
('reports', 'reports', false),
('templates', 'templates', true),
('uploads', 'uploads', false);

-- 设置存储策略
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own reports" ON storage.objects
    FOR SELECT USING (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload reports" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 3. 前端架构实现

### 3.1 Supabase客户端配置

**supabase客户端初始化**
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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

// 类型安全的数据库操作
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
```

**认证状态管理**
```typescript
// src/stores/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { Tables } from '../lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Tables<'user_profiles'> | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Tables<'user_profiles'>>) => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(persist(
  (set, get) => ({
    user: null,
    session: null,
    profile: null,
    loading: true,

    signIn: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      
      // 获取用户配置
      if (data.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        set({ user: data.user, session: data.session, profile })
      }
    },

    signUp: async (email: string, password: string, userData: any) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      if (error) throw error
    },

    signOut: async () => {
      await supabase.auth.signOut()
      set({ user: null, session: null, profile: null })
    },

    updateProfile: async (updates) => {
      const { user } = get()
      if (!user) throw new Error('No user logged in')
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()
      
      if (error) throw error
      set({ profile: data })
    },

    initialize: async () => {
      set({ loading: true })
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        set({ user: session.user, session, profile })
      }
      
      set({ loading: false })
      
      // 监听认证状态变化
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          set({ user: session.user, session, profile })
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, session: null, profile: null })
        }
      })
    }
  }),
  {
    name: 'auth-storage',
    partialize: (state) => ({ profile: state.profile })
  }
))
```

### 3.2 报告管理功能实现

**报告状态管理**
```typescript
// src/stores/reportStore.ts
import { create } from 'zustand'
import { supabase, Tables } from '../lib/supabase'

interface ReportState {
  reports: Tables<'reports'>[]
  currentReport: Tables<'reports'> | null
  loading: boolean
  filters: {
    status?: string
    category?: string
    search?: string
  }
  fetchReports: () => Promise<void>
  createReport: (report: Partial<Tables<'reports'>>) => Promise<Tables<'reports'>>
  updateReport: (id: string, updates: Partial<Tables<'reports'>>) => Promise<void>
  deleteReport: (id: string) => Promise<void>
  setFilters: (filters: Partial<ReportState['filters']>) => void
}

export const useReportStore = create<ReportState>((set, get) => ({
  reports: [],
  currentReport: null,
  loading: false,
  filters: {},

  fetchReports: async () => {
    set({ loading: true })
    const { filters } = get()
    
    let query = supabase
      .from('reports')
      .select(`
        *,
        category:report_categories(*),
        author:user_profiles(*)
      `)
      .order('created_at', { ascending: false })
    
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters.category) {
      query = query.eq('category_id', filters.category)
    }
    
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    set({ reports: data || [], loading: false })
  },

  createReport: async (reportData) => {
    const { data, error } = await supabase
      .from('reports')
      .insert(reportData)
      .select()
      .single()
    
    if (error) throw error
    
    set(state => ({ reports: [data, ...state.reports] }))
    return data
  },

  updateReport: async (id, updates) => {
    const { data, error } = await supabase
      .from('reports')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    set(state => ({
      reports: state.reports.map(report => 
        report.id === id ? data : report
      ),
      currentReport: state.currentReport?.id === id ? data : state.currentReport
    }))
  },

  deleteReport: async (id) => {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    set(state => ({
      reports: state.reports.filter(report => report.id !== id)
    }))
  },

  setFilters: (newFilters) => {
    set(state => ({ filters: { ...state.filters, ...newFilters } }))
  }
}))
```

**报告列表组件**
```typescript
// src/components/reports/ReportList.tsx
import React, { useEffect } from 'react'
import { Table, Button, Tag, Space, Input, Select, message } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { useReportStore } from '../../stores/reportStore'
import { useAuthStore } from '../../stores/authStore'
import type { Tables } from '../../lib/supabase'

const { Search } = Input
const { Option } = Select

const statusColors = {
  draft: 'default',
  review: 'processing',
  published: 'success',
  archived: 'warning'
}

const statusLabels = {
  draft: '草稿',
  review: '审核中',
  published: '已发布',
  archived: '已归档'
}

export const ReportList: React.FC = () => {
  const { 
    reports, 
    loading, 
    filters, 
    fetchReports, 
    deleteReport, 
    setFilters 
  } = useReportStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchReports()
  }, [filters])

  const handleDelete = async (id: string) => {
    try {
      await deleteReport(id)
      message.success('报告删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof statusLabels) => (
        <Tag color={statusColors[status]}>
          {statusLabels[status]}
        </Tag>
      )
    },
    {
      title: '分类',
      dataIndex: ['category', 'name'],
      key: 'category'
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: Tables<'reports'>) => (
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => window.open(`/reports/${record.id}`)}
          >
            查看
          </Button>
          {record.author_id === user?.id && (
            <>
              <Button 
                type="text" 
                icon={<EditOutlined />}
                onClick={() => window.open(`/editor/${record.id}`)}
              >
                编辑
              </Button>
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.id)}
              >
                删除
              </Button>
            </>
          )}
        </Space>
      )
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Search
            placeholder="搜索报告标题或描述"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            style={{ width: 300 }}
          />
          <Select
            placeholder="选择状态"
            value={filters.status}
            onChange={(value) => setFilters({ status: value })}
            allowClear
            style={{ width: 120 }}
          >
            <Option value="draft">草稿</Option>
            <Option value="review">审核中</Option>
            <Option value="published">已发布</Option>
            <Option value="archived">已归档</Option>
          </Select>
        </div>
        <Button type="primary" onClick={() => window.open('/editor/new')}>
          新建报告
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={reports}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
      />
    </div>
  )
}
```

### 3.3 实时协作功能

**实时编辑状态管理**
```typescript
// src/stores/collaborationStore.ts
import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface CollaborationState {
  onlineUsers: Array<{
    user_id: string
    username: string
    avatar_url?: string
    cursor_position?: number
    last_seen: string
  }>
  channel: RealtimeChannel | null
  joinRoom: (reportId: string) => void
  leaveRoom: () => void
  broadcastCursor: (position: number) => void
  broadcastChange: (change: any) => void
}

export const useCollaborationStore = create<CollaborationState>((set, get) => ({
  onlineUsers: [],
  channel: null,

  joinRoom: (reportId: string) => {
    const channel = supabase.channel(`report:${reportId}`, {
      config: {
        presence: {
          key: 'user_id'
        }
      }
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users = Object.values(state).flat()
        set({ onlineUsers: users })
      })
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        // 处理光标位置更新
        console.log('Cursor update:', payload)
      })
      .on('broadcast', { event: 'change' }, ({ payload }) => {
        // 处理文档变更
        console.log('Document change:', payload)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const user = supabase.auth.getUser()
          await channel.track({
            user_id: (await user).data.user?.id,
            username: (await user).data.user?.user_metadata?.username,
            avatar_url: (await user).data.user?.user_metadata?.avatar_url,
            last_seen: new Date().toISOString()
          })
        }
      })

    set({ channel })
  },

  leaveRoom: () => {
    const { channel } = get()
    if (channel) {
      channel.unsubscribe()
      set({ channel: null, onlineUsers: [] })
    }
  },

  broadcastCursor: (position: number) => {
    const { channel } = get()
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'cursor',
        payload: { position }
      })
    }
  },

  broadcastChange: (change: any) => {
    const { channel } = get()
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'change',
        payload: change
      })
    }
  }
}))
```

### 3.4 文件上传和管理

**文件上传组件**
```typescript
// src/components/upload/FileUpload.tsx
import React, { useState } from 'react'
import { Upload, message, Progress } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

const { Dragger } = Upload

interface FileUploadProps {
  bucket: string
  folder?: string
  accept?: string
  maxSize?: number // MB
  onSuccess?: (url: string, file: File) => void
  onError?: (error: Error) => void
}

export const FileUpload: React.FC<FileUploadProps> = ({
  bucket,
  folder = '',
  accept = '*',
  maxSize = 10,
  onSuccess,
  onError
}) => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const { user } = useAuthStore()

  const uploadFile = async (file: File) => {
    if (!user) {
      message.error('请先登录')
      return false
    }

    if (file.size > maxSize * 1024 * 1024) {
      message.error(`文件大小不能超过 ${maxSize}MB`)
      return false
    }

    setUploading(true)
    setProgress(0)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = folder ? `${folder}/${fileName}` : fileName
      const fullPath = `${user.id}/${filePath}`

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            setProgress((progress.loaded / progress.total) * 100)
          }
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      message.success('文件上传成功')
      onSuccess?.(publicUrl, file)
      
    } catch (error) {
      console.error('Upload error:', error)
      message.error('文件上传失败')
      onError?.(error as Error)
    } finally {
      setUploading(false)
      setProgress(0)
    }

    return false // 阻止默认上传行为
  }

  return (
    <div>
      <Dragger
        accept={accept}
        beforeUpload={uploadFile}
        showUploadList={false}
        disabled={uploading}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          {uploading ? '上传中...' : '点击或拖拽文件到此区域上传'}
        </p>
        <p className="ant-upload-hint">
          支持单个文件上传，文件大小不超过 {maxSize}MB
        </p>
      </Dragger>
      
      {uploading && (
        <div className="mt-4">
          <Progress percent={Math.round(progress)} status="active" />
        </div>
      )}
    </div>
  )
}
```

## 4. AI功能集成

### 4.1 Edge Functions实现

**AI分析服务**
```typescript
// supabase/functions/ai-analysis/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { analysisType, data, config } = await req.json()
    
    // 创建Supabase客户端
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 获取用户信息
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('Unauthorized')
    }

    // 根据分析类型执行不同的AI分析
    let result
    switch (analysisType) {
      case 'trend':
        result = await performTrendAnalysis(data, config)
        break
      case 'anomaly':
        result = await performAnomalyDetection(data, config)
        break
      case 'correlation':
        result = await performCorrelationAnalysis(data, config)
        break
      case 'forecast':
        result = await performForecast(data, config)
        break
      default:
        throw new Error('Unsupported analysis type')
    }

    // 保存分析结果
    const { data: analysisTask } = await supabaseClient
      .from('analysis_tasks')
      .insert({
        name: config.name || `${analysisType} Analysis`,
        type: analysisType,
        config,
        status: 'completed',
        result,
        user_id: user.id,
        completed_at: new Date().toISOString()
      })
      .select()
      .single()

    return new Response(
      JSON.stringify({ success: true, data: analysisTask }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

// AI分析函数实现
async function performTrendAnalysis(data: any[], config: any) {
  // 调用外部AI服务或实现趋势分析算法
  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: '你是一个数据分析专家，请分析以下数据的趋势并提供洞察。'
      }, {
        role: 'user',
        content: `请分析以下数据的趋势：${JSON.stringify(data)}`
      }],
      max_tokens: 1000
    })
  })

  const result = await openaiResponse.json()
  return {
    insights: result.choices[0].message.content,
    trends: extractTrends(data),
    recommendations: generateRecommendations(data)
  }
}

async function performAnomalyDetection(data: any[], config: any) {
  // 实现异常检测算法
  const anomalies = detectAnomalies(data, config.threshold || 2)
  return {
    anomalies,
    anomaly_count: anomalies.length,
    severity_distribution: calculateSeverityDistribution(anomalies)
  }
}

// 辅助函数
function extractTrends(data: any[]) {
  // 实现趋势提取逻辑
  return {
    direction: 'increasing',
    strength: 0.75,
    seasonality: 'monthly'
  }
}

function detectAnomalies(data: any[], threshold: number) {
  // 实现异常检测逻辑
  return data.filter((point, index) => {
    const mean = data.reduce((sum, p) => sum + p.value, 0) / data.length
    const stdDev = Math.sqrt(data.reduce((sum, p) => sum + Math.pow(p.value - mean, 2), 0) / data.length)
    return Math.abs(point.value - mean) > threshold * stdDev
  })
}
```

### 4.2 前端AI功能组件

**AI分析面板**
```typescript
// src/components/ai/AnalysisPanel.tsx
import React, { useState } from 'react'
import { Card, Button, Select, Form, Input, message, Spin } from 'antd'
import { RobotOutlined, BarChartOutlined } from '@ant-design/icons'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

const { Option } = Select
const { TextArea } = Input

interface AnalysisPanelProps {
  data: any[]
  onAnalysisComplete?: (result: any) => void
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ 
  data, 
  onAnalysisComplete 
}) => {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const { session } = useAuthStore()

  const handleAnalysis = async (values: any) => {
    if (!session) {
      message.error('请先登录')
      return
    }

    setLoading(true)
    try {
      const { data: result, error } = await supabase.functions.invoke('ai-analysis', {
        body: {
          analysisType: values.type,
          data,
          config: {
            name: values.name,
            description: values.description,
            threshold: values.threshold,
            timeRange: values.timeRange
          }
        }
      })

      if (error) throw error

      message.success('AI分析完成')
      onAnalysisComplete?.(result.data)
      form.resetFields()
    } catch (error) {
      console.error('Analysis error:', error)
      message.error('AI分析失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card 
      title={
        <div className="flex items-center space-x-2">
          <RobotOutlined className="text-blue-500" />
          <span>AI智能分析</span>
        </div>
      }
      className="w-full"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleAnalysis}
        disabled={loading}
      >
        <Form.Item
          name="name"
          label="分析名称"
          rules={[{ required: true, message: '请输入分析名称' }]}
        >
          <Input placeholder="为这次分析起个名字" />
        </Form.Item>

        <Form.Item
          name="type"
          label="分析类型"
          rules={[{ required: true, message: '请选择分析类型' }]}
        >
          <Select placeholder="选择分析类型">
            <Option value="trend">趋势分析</Option>
            <Option value="anomaly">异常检测</Option>
            <Option value="correlation">关联分析</Option>
            <Option value="forecast">预测分析</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="分析描述"
        >
          <TextArea 
            rows={3} 
            placeholder="描述你希望从数据中获得什么洞察" 
          />
        </Form.Item>

        <Form.Item
          name="threshold"
          label="敏感度阈值"
          initialValue={2}
        >
          <Select>
            <Option value={1}>高敏感度</Option>
            <Option value={2}>中等敏感度</Option>
            <Option value={3}>低敏感度</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            icon={<BarChartOutlined />}
            block
          >
            {loading ? '分析中...' : '开始AI分析'}
          </Button>
        </Form.Item>
      </Form>

      {loading && (
        <div className="text-center py-8">
          <Spin size="large" />
          <p className="mt-4 text-gray-500">AI正在分析您的数据，请稍候...</p>
        </div>
      )}
    </Card>
  )
}
```

## 5. 部署和运维

### 5.1 环境配置

**生产环境变量**
```env
# .env.production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=https://your-app.vercel.app
VITE_OPENAI_API_KEY=your-openai-key
```

**Vercel部署配置**
```json
// vercel.json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  },
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

### 5.2 性能优化

**代码分割和懒加载**
```typescript
// src/router/index.tsx
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Spin } from 'antd'

// 懒加载页面组件
const Dashboard = lazy(() => import('../pages/Dashboard'))
const Reports = lazy(() => import('../pages/Reports'))
const Editor = lazy(() => import('../pages/Editor'))
const Templates = lazy(() => import('../pages/Templates'))
const Analytics = lazy(() => import('../pages/Analytics'))

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <Spin size="large" />
  </div>
)

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/editor/:id?" element={<Editor />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

**数据缓存策略**
```typescript
// src/hooks/useReportsQuery.ts
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export const useReportsQuery = (filters: any = {}) => {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['reports', filters],
    queryFn: async () => {
      let query = supabase
        .from('reports')
        .select(`
          *,
          category:report_categories(*),
          author:user_profiles(*)
        `)
        .order('created_at', { ascending: false })
      
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000, // 5分钟
    cacheTime: 10 * 60 * 1000, // 10分钟
    refetchOnWindowFocus: false
  })
}

// 预加载相关数据
export const prefetchReportData = (queryClient: any, reportId: string) => {
  queryClient.prefetchQuery({
    queryKey: ['report', reportId],
    queryFn: () => fetchReportById(reportId)
  })
}
```

### 5.3 监控和日志

**错误监控**
```typescript
// src/utils/errorTracking.ts
import * as Sentry from '@sentry/react'

// 初始化Sentry
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
})

// 自定义错误处理
export const handleError = (error: Error, context?: any) => {
  console.error('Application Error:', error, context)
  
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('error_context', context)
    }
    Sentry.captureException(error)
  })
}

// 性能监控
export const trackPerformance = (name: string, duration: number) => {
  Sentry.addBreadcrumb({
    message: `Performance: ${name}`,
    level: 'info',
    data: { duration }
  })
}
```

## 6. 开发流程和最佳实践

### 6.1 开发环境设置

**项目初始化脚本**
```bash
#!/bin/bash
# setup.sh

echo "🚀 初始化智能报告生成系统..."

# 安装依赖
npm install

# 设置Supabase
supabase init
supabase start
supabase db reset

# 运行数据库迁移
supabase db push

# 设置存储桶
supabase storage create avatars --public
supabase storage create reports
supabase storage create templates --public
supabase storage create uploads

# 启动开发服务器
npm run dev

echo "✅ 项目初始化完成！"
echo "🌐 访问 http://localhost:5173 开始开发"
echo "📊 Supabase Studio: http://localhost:54323"
```

### 6.2 代码规范

**ESLint配置**
```json
// .eslintrc.json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "prefer-const": "error",
    "no-console": "warn"
  }
}
```

**Prettier配置**
```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### 6.3 测试策略

**单元测试示例**
```typescript
// src/components/__tests__/ReportList.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReportList } from '../reports/ReportList'
import { useReportStore } from '../../stores/reportStore'

// Mock store
jest.mock('../../stores/reportStore')
const mockUseReportStore = useReportStore as jest.MockedFunction<typeof useReportStore>

describe('ReportList', () => {
  beforeEach(() => {
    mockUseReportStore.mockReturnValue({
      reports: [
        {
          id: '1',
          title: '测试报告',
          status: 'draft',
          created_at: '2024-01-01T00:00:00Z',
          author_id: 'user1'
        }
      ],
      loading: false,
      filters: {},
      fetchReports: jest.fn(),
      deleteReport: jest.fn(),
      setFilters: jest.fn()
    })
  })

  it('应该渲染报告列表', async () => {
    render(<ReportList />)
    
    expect(screen.getByText('测试报告')).toBeInTheDocument()
    expect(screen.getByText('草稿')).toBeInTheDocument()
  })

  it('应该支持搜索功能', async () => {
    const user = userEvent.setup()
    const mockSetFilters = jest.fn()
    
    mockUseReportStore.mockReturnValue({
      ...mockUseReportStore(),
      setFilters: mockSetFilters
    })

    render(<ReportList />)
    
    const searchInput = screen.getByPlaceholderText('搜索报告标题或描述')
    await user.type(searchInput, '测试')
    
    await waitFor(() => {
      expect(mockSetFilters).toHaveBeenCalledWith({ search: '测试' })
    })
  })
})
```

### 6.4 CI/CD流程

**GitHub Actions配置**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 7. 总结

本文档详细描述了智能报告生成系统的Supabase集成实施方案，涵盖了：

1. **完整的技术架构**：基于React + Supabase的现代化技术栈
2. **数据库设计**：完整的表结构和RLS安全策略
3. **前端实现**：组件化开发和状态管理
4. **实时协作**：基于Supabase Realtime的多用户协作
5. **AI功能集成**：Edge Functions实现智能分析
6. **文件管理**：完整的上传和存储解决方案
7. **部署运维**：生产环境配置和监控
8. **开发流程**：代码规范、测试和CI/CD

该方案确保了UI设计与技术实现的完美匹配，为用户提供现代化、高效的智能报告生成体验。