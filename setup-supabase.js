// Supabase数据库初始化脚本
// Supabase Database Setup Script

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少Supabase环境变量');
  console.log('请确保.env文件中包含:');
  console.log('VITE_SUPABASE_URL=your_supabase_url');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

// 使用服务角色密钥创建客户端（具有管理员权限）
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 创建reports表的SQL
const createReportsTableSQL = `
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_reports_owner ON public.reports(owner_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_title ON public.reports USING gin(to_tsvector('english', title));

-- 启用行级安全策略（RLS）
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有用户读取和写入（简化版本）
DROP POLICY IF EXISTS "Allow all access to reports" ON public.reports;
CREATE POLICY "Allow all access to reports" ON public.reports
  FOR ALL USING (true) WITH CHECK (true);
`;

// 创建report_templates表的SQL
const createReportTemplatesTableSQL = `
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_report_templates_owner ON public.report_templates(owner_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_public ON public.report_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_report_templates_type ON public.report_templates(template_type);

-- 启用RLS
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

-- 创建策略
DROP POLICY IF EXISTS "Allow all access to report_templates" ON public.report_templates;
CREATE POLICY "Allow all access to report_templates" ON public.report_templates
  FOR ALL USING (true) WITH CHECK (true);
`;

// 插入示例模板数据
const insertSampleTemplatesSQL = `
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
`;

// 执行数据库初始化
async function setupDatabase() {
  console.log('🚀 开始初始化Supabase数据库...');
  
  try {
    // 1. 创建reports表
    console.log('📝 创建reports表...');
    const { error: reportsError } = await supabase.rpc('exec_sql', {
      sql: createReportsTableSQL
    });
    
    if (reportsError) {
      console.error('❌ 创建reports表失败:', reportsError);
      // 尝试直接执行SQL
      console.log('🔄 尝试直接执行SQL...');
      const { error: directError } = await supabase
        .from('_sql')
        .select('*')
        .limit(1);
      
      if (directError) {
        console.log('ℹ️ 无法通过RPC执行SQL，这是正常的。请手动在Supabase控制台执行以下SQL:');
        console.log('\n=== 复制以下SQL到Supabase SQL编辑器 ===');
        console.log(createReportsTableSQL);
        console.log('=== SQL结束 ===\n');
      }
    } else {
      console.log('✅ reports表创建成功');
    }
    
    // 2. 创建report_templates表
    console.log('📝 创建report_templates表...');
    const { error: templatesError } = await supabase.rpc('exec_sql', {
      sql: createReportTemplatesTableSQL
    });
    
    if (templatesError) {
      console.log('ℹ️ 请手动在Supabase控制台执行以下SQL:');
      console.log('\n=== 复制以下SQL到Supabase SQL编辑器 ===');
      console.log(createReportTemplatesTableSQL);
      console.log('=== SQL结束 ===\n');
    } else {
      console.log('✅ report_templates表创建成功');
    }
    
    // 3. 插入示例数据
    console.log('📝 插入示例模板数据...');
    const { error: sampleError } = await supabase.rpc('exec_sql', {
      sql: insertSampleTemplatesSQL
    });
    
    if (sampleError) {
      console.log('ℹ️ 请手动在Supabase控制台执行以下SQL:');
      console.log('\n=== 复制以下SQL到Supabase SQL编辑器 ===');
      console.log(insertSampleTemplatesSQL);
      console.log('=== SQL结束 ===\n');
    } else {
      console.log('✅ 示例数据插入成功');
    }
    
    // 4. 测试连接
    console.log('🔍 测试数据库连接...');
    const { data: testData, error: testError } = await supabase
      .from('reports')
      .select('count', { count: 'exact', head: true });
    
    if (testError) {
      console.error('❌ 数据库连接测试失败:', testError.message);
      console.log('\n📋 手动设置步骤:');
      console.log('1. 登录Supabase控制台: https://supabase.com/dashboard');
      console.log('2. 选择您的项目');
      console.log('3. 进入SQL编辑器');
      console.log('4. 复制上面的SQL语句并执行');
      console.log('5. 确保RLS策略已正确设置');
    } else {
      console.log('✅ 数据库连接测试成功');
    }
    
    console.log('\n🎉 数据库初始化完成！');
    console.log('\n📊 接下来可以测试以下功能:');
    console.log('- 在功能测试页面测试数据库连接');
    console.log('- 在报告编辑器中保存报告');
    console.log('- 在模板中心查看模板');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    console.log('\n🔧 故障排除:');
    console.log('1. 检查.env文件中的Supabase配置');
    console.log('2. 确保SUPABASE_SERVICE_ROLE_KEY有足够权限');
    console.log('3. 检查网络连接');
  }
}

// 运行初始化
setupDatabase().then(() => {
  console.log('\n✨ 脚本执行完成');
}).catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});