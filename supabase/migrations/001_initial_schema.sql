-- 山西电网智能报告系统 - 完整数据库架构
-- Smart Report System Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- 1. 组织和角色管理
-- ============================================================================

-- 组织表
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES public.organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 角色表
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户扩展信息表
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE,
    full_name VARCHAR(200),
    avatar_url TEXT,
    phone VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    role_id UUID REFERENCES public.roles(id),
    organization_id UUID REFERENCES public.organizations(id),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- ============================================================================
-- 2. 数据源管理
-- ============================================================================

-- 数据源表
CREATE TABLE IF NOT EXISTS public.data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('database', 'file', 'api', 'stream')),
    connection_config JSONB,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'testing')),
    file_path TEXT,
    file_size BIGINT,
    file_extension VARCHAR(10),
    owner_id UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES public.organizations(id),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 数据集表
CREATE TABLE IF NOT EXISTS public.datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_source_id UUID REFERENCES public.data_sources(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    schema_definition JSONB,
    row_count BIGINT DEFAULT 0,
    size_bytes BIGINT DEFAULT 0,
    quality_score DECIMAL(3,2) DEFAULT 0.00,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. AI分析任务管理
-- ============================================================================

-- 分析任务表
CREATE TABLE IF NOT EXISTS public.analysis_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    data_source_id UUID REFERENCES public.data_sources(id),
    analysis_type VARCHAR(50) NOT NULL CHECK (analysis_type IN ('trend', 'prediction', 'statistical', 'anomaly', 'comparison')),
    parameters JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    error_message TEXT,
    owner_id UUID REFERENCES auth.users(id),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER,
    actual_duration INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 分析结果表
CREATE TABLE IF NOT EXISTS public.analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.analysis_tasks(id) ON DELETE CASCADE,
    result_data JSONB,
    insights JSONB,
    visualizations JSONB,
    confidence_score DECIMAL(3,2),
    ai_provider VARCHAR(50),
    model_version VARCHAR(100),
    processing_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 智能体执行日志表
CREATE TABLE IF NOT EXISTS public.agent_execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.analysis_tasks(id) ON DELETE CASCADE,
    agent_name VARCHAR(100) NOT NULL,
    agent_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('started', 'processing', 'completed', 'failed')),
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    execution_time INTEGER,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 4. 报告管理
-- ============================================================================

-- 报告模板表
CREATE TABLE IF NOT EXISTS public.report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    template_type VARCHAR(50) DEFAULT 'custom',
    content JSONB,
    parameters JSONB DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT false,
    owner_id UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES public.organizations(id),
    version INTEGER DEFAULT 1,
    tags TEXT[] DEFAULT '{}',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 报告实例表
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.report_templates(id),
    analysis_task_id UUID REFERENCES public.analysis_tasks(id),
    title VARCHAR(300) NOT NULL,
    content JSONB,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'deleted')),
    owner_id UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES public.organizations(id),
    published_at TIMESTAMP WITH TIME ZONE,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 报告版本历史表
CREATE TABLE IF NOT EXISTS public.report_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title VARCHAR(300),
    content JSONB,
    change_summary TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. AI服务配置
-- ============================================================================

-- AI配置表
CREATE TABLE IF NOT EXISTS public.ai_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('qwen', 'kimi', 'zhipu', 'deepseek', 'gemini')),
    api_key_encrypted TEXT NOT NULL,
    endpoint_url TEXT,
    model_name VARCHAR(100),
    parameters JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1,
    rate_limit INTEGER DEFAULT 100,
    cost_per_request DECIMAL(10,6) DEFAULT 0.000000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI服务调用日志表
CREATE TABLE IF NOT EXISTS public.ai_service_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL,
    model_name VARCHAR(100),
    request_data JSONB,
    response_data JSONB,
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'timeout')),
    response_time INTEGER,
    token_usage JSONB,
    cost DECIMAL(10,6),
    error_message TEXT,
    user_id UUID REFERENCES auth.users(id),
    task_id UUID REFERENCES public.analysis_tasks(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. 系统监控和日志
-- ============================================================================

-- 系统日志表
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level VARCHAR(20) NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),
    service VARCHAR(50),
    component VARCHAR(100),
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户活动日志表
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 系统配置表
CREATE TABLE IF NOT EXISTS public.system_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 7. 创建索引
-- ============================================================================

