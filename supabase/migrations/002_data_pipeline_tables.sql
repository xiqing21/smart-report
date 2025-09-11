-- 数据处理管道相关表结构
-- Data Pipeline Tables for Smart Report System

-- ============================================================================
-- 基础数据表（如果不存在则创建）
-- ============================================================================

-- 数据源表
CREATE TABLE IF NOT EXISTS public.data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('database', 'file', 'api', 'stream', 'manual')),
    connection_config JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'pending')),
    owner_id UUID REFERENCES auth.users(id),
    organization_id UUID,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_frequency VARCHAR(20) DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 数据集表
CREATE TABLE IF NOT EXISTS public.datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    data_source_id UUID REFERENCES public.data_sources(id),
    schema_info JSONB DEFAULT '{}'::jsonb,
    row_count INTEGER DEFAULT 0,
    column_count INTEGER DEFAULT 0,
    file_size BIGINT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'processing', 'error', 'archived')),
    owner_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 数据处理管道表
-- ============================================================================

-- 数据处理任务表
CREATE TABLE IF NOT EXISTS public.processing_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    data_source_id UUID REFERENCES public.data_sources(id),
    pipeline_config JSONB DEFAULT '{}'::jsonb,
    task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('etl', 'cleaning', 'transformation', 'validation', 'analysis')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'paused', 'completed', 'failed', 'cancelled')),
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    error_message TEXT,
    owner_id UUID REFERENCES auth.users(id),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER, -- 预估执行时间（秒）
    actual_duration INTEGER,    -- 实际执行时间（秒）
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 任务节点表（用于可视化任务流）
CREATE TABLE IF NOT EXISTS public.task_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processing_task_id UUID REFERENCES public.processing_tasks(id) ON DELETE CASCADE,
    node_name VARCHAR(100) NOT NULL,
    node_type VARCHAR(50) NOT NULL CHECK (node_type IN ('input', 'process', 'output', 'decision', 'merge')),
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    config JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
    execution_order INTEGER DEFAULT 0,
    dependencies UUID[] DEFAULT '{}', -- 依赖的节点ID数组
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 任务执行日志表
CREATE TABLE IF NOT EXISTS public.task_execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processing_task_id UUID REFERENCES public.processing_tasks(id) ON DELETE CASCADE,
    task_node_id UUID REFERENCES public.task_nodes(id),
    log_level VARCHAR(10) NOT NULL CHECK (log_level IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL')),
    message TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 数据质量管理表
-- ============================================================================

-- 数据质量检查表
CREATE TABLE IF NOT EXISTS public.data_quality_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_source_id UUID REFERENCES public.data_sources(id),
    dataset_id UUID REFERENCES public.datasets(id),
    check_name VARCHAR(200) NOT NULL,
    check_type VARCHAR(50) NOT NULL CHECK (check_type IN ('completeness', 'accuracy', 'consistency', 'validity', 'uniqueness', 'timeliness')),
    check_config JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    result JSONB,
    score DECIMAL(5,2), -- 质量评分 0-100
    issues_found INTEGER DEFAULT 0,
    total_records INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 数据质量问题表
CREATE TABLE IF NOT EXISTS public.data_quality_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quality_check_id UUID REFERENCES public.data_quality_checks(id) ON DELETE CASCADE,
    issue_type VARCHAR(50) NOT NULL,
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    column_name VARCHAR(200),
    row_identifier TEXT,
    description TEXT NOT NULL,
    suggested_fix TEXT,
    fix_confidence DECIMAL(3,2), -- 修复建议的置信度 0-1
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 数据修复记录表
CREATE TABLE IF NOT EXISTS public.data_repair_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quality_issue_id UUID REFERENCES public.data_quality_issues(id),
    repair_method VARCHAR(100) NOT NULL,
    original_value TEXT,
    repaired_value TEXT,
    repair_config JSONB,
    success BOOLEAN DEFAULT false,
    error_message TEXT,
    applied_by UUID REFERENCES auth.users(id),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- EDA分析结果表
-- ============================================================================

-- EDA分析会话表
CREATE TABLE IF NOT EXISTS public.eda_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_source_id UUID REFERENCES public.data_sources(id),
    dataset_id UUID REFERENCES public.datasets(id),
    session_name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    owner_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EDA洞察表
CREATE TABLE IF NOT EXISTS public.eda_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.eda_sessions(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('correlation', 'distribution', 'trend', 'anomaly', 'pattern', 'summary')),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    confidence_score DECIMAL(3,2), -- 置信度 0-1
    statistical_data JSONB,
    visualization_config JSONB,
    columns_involved TEXT[] DEFAULT '{}',
    is_significant BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 实时通信表
-- ============================================================================

-- WebSocket连接会话表
CREATE TABLE IF NOT EXISTS public.websocket_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    connection_id VARCHAR(255),
    subscribed_topics TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- 实时消息队列表
CREATE TABLE IF NOT EXISTS public.realtime_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic VARCHAR(200) NOT NULL,
    message_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    target_user_id UUID REFERENCES auth.users(id),
    target_session_id UUID REFERENCES public.websocket_sessions(id),
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 索引创建
-- ============================================================================

-- 处理任务索引
CREATE INDEX IF NOT EXISTS idx_processing_tasks_status ON public.processing_tasks(status);
CREATE INDEX IF NOT EXISTS idx_processing_tasks_owner ON public.processing_tasks(owner_id);
CREATE INDEX IF NOT EXISTS idx_processing_tasks_data_source ON public.processing_tasks(data_source_id);
CREATE INDEX IF NOT EXISTS idx_processing_tasks_created_at ON public.processing_tasks(created_at DESC);

-- 任务节点索引
CREATE INDEX IF NOT EXISTS idx_task_nodes_processing_task ON public.task_nodes(processing_task_id);
CREATE INDEX IF NOT EXISTS idx_task_nodes_status ON public.task_nodes(status);

-- 数据质量检查索引
CREATE INDEX IF NOT EXISTS idx_quality_checks_data_source ON public.data_quality_checks(data_source_id);
CREATE INDEX IF NOT EXISTS idx_quality_checks_status ON public.data_quality_checks(status);
CREATE INDEX IF NOT EXISTS idx_quality_checks_created_at ON public.data_quality_checks(created_at DESC);

-- 数据质量问题索引
CREATE INDEX IF NOT EXISTS idx_quality_issues_check_id ON public.data_quality_issues(quality_check_id);
CREATE INDEX IF NOT EXISTS idx_quality_issues_severity ON public.data_quality_issues(severity);
CREATE INDEX IF NOT EXISTS idx_quality_issues_resolved ON public.data_quality_issues(is_resolved);

-- EDA会话索引
CREATE INDEX IF NOT EXISTS idx_eda_sessions_owner ON public.eda_sessions(owner_id);
CREATE INDEX IF NOT EXISTS idx_eda_sessions_data_source ON public.eda_sessions(data_source_id);
CREATE INDEX IF NOT EXISTS idx_eda_sessions_status ON public.eda_sessions(status);

-- EDA洞察索引
CREATE INDEX IF NOT EXISTS idx_eda_insights_session ON public.eda_insights(session_id);
CREATE INDEX IF NOT EXISTS idx_eda_insights_type ON public.eda_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_eda_insights_significant ON public.eda_insights(is_significant);

-- WebSocket会话索引
CREATE INDEX IF NOT EXISTS idx_websocket_sessions_user ON public.websocket_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_websocket_sessions_token ON public.websocket_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_websocket_sessions_status ON public.websocket_sessions(status);

-- 实时消息索引
CREATE INDEX IF NOT EXISTS idx_realtime_messages_topic ON public.realtime_messages(topic);
CREATE INDEX IF NOT EXISTS idx_realtime_messages_status ON public.realtime_messages(status);
CREATE INDEX IF NOT EXISTS idx_realtime_messages_target_user ON public.realtime_messages(target_user_id);
CREATE INDEX IF NOT EXISTS idx_realtime_messages_created_at ON public.realtime_messages(created_at DESC);

-- ============================================================================
-- 触发器和函数
-- ============================================================================

-- 更新时间戳触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表添加更新时间戳触发器
CREATE TRIGGER update_processing_tasks_updated_at BEFORE UPDATE ON public.processing_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_nodes_updated_at BEFORE UPDATE ON public.task_nodes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_quality_checks_updated_at BEFORE UPDATE ON public.data_quality_checks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_eda_sessions_updated_at BEFORE UPDATE ON public.eda_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 任务状态变更通知函数
CREATE OR REPLACE FUNCTION notify_task_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- 当任务状态发生变化时，发送实时通知
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.realtime_messages (topic, message_type, payload, target_user_id)
        VALUES (
            'task_status_update',
            'status_change',
            json_build_object(
                'task_id', NEW.id,
                'task_name', NEW.name,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'progress', NEW.progress
            )::jsonb,
            NEW.owner_id
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为处理任务表添加状态变更通知触发器
CREATE TRIGGER notify_processing_task_status_change 
    AFTER UPDATE ON public.processing_tasks 
    FOR EACH ROW EXECUTE FUNCTION notify_task_status_change();

-- ============================================================================
-- 行级安全策略 (RLS)
-- ============================================================================

-- 启用RLS
ALTER TABLE public.processing_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_quality_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_repair_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eda_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eda_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.websocket_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_messages ENABLE ROW LEVEL SECURITY;

-- 处理任务访问策略
CREATE POLICY "Users can view their own processing tasks" ON public.processing_tasks
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create processing tasks" ON public.processing_tasks
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own processing tasks" ON public.processing_tasks
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own processing tasks" ON public.processing_tasks
    FOR DELETE USING (auth.uid() = owner_id);

-- 任务节点访问策略
CREATE POLICY "Users can view task nodes of their tasks" ON public.task_nodes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.processing_tasks pt 
            WHERE pt.id = task_nodes.processing_task_id 
            AND pt.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage task nodes of their tasks" ON public.task_nodes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.processing_tasks pt 
            WHERE pt.id = task_nodes.processing_task_id 
            AND pt.owner_id = auth.uid()
        )
    );

