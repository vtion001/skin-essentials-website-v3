-- ============================================
-- DIAGNOSTIC: Find Encrypted Data in Database
-- Run this to identify tables with encrypted columns
-- ============================================

-- 1. First, list all tables and their columns to understand the schema
SELECT 
    t.table_name,
    STRING_AGG(c.column_name, ', ' ORDER BY c.ordinal_position) as columns
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name
ORDER BY t.table_name;

-- ============================================
-- 2. Check for encrypted data patterns
-- These queries use dynamic checks to avoid column errors
-- ============================================

-- Check Medical Records (if table exists and has notes column)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medical_records' AND column_name = 'notes'
    ) THEN
        RAISE NOTICE 'Checking medical_records.notes for encrypted data...';
    END IF;
END $$;

SELECT 
    'medical_records' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN notes::text LIKE '%"iv":%' THEN 1 END) as potentially_encrypted
FROM medical_records
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'medical_records' AND column_name = 'notes'
);

-- ============================================
-- 3. Generic search for encrypted-looking data patterns
-- ============================================

-- Find any JSONB columns that might contain encrypted data
SELECT 
    c.table_name,
    c.column_name,
    c.data_type
FROM information_schema.columns c
JOIN information_schema.tables t ON c.table_name = t.table_name AND c.table_schema = t.table_schema
WHERE c.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND c.data_type IN ('jsonb', 'json', 'text')
ORDER BY c.table_name, c.column_name;

-- ============================================
-- 4. Show columns that commonly hold sensitive data
-- ============================================

SELECT 
    c.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable
FROM information_schema.columns c
JOIN information_schema.tables t ON c.table_name = t.table_name AND c.table_schema = t.table_schema
WHERE c.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND (
        c.column_name ILIKE '%note%' 
        OR c.column_name ILIKE '%contact%' 
        OR c.column_name ILIKE '%address%'
        OR c.column_name ILIKE '%phone%'
        OR c.column_name ILIKE '%email%'
        OR c.column_name ILIKE '%medical%'
        OR c.column_name ILIKE '%diagnosis%'
        OR c.column_name ILIKE '%treatment%'
        OR c.column_name ILIKE '%details%'
        OR c.column_name ILIKE '%meta%'
    )
ORDER BY c.table_name, c.column_name;
