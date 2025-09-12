-- 创建对话上下文表
CREATE TABLE IF NOT EXISTS conversation_contexts (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT NOT NULL DEFAULT '新对话',
  messages JSONB DEFAULT '[]'::jsonb,
  summary TEXT,
  keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  token_count INTEGER DEFAULT 0,
  max_tokens INTEGER DEFAULT 8000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_conversation_contexts_user_id ON conversation_contexts(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_contexts_updated_at ON conversation_contexts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_contexts_created_at ON conversation_contexts(created_at DESC);

-- 创建GIN索引用于JSONB消息搜索
CREATE INDEX IF NOT EXISTS idx_conversation_contexts_messages_gin ON conversation_contexts USING GIN(messages);

-- 创建GIN索引用于关键词数组搜索
CREATE INDEX IF NOT EXISTS idx_conversation_contexts_keywords_gin ON conversation_contexts USING GIN(keywords);

-- 启用RLS
ALTER TABLE conversation_contexts ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略：用户只能访问自己的对话上下文
CREATE POLICY "Users can view own conversation contexts" ON conversation_contexts
  FOR SELECT USING (auth.uid()::text = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own conversation contexts" ON conversation_contexts
  FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own conversation contexts" ON conversation_contexts
  FOR UPDATE USING (auth.uid()::text = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own conversation contexts" ON conversation_contexts
  FOR DELETE USING (auth.uid()::text = user_id OR user_id IS NULL);

-- 授权给anon和authenticated角色
GRANT SELECT, INSERT, UPDATE, DELETE ON conversation_contexts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON conversation_contexts TO authenticated;

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_conversation_contexts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER trigger_update_conversation_contexts_updated_at
  BEFORE UPDATE ON conversation_contexts
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_contexts_updated_at();

-- 添加注释
COMMENT ON TABLE conversation_contexts IS '对话上下文表，存储多轮对话的历史和上下文信息';
COMMENT ON COLUMN conversation_contexts.id IS '对话上下文唯一标识符';
COMMENT ON COLUMN conversation_contexts.user_id IS '用户ID，关联到auth.users';
COMMENT ON COLUMN conversation_contexts.title IS '对话标题';
COMMENT ON COLUMN conversation_contexts.messages IS '对话消息列表，JSON格式存储';
COMMENT ON COLUMN conversation_contexts.summary IS '对话总结';
COMMENT ON COLUMN conversation_contexts.keywords IS '对话关键词数组';
COMMENT ON COLUMN conversation_contexts.token_count IS '当前上下文的token数量';
COMMENT ON COLUMN conversation_contexts.max_tokens IS '最大允许的token数量';
COMMENT ON COLUMN conversation_contexts.created_at IS '创建时间';
COMMENT ON COLUMN conversation_contexts.updated_at IS '最后更新时间';