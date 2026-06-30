-- =================================================================================
-- SUPABASE CRON JOB: STAFF ATTENDANCE FINALIZATION
-- Schedule: 7:00 PM IST (13:30 UTC)
-- =================================================================================

-- 1. Enable required extensions for HTTP requests and scheduling
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Safely remove any existing job to prevent duplicate polling
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'finalize-attendance-cron';

-- 3. Schedule the 7:00 PM IST (13:30 UTC) EOD Attendance Finalization job
SELECT cron.schedule(
  'finalize-attendance-cron',
  '30 13 * * *',  -- 13:30 UTC = 7:00 PM IST
  $$
    SELECT net.http_get(
      url:='https://tektoncampus.com/api/cron/finalize-attendance',
      -- WARNING: Do not push your actual CRON_SECRET to GitHub. 
      -- Replace YOUR_CRON_SECRET with the value from your .env file
      headers:='{"Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb,
      timeout_milliseconds:=30000 -- 30s timeout
    );
  $$
);

-- ==========================================
-- TROUBLESHOOTING & DEBUGGING COMMANDS:
-- ==========================================
-- Verify the job is scheduled:
-- SELECT * FROM cron.job WHERE jobname = 'finalize-attendance-cron';
-- 
-- Check recent execution logs (success/failures):
-- SELECT * FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'finalize-attendance-cron') ORDER BY start_time DESC LIMIT 10;
