-- Social Media Tables for Supabase
-- CLEAN INSTALL - Drops existing tables first
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 0: Drop existing tables (clean slate)
-- ============================================
DROP TABLE IF EXISTS social_messages CASCADE;
DROP TABLE IF EXISTS social_conversations CASCADE;
DROP TABLE IF EXISTS social_platform_connections CASCADE;

-- Drop existing function if exists
DROP FUNCTION IF EXISTS update_social_updated_at() CASCADE;

-- ============================================
-- STEP 1: Create Platform Connections Table
-- ============================================
CREATE TABLE social_platform_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(50) NOT NULL,
    page_id VARCHAR(100) NOT NULL,
    page_name VARCHAR(255),
    access_token TEXT,
    is_connected BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    webhook_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (platform, page_id)
);

-- ============================================
-- STEP 2: Create Conversations Table
-- ============================================
CREATE TABLE social_conversations (
    id VARCHAR(100) PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,
    page_id VARCHAR(100) NOT NULL,
    participant_id VARCHAR(100),
    participant_name VARCHAR(255),
    participant_profile_picture TEXT,
    last_message TEXT,
    last_message_timestamp TIMESTAMPTZ,
    unread_count INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 3: Create Messages Table
-- ============================================
CREATE TABLE social_messages (
    id VARCHAR(100) PRIMARY KEY,
    conversation_id VARCHAR(100) NOT NULL REFERENCES social_conversations(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    page_id VARCHAR(100) NOT NULL,
    sender_id VARCHAR(100),
    sender_name VARCHAR(255),
    message TEXT,
    message_type VARCHAR(50) DEFAULT 'text',
    attachments JSONB,
    is_from_page BOOLEAN DEFAULT false,
    is_read BOOLEAN DEFAULT false,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 4: Create Indexes
-- ============================================
CREATE INDEX idx_social_conv_platform ON social_conversations(platform);
CREATE INDEX idx_social_conv_page ON social_conversations(page_id);
CREATE INDEX idx_social_conv_timestamp ON social_conversations(last_message_timestamp DESC);
CREATE INDEX idx_social_msg_conv ON social_messages(conversation_id);
CREATE INDEX idx_social_msg_timestamp ON social_messages(timestamp DESC);
CREATE INDEX idx_social_msg_page ON social_messages(page_id);
CREATE INDEX idx_social_conn_page ON social_platform_connections(page_id);

-- ============================================
-- STEP 5: Enable Row Level Security
-- ============================================
ALTER TABLE social_platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: Create RLS Policies
-- ============================================
CREATE POLICY "auth_manage_connections" ON social_platform_connections 
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "auth_manage_conversations" ON social_conversations 
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "auth_manage_messages" ON social_messages 
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- STEP 7: Create Updated At Trigger
-- ============================================
CREATE FUNCTION update_social_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_conn_updated_at
    BEFORE UPDATE ON social_platform_connections
    FOR EACH ROW EXECUTE FUNCTION update_social_updated_at();

CREATE TRIGGER trg_conv_updated_at
    BEFORE UPDATE ON social_conversations
    FOR EACH ROW EXECUTE FUNCTION update_social_updated_at();

-- ============================================
-- DONE! 
-- To enable Realtime: Go to Database > Replication
-- and enable for social_messages & social_conversations
-- ============================================
