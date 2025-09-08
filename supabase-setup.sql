-- Supabase数据库初始化SQL脚本
-- 请将此脚本复制到Supabase控制台的SQL编辑器中执行

-- 1. 创建reports表
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  content JSONB,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'deleted')),
  owner_id UUID,
  organization_id UUID,
  template_id UUID,
  analysis_task_id UUID,
  published_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建reports表索引
CREATE INDEX IF NOT EXISTS idx_reports_owner ON public.reports(owner_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_title ON public.reports USING gin(to_tsvector('english', title));

-- 启用reports表行级安全策略（RLS）
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 创建reports表策略：允许所有用户读取和写入（简化版本）
DROP POLICY IF EXISTS "Allow all access to reports" ON public.reports;
CREATE POLICY "Allow all access to reports" ON public.reports
  FOR ALL USING (true) WITH CHECK (true);

-- 2. 创建report_templates表
CREATE TABLE IF NOT EXISTS public.report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  template_type VARCHAR(50) DEFAULT 'custom',
  content JSONB,
  parameters JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  owner_id UUID,
  organization_id UUID,
  version INTEGER DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建report_templates表索引
CREATE INDEX IF NOT EXISTS idx_report_templates_owner ON public.report_templates(owner_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_public ON public.report_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_report_templates_type ON public.report_templates(template_type);

-- 启用report_templates表RLS
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

-- 创建report_templates表策略
DROP POLICY IF EXISTS "Allow all access to report_templates" ON public.report_templates;
CREATE POLICY "Allow all access to report_templates" ON public.report_templates
  FOR ALL USING (true) WITH CHECK (true);

-- 3. 插入示例模板数据
INSERT INTO public.report_templates (name, description, template_type, content, is_public, is_system, tags)
VALUES 
  (
    '电网负荷分析报告模板',
    '用于分析电网负荷变化趋势和预测的标准模板',
    'analysis',
    '{
      "title": "电网负荷分析报告",
      "sections": [
        {
          "title": "执行摘要",
          "content": "本报告分析了电网负荷的变化趋势..."
        },
        {
          "title": "数据分析",
          "content": "基于历史数据，我们观察到以下趋势..."
        },
        {
          "title": "预测结果",
          "content": "根据模型预测，未来负荷变化..."
        },
        {
          "title": "建议措施",
          "content": "基于分析结果，建议采取以下措施..."
        }
      ]
    }',
    true,
    true,
    ARRAY['电网', '负荷', '分析']
  ),
  (
    '清洁能源发展报告模板',
    '用于分析清洁能源发展现状和前景的模板',
    'analysis',
    '{
      "title": "清洁能源发展报告",
      "sections": [
        {
          "title": "概述",
          "content": "清洁能源发展概况..."
        },
        {
          "title": "现状分析",
          "content": "当前清洁能源装机容量和发电量..."
        },
        {
          "title": "发展趋势",
          "content": "清洁能源技术发展趋势..."
        },
        {
          "title": "政策建议",
          "content": "促进清洁能源发展的政策建议..."
        }
      ]
    }',
    true,
    true,
    ARRAY['清洁能源', '可再生能源', '发展']
  ),
  (
    '月度运营报告模板',
    '标准的月度运营情况汇报模板',
    'report',
    '{
      "title": "月度运营报告",
      "sections": [
        {
          "title": "运营概况",
          "content": "本月运营总体情况..."
        },
        {
          "title": "关键指标",
          "content": "主要运营指标完成情况..."
        },
        {
          "title": "问题与挑战",
          "content": "运营中遇到的问题和挑战..."
        },
        {
          "title": "下月计划",
          "content": "下个月的工作计划和目标..."
        }
      ]
    }',
    true,
    true,
    ARRAY['运营', '月报', '管理']
  )
ON CONFLICT DO NOTHING;

-- 执行完成提示
SELECT 'Supabase数据库初始化完成！' as message;