-- 用户相关索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_org ON public.user_profiles(role_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON public.user_profiles(is_active);

-- 数据源相关索引
CREATE INDEX IF NOT EXISTS idx_data_sources_owner ON public.data_sources(owner_id);
CREATE INDEX IF NOT EXISTS idx_data_sources_type_status ON public.data_sources(type, status);
CREATE INDEX IF NOT EXISTS idx_data_sources_org ON public.data_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_data_sources_created ON public.data_sources(created_at DESC);

-- 分析任务相关索引
CREATE INDEX IF NOT EXISTS idx_analysis_tasks_owner_status ON public.analysis_tasks(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_analysis_tasks_created ON public.analysis_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_tasks_type ON public.analysis_tasks(analysis_type);
CREATE INDEX IF NOT EXISTS idx_analysis_tasks_data_source ON public.analysis_tasks(data_source_id);

-- 报告相关索引
CREATE INDEX IF NOT EXISTS idx_reports_owner_status ON public.reports(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_reports_template ON public.reports(template_id);
CREATE INDEX IF NOT EXISTS idx_reports_created ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_published ON public.reports(published_at DESC) WHERE status = 'published';

-- 日志相关索引
CREATE INDEX IF NOT EXISTS idx_system_logs_level_created ON public.system_logs(level, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_service ON public.system_logs(service, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user ON public.user_activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_service_logs_provider ON public.ai_service_logs(provider, created_at DESC);

-- 全文搜索索引
CREATE INDEX IF NOT EXISTS idx_reports_title_search ON public.reports USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_templates_name_search ON public.report_templates USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_data_sources_name_search ON public.data_sources USING gin(to_tsvector('english', name));

-- ============================================================================
-- 8. 行级安全策略 (RLS)
-- ============================================================================

-- 启用行级安全
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- 用户配置文件策略
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 数据源访问策略
CREATE POLICY "Users can view own data sources" ON public.data_sources
    FOR SELECT USING (
        owner_id = auth.uid() OR 
        organization_id IN (
            SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own data sources" ON public.data_sources
    FOR ALL USING (owner_id = auth.uid());

-- 数据集访问策略
CREATE POLICY "Users can view accessible datasets" ON public.datasets
    FOR SELECT USING (
        data_source_id IN (
            SELECT id FROM public.data_sources WHERE 
            owner_id = auth.uid() OR 
            organization_id IN (
                SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
            )
        )
    );

-- 分析任务访问策略
CREATE POLICY "Users can view own analysis tasks" ON public.analysis_tasks
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can manage own analysis tasks" ON public.analysis_tasks
    FOR ALL USING (owner_id = auth.uid());

-- 分析结果访问策略
CREATE POLICY "Users can view own analysis results" ON public.analysis_results
    FOR SELECT USING (
        task_id IN (
            SELECT id FROM public.analysis_tasks WHERE owner_id = auth.uid()
        )
    );

-- 报告模板访问策略
CREATE POLICY "Users can view accessible templates" ON public.report_templates
    FOR SELECT USING (
        owner_id = auth.uid() OR 
        is_public = true OR
        is_system = true
    );

CREATE POLICY "Users can manage own templates" ON public.report_templates
    FOR ALL USING (owner_id = auth.uid());

-- 报告访问策略
CREATE POLICY "Users can view accessible reports" ON public.reports
    FOR SELECT USING (
        owner_id = auth.uid() OR 
        status = 'published' OR
        organization_id IN (
            SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own reports" ON public.reports
    FOR ALL USING (owner_id = auth.uid());

-- 用户活动日志策略
CREATE POLICY "Users can view own activity logs" ON public.user_activity_logs
    FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- 9. 触发器和函数
-- ============================================================================

-- 更新时间戳触发器函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表添加更新时间戳触发器
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_data_sources_updated_at ON public.data_sources;
CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON public.data_sources
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_analysis_tasks_updated_at ON public.analysis_tasks;
CREATE TRIGGER update_analysis_tasks_updated_at BEFORE UPDATE ON public.analysis_tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_report_templates_updated_at ON public.report_templates;
CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON public.report_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_configs_updated_at ON public.ai_configs;
CREATE TRIGGER update_ai_configs_updated_at BEFORE UPDATE ON public.ai_configs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 用户注册时自动创建profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, username, full_name, avatar_url, role_id)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url',
        (SELECT id FROM public.roles WHERE name = 'viewer' LIMIT 1)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 记录用户活动的函数
CREATE OR REPLACE FUNCTION public.log_user_activity(
    p_action VARCHAR(100),
    p_resource_type VARCHAR(50) DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_activity_logs (user_id, action, resource_type, resource_id, details)
    VALUES (auth.uid(), p_action, p_resource_type, p_resource_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- API密钥加密/解密函数
CREATE OR REPLACE FUNCTION public.encrypt_api_key(api_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(
        encrypt(
            api_key::bytea, 
            COALESCE(current_setting('app.encryption_key', true), 'default_key')::bytea, 
            'aes'
        ), 
        'base64'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrypt_api_key(encrypted_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN convert_from(
        decrypt(
            decode(encrypted_key, 'base64'), 
            COALESCE(current_setting('app.encryption_key', true), 'default_key')::bytea, 
            'aes'
        ), 
        'UTF8'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取用户权限
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    user_permissions JSONB;
BEGIN
    SELECT r.permissions INTO user_permissions
    FROM public.user_profiles up
    JOIN public.roles r ON up.role_id = r.id
    WHERE up.id = user_uuid;
    
    RETURN COALESCE(user_permissions, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 检查用户权限
CREATE OR REPLACE FUNCTION public.check_user_permission(user_uuid UUID, permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_permissions JSONB;
BEGIN
    SELECT public.get_user_permissions(user_uuid) INTO user_permissions;
    
    -- 检查是否有通配符权限
    IF user_permissions ? '*' THEN
        RETURN true;
    END IF;
    
    -- 检查具体权限
    IF user_permissions ? permission THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 分页查询分析任务
CREATE OR REPLACE FUNCTION public.get_analysis_tasks_paginated(
    user_uuid UUID,
    page_size INTEGER DEFAULT 20,
    page_offset INTEGER DEFAULT 0,
    status_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    analysis_type VARCHAR,
    status VARCHAR,
    progress INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.analysis_type,
        t.status,
        t.progress,
        t.created_at,
        COUNT(*) OVER() as total_count
    FROM public.analysis_tasks t
    WHERE t.owner_id = user_uuid
    AND (status_filter IS NULL OR t.status = status_filter)
    ORDER BY t.created_at DESC
    LIMIT page_size
    OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. 初始数据
-- ============================================================================

-- 插入默认角色
INSERT INTO public.roles (name, description, permissions) VALUES
('admin', '系统管理员', '["*"]'::jsonb),
('analyst', '数据分析师', '["data:read", "data:write", "analysis:create", "analysis:read", "report:create", "report:read", "report:write"]'::jsonb),
('viewer', '查看者', '["data:read", "analysis:read", "report:read"]'::jsonb),
('guest', '访客', '["report:read"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- 插入默认组织
INSERT INTO public.organizations (name, description) VALUES
('山西电网公司', '山西省电力公司总部'),
('太原供电公司', '太原市供电分公司'),
('大同供电公司', '大同市供电分公司'),
('临汾供电公司', '临汾市供电分公司')
ON CONFLICT DO NOTHING;

-- 插入系统配置
INSERT INTO public.system_configs (key, value, description, is_public) VALUES
('system.name', '"山西电网智能报告系统"', '系统名称', true),
('system.version', '"1.0.0"', '系统版本', true),
('analysis.max_concurrent_tasks', '10', '最大并发分析任务数', false),
('ai.default_provider', '"qwen"', '默认AI提供商', false),
('report.auto_save_interval', '30', '报告自动保存间隔（秒）', false)
ON CONFLICT (key) DO NOTHING;

-- 插入默认报告模板
INSERT INTO public.report_templates (name, description, template_type, content, is_public, is_system) VALUES
('电网负荷分析报告', '标准电网负荷分析报告模板', 'load_analysis', 
 '{
   "sections": [
     {"type": "title", "content": "电网负荷分析报告"},
     {"type": "summary", "content": "执行摘要"},
     {"type": "data_overview", "content": "数据概览"},
     {"type": "trend_analysis", "content": "趋势分析"},
     {"type": "peak_analysis", "content": "峰值分析"},
     {"type": "recommendations", "content": "建议措施"}
   ]
 }'::jsonb, 
 true, true),
('设备运行状态报告', '设备运行状态分析报告模板', 'equipment_status', 
 '{
   "sections": [
     {"type": "title", "content": "设备运行状态报告"},
     {"type": "summary", "content": "执行摘要"},
     {"type": "equipment_overview", "content": "设备概览"},
     {"type": "performance_analysis", "content": "性能分析"},
     {"type": "fault_analysis", "content": "故障分析"},
     {"type": "maintenance_plan", "content": "维护计划"}
   ]
 }'::jsonb, 
 true, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 11. 视图定义
-- ============================================================================

-- 用户详细信息视图
CREATE OR REPLACE VIEW public.user_details AS
SELECT 
    up.id,
    up.username,
    up.full_name,
    up.avatar_url,
    up.phone,
    up.department,
    up.position,
    r.name as role_name,
    r.permissions,
    o.name as organization_name,
    up.is_active,
    up.last_login_at,
    up.created_at
FROM public.user_profiles up
LEFT JOIN public.roles r ON up.role_id = r.id
LEFT JOIN public.organizations o ON up.organization_id = o.id;

-- 分析任务统计视图
CREATE OR REPLACE VIEW public.analysis_task_stats AS
SELECT 
    owner_id,
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN status = 'running' THEN 1 END) as running_tasks,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_tasks,
    AVG(actual_duration) as avg_duration
FROM public.analysis_tasks
GROUP BY owner_id;

-- AI服务使用统计视图
CREATE OR REPLACE VIEW public.ai_service_stats AS
SELECT 
    provider,
    DATE(created_at) as date,
    COUNT(*) as total_calls,
    COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_calls,
    AVG(response_time) as avg_response_time,
    SUM(cost) as total_cost
FROM public.ai_service_logs
GROUP BY provider, DATE(created_at)
ORDER BY date DESC, provider;
