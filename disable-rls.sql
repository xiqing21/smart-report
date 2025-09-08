-- 禁用reports表的行级安全策略（RLS）
-- 这将允许所有操作无需认证

-- 1. 删除现有的RLS策略
DROP POLICY IF EXISTS "Allow all access to reports" ON public.reports;

-- 2. 禁用reports表的RLS
ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;

-- 3. 同样处理report_templates表
DROP POLICY IF EXISTS "Allow all access to report_templates" ON public.report_templates;
ALTER TABLE public.report_templates DISABLE ROW LEVEL SECURITY;

-- 验证RLS状态
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('reports', 'report_templates');

SELECT 'RLS已禁用，现在可以正常进行CRUD操作' as message;