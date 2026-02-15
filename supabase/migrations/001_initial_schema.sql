-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (用户档案表)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
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
-- 2. DIAGNOSIS_SESSIONS TABLE (诊断会话表 - 核心)
-- ============================================
CREATE TYPE session_status AS ENUM ('active', 'completed', 'archived');

CREATE TABLE IF NOT EXISTS public.diagnosis_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status session_status DEFAULT 'active',
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
-- 3. CHAT_LOGS TABLE (对话记录表)
-- ============================================
CREATE TYPE chat_role AS ENUM ('user', 'assistant', 'system');

CREATE TABLE IF NOT EXISTS public.chat_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.diagnosis_sessions(id) ON DELETE CASCADE NOT NULL,
  role chat_role NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- token消耗、AI思考过程等
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. LEADS TABLE (销售线索表 - 顾问后台用)
-- ============================================
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'converted');

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  status lead_status DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES (索引优化)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_users_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_sessions_user_id ON public.diagnosis_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_sessions_status ON public.diagnosis_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_logs_session_id ON public.chat_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON public.chat_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON public.leads(lead_score DESC);

-- JSONB GIN 索引用于高效查询五维数据
CREATE INDEX IF NOT EXISTS idx_diagnosis_sessions_data_strategy ON public.diagnosis_sessions USING GIN (data_strategy);
CREATE INDEX IF NOT EXISTS idx_diagnosis_sessions_data_structure ON public.diagnosis_sessions USING GIN (data_structure);
CREATE INDEX IF NOT EXISTS idx_diagnosis_sessions_data_performance ON public.diagnosis_sessions USING GIN (data_performance);
CREATE INDEX IF NOT EXISTS idx_diagnosis_sessions_data_compensation ON public.diagnosis_sessions USING GIN (data_compensation);
CREATE INDEX IF NOT EXISTS idx_diagnosis_sessions_data_talent ON public.diagnosis_sessions USING GIN (data_talent);

-- ============================================
-- ROW LEVEL SECURITY (RLS) 策略
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
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
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
CREATE OR REPLACE FUNCTION public.handle_new_user()
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
-- HELPER FUNCTIONS
-- ============================================

-- Function: Calculate total score from all dimensions
CREATE OR REPLACE FUNCTION public.calculate_total_score(session_id UUID)
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
-- SAMPLE DATA (可选，用于测试)
-- ============================================
-- INSERT INTO public.profiles (id, full_name, company_name, job_title, industry, employee_count)
-- VALUES (uuid_generate_v4(), '测试用户', '示例公司', 'CEO', '科技', '51-200');