-- 数据质量检查访问策略
CREATE POLICY "Users can view their own quality checks" ON public.data_quality_checks
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create quality checks" ON public.data_quality_checks
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own quality checks" ON public.data_quality_checks
    FOR UPDATE USING (auth.uid() = created_by);

-- EDA会话访问策略
CREATE POLICY "Users can view their own EDA sessions" ON public.eda_sessions
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create EDA sessions" ON public.eda_sessions
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own EDA sessions" ON public.eda_sessions
    FOR UPDATE USING (auth.uid() = owner_id);

-- WebSocket会话访问策略
CREATE POLICY "Users can view their own websocket sessions" ON public.websocket_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own websocket sessions" ON public.websocket_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 实时消息访问策略
CREATE POLICY "Users can view messages targeted to them" ON public.realtime_messages
    FOR SELECT USING (auth.uid() = target_user_id);

-- ============================================================================
-- 权限授予
-- ============================================================================

-- 授予anon角色基本读取权限
GRANT SELECT ON public.processing_tasks TO anon;
GRANT SELECT ON public.task_nodes TO anon;
GRANT SELECT ON public.data_quality_checks TO anon;
GRANT SELECT ON public.eda_sessions TO anon;

-- 授予authenticated角色完整权限
GRANT ALL PRIVILEGES ON public.processing_tasks TO authenticated;
GRANT ALL PRIVILEGES ON public.task_nodes TO authenticated;
GRANT ALL PRIVILEGES ON public.task_execution_logs TO authenticated;
GRANT ALL PRIVILEGES ON public.data_quality_checks TO authenticated;
GRANT ALL PRIVILEGES ON public.data_quality_issues TO authenticated;
GRANT ALL PRIVILEGES ON public.data_repair_records TO authenticated;
GRANT ALL PRIVILEGES ON public.eda_sessions TO authenticated;
GRANT ALL PRIVILEGES ON public.eda_insights TO authenticated;
GRANT ALL PRIVILEGES ON public.websocket_sessions TO authenticated;
GRANT ALL PRIVILEGES ON public.realtime_messages TO authenticated;

-- 授予序列权限
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

COMMIT;