-- ============================================
-- FIX: Audit Logs Table - Add Missing Timestamp Column
-- Run this in Supabase SQL Editor
-- ============================================

-- Check if audit_logs table exists
DO $$
BEGIN
    -- If the table exists, check for the timestamp column
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        -- Add timestamp column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'audit_logs' AND column_name = 'timestamp'
        ) THEN
            ALTER TABLE audit_logs ADD COLUMN timestamp TIMESTAMPTZ DEFAULT NOW();
            RAISE NOTICE 'Added timestamp column to audit_logs table';
        ELSE
            RAISE NOTICE 'timestamp column already exists in audit_logs';
        END IF;
    ELSE
        -- Create the table from scratch if it doesn't exist
        CREATE TABLE audit_logs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id TEXT,
            action TEXT,
            resource TEXT,
            resource_id TEXT,
            details JSONB,
            status TEXT,
            ip_address TEXT,
            timestamp TIMESTAMPTZ DEFAULT NOW()
        );
        RAISE NOTICE 'Created audit_logs table with timestamp column';
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
DROP POLICY IF EXISTS "Allow service role full access" ON audit_logs;
CREATE POLICY "Allow service role full access" ON audit_logs 
    USING (true) 
    WITH CHECK (true);

-- Refresh schema cache to pick up new column
NOTIFY pgrst, 'reload schema';

-- ============================================
-- DONE! The audit_logs table now has the timestamp column.
-- ============================================
