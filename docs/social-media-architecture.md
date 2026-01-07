# Social Media Integration Architecture

## Overview

This document describes the new Supabase-backed social media messaging system that provides:
- **Real-time message updates** via webhooks
- **Incremental sync** (only fetch new messages)
- **Persistent storage** in Supabase
- **Fast local reads** from database instead of Facebook API

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    Webhook     ┌─────────────────────────────┐ │
│  │  Facebook   │ ──────────────▶│  /api/webhooks/facebook     │ │
│  │  Pages API  │                │  (Real-time incoming msgs)  │ │
│  └─────────────┘                └──────────────┬──────────────┘ │
│         ▲                                      │                │
│         │ Incremental Sync                     ▼                │
│         │ (fetch only new)          ┌─────────────────────────┐ │
│  ┌──────┴──────────────────────────▶│      SUPABASE           │ │
│  │  /api/social/sync                │  - social_conversations │ │
│  │                                  │  - social_messages      │ │
│  │  ┌──────────────────────────┐    │  - social_platform_     │ │
│  │  │   SocialMediaService     │◀───│    connections          │ │
│  │  │   (legacy localStorage)  │    └─────────────────────────┘ │
│  │  └──────────────────────────┘              ▲                 │
│  │                                            │                 │
│  │                                   Realtime Subscription      │
│  │                                            │                 │
│  │  ┌──────────────────────────┐    ┌────────┴────────────────┐ │
│  │  │   localStorage           │    │   SocialConversationUI  │ │
│  │  │   (cache/fallback)       │◀───│   (subscribes via hook) │ │
│  │  └──────────────────────────┘    └─────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Database Tables

Run `supabase/social-media.sql` in your Supabase SQL Editor to create:

| Table | Purpose |
|-------|---------|
| `social_platform_connections` | Stores connected Facebook pages with access tokens |
| `social_conversations` | Stores conversation threads with participants |
| `social_messages` | Stores individual messages |

## API Endpoints

### Read Operations (Fast - from Supabase)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/social/conversations` | GET | Fetch all conversations |
| `/api/social/messages?conversationId=X` | GET | Fetch messages for a conversation |

### Write Operations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/social/sync` | POST | Trigger incremental sync from Facebook |
| `/api/webhooks/facebook` | POST | Receive real-time messages from Facebook |

## Setup Instructions

### 1. Run Database Migration

1. Go to Supabase Dashboard → SQL Editor
2. Paste and run `supabase/social-media.sql`
3. Go to Database → Replication
4. Enable realtime for `social_messages` and `social_conversations`

### 2. Configure Facebook Webhook

1. Go to [Facebook Developer Console](https://developers.facebook.com)
2. Select your app → Webhooks
3. Add callback URL: `https://your-domain.com/api/webhooks/facebook`
4. Verify token: Use the value from `FACEBOOK_WEBHOOK_VERIFY_TOKEN` in `.env.local`
5. Subscribe to: `messages`, `messaging_postbacks`

### 3. Environment Variables

```env
# Required for webhook verification
FACEBOOK_WEBHOOK_VERIFY_TOKEN=your_random_secure_token

# Already configured
FACEBOOK_APP_ID=xxx
FACEBOOK_APP_SECRET=xxx
```

## How It Works

### Initial Sync (First Time)

1. User connects Facebook page via OAuth
2. System triggers full sync via `/api/social/sync` with `fullSync: true`
3. All conversations and messages are stored in Supabase
4. UI loads data from Supabase (fast)

### Incremental Sync (Subsequent)

1. Background timer triggers sync every 15 seconds
2. `/api/social/sync` checks `last_sync_at` from connection record
3. Only fetches conversations/messages updated since last sync
4. Dramatically reduces API calls

### Real-time Updates (Webhooks)

1. When a user sends a message to your Facebook page
2. Facebook sends webhook to `/api/webhooks/facebook`
3. Webhook handler saves message directly to Supabase
4. Supabase realtime broadcasts to subscribed clients
5. `useSupabaseRealtime` hook receives update
6. UI refreshes automatically - **no polling needed!**

## Key Files

| File | Purpose |
|------|---------|
| `lib/services/admin/supabase-social.service.ts` | Supabase CRUD operations |
| `hooks/useSupabaseRealtime.ts` | React hook for realtime subscriptions |
| `app/api/webhooks/facebook/route.ts` | Webhook handler |
| `app/api/social/sync/route.ts` | Incremental sync endpoint |
| `app/api/social/conversations/route.ts` | Read conversations from Supabase |
| `app/api/social/messages/route.ts` | Read messages from Supabase |

## Fallback Behavior

The system gracefully falls back to the old localStorage-based approach if:
- Supabase is not configured
- API calls fail
- Realtime subscription fails

This ensures the UI always works, even if the new architecture has issues.
