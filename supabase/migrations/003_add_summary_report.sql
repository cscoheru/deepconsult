-- ============================================
-- Migration: Add summary_report field to diagnosis_sessions
-- Version: 003
-- Date: 2026-02-15
-- ============================================

-- Add summary_report column to diagnosis_sessions
ALTER TABLE public.diagnosis_sessions
ADD COLUMN IF NOT EXISTS summary_report TEXT;

-- Create index for full-text search on summary reports (useful for future search features)
CREATE INDEX IF NOT EXISTS idx_diagnosis_sessions_summary_report
ON public.diagnosis_sessions USING GIN (to_tsvector('english', summary_report))
WHERE summary_report IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.diagnosis_sessions.summary_report
IS 'AI-generated final summary report for the diagnostic session. Includes overall insights, key findings, and recommendations.';

-- ============================================
-- Verification Query (run this to verify)
-- ============================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'diagnosis_sessions'
-- AND column_name = 'summary_report';
