-- ============================================
-- DeepConsult 数据库重置和初始化脚本
-- 用途：清理已存在的对象并重新创建
-- ============================================

-- 1. 删除触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_diagnosis_sessions_updated_at ON public.diagnosis_sessions;
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;

-- 2. 删除函数
DROP FUNCTION IF EXISTS public.calculate_total_score(UUID);
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- 3. 删除 RLS 策略
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own sessions" ON public.diagnosis_sessions;
DROP POLICY IF EXISTS "Users can create their own sessions" ON public.diagnosis_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.diagnosis_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.diagnosis_sessions;

DROP POLICY IF EXISTS "Users can view chat logs from their own sessions" ON public.chat_logs;
DROP POLICY IF EXISTS "Users can insert chat logs to their own sessions" ON public.chat_logs;

DROP POLICY IF EXISTS "Service role can manage all leads" ON public.leads;

-- 4. 删除表（按照依赖关系倒序）
DROP TABLE IF EXISTS public.chat_logs CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.diagnosis_sessions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 5. 删除 ENUM 类型
DROP TYPE IF EXISTS public.chat_role CASCADE;
DROP TYPE IF EXISTS public.lead_status CASCADE;
DROP TYPE IF EXISTS public.session_status CASCADE;

-- ============================================
-- 现在开始创建新的结构
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. 创建 ENUM 类型
-- ============================================
CREATE TYPE public.session_status AS ENUM ('active', 'completed', 'archived');
CREATE TYPE public.chat_role AS ENUM ('user', 'assistant', 'system');
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'converted');

-- ============================================
-- 2. PROFILES TABLE (用户档案表)
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  company_name TEXT,
  job_title TEXT,
  industry TEXT,
  employee_count TEXT, -- e.g., '1-50', '51-200', '201-500', '500+'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. DIAGNOSIS_SESSIONS TABLE (诊断会话表 - 核心)
-- ============================================
CREATE TABLE public.diagnosis_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status public.session_status DEFAULT 'active',
  current_stage TEXT DEFAULT 'strategy', -- 'strategy' | 'structure' | 'performance' | 'compensation' | 'talent'

  -- 五维数据字段 (JSONB 格式，灵活存储结构化数据)
  data_strategy JSONB DEFAULT '{}',
  data_structure JSONB DEFAULT '{}',
  data_performance JSONB DEFAULT '{}',
  data_compensation JSONB DEFAULT '{}',
  data_talent JSONB DEFAULT '{}',

  total_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. CHAT_LOGS TABLE (对话记录表)
-- ============================================
CREATE TABLE public.chat_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.diagnosis_sessions(id) ON DELETE CASCADE NOT NULL,
  role public.chat_role NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- token消耗、AI思考过程等
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. LEADS TABLE (销售线索表 - 顾问后台用)
-- ============================================
CREATE TABLE public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  status public.lead_status DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. INDEXES (索引优化)
-- ============================================
CREATE INDEX idx_profiles_users_id ON public.profiles(id);
CREATE INDEX idx_diagnosis_sessions_user_id ON public.diagnosis_sessions(user_id);
CREATE INDEX idx_diagnosis_sessions_status ON public.diagnosis_sessions(status);
CREATE INDEX idx_chat_logs_session_id ON public.chat_logs(session_id);
CREATE INDEX idx_chat_logs_created_at ON public.chat_logs(created_at DESC);
CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_lead_score ON public.leads(lead_score DESC);

-- JSONB GIN 索引用于高效查询五维数据
CREATE INDEX idx_diagnosis_sessions_data_strategy ON public.diagnosis_sessions USING GIN (data_strategy);
CREATE INDEX idx_diagnosis_sessions_data_structure ON public.diagnosis_sessions USING GIN (data_structure);
CREATE INDEX idx_diagnosis_sessions_data_performance ON public.diagnosis_sessions USING GIN (data_performance);
CREATE INDEX idx_diagnosis_sessions_data_compensation ON public.diagnosis_sessions USING GIN (data_compensation);
CREATE INDEX idx_diagnosis_sessions_data_talent ON public.diagnosis_sessions USING GIN (data_talent);

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS) 策略
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- PROFILES RLS
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- DIAGNOSIS_SESSIONS RLS
CREATE POLICY "Users can view their own sessions"
  ON public.diagnosis_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON public.diagnosis_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.diagnosis_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON public.diagnosis_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- CHAT_LOGS RLS
CREATE POLICY "Users can view chat logs from their own sessions"
  ON public.chat_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.diagnosis_sessions
      WHERE diagnosis_sessions.id = chat_logs.session_id
      AND diagnosis_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert chat logs to their own sessions"
  ON public.chat_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.diagnosis_sessions
      WHERE diagnosis_sessions.id = chat_logs.session_id
      AND diagnosis_sessions.user_id = auth.uid()
    )
  );

-- LEADS RLS (仅 Service Role 可访问，用于后台管理员)
CREATE POLICY "Service role can manage all leads"
  ON public.leads FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 8. FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Update updated_at timestamp
CREATE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diagnosis_sessions_updated_at BEFORE UPDATE ON public.diagnosis_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function: Auto-create profile when user signs up
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 9. HELPER FUNCTIONS
-- ============================================

-- Function: Calculate total score from all dimensions
CREATE FUNCTION public.calculate_total_score(session_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total INTEGER := 0;
BEGIN
  SELECT COALESCE(
    (COALESCE((data_strategy->>'score')::INTEGER, 0) +
     COALESCE((data_structure->>'score')::INTEGER, 0) +
     COALESCE((data_performance->>'score')::INTEGER, 0) +
     COALESCE((data_compensation->>'score')::INTEGER, 0) +
     COALESCE((data_talent->>'score')::INTEGER, 0)), 0
  ) INTO total
  FROM public.diagnosis_sessions
  WHERE id = session_id;

  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 完成！
-- ============================================
-- 你应该看到消息：Success. No rows returned
-- 在 Table Editor 中应该能看到 4 个表：
--   - profiles
--   - diagnosis_sessions
--   - chat_logs
--   - leads
