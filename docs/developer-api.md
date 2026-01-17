# Developer Operations API

This project implements a standardized monitoring interface. You can replicate this pattern in your other applications to build a centralized "Developer Hub".

## 1. Environment Setup
Add this key to your `.env.local` (and production variables):

```env
SYSTEM_MONITOR_KEY=your-secure-random-key-here
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T000/B000/XXXX
```

## 2. API Endpoints

All endpoints require the header: `Authorization: Bearer <SYSTEM_MONITOR_KEY>`

### Health Check
**GET** `/api/system/health`
Returns system uptime, memory usage, and database connection status.

### Log Access
**GET** `/api/system/logs`
Query Params:
- `limit` (default 50)
- `offset` (default 0)
- `type` ("error" | "audit")
- `search` (text filter)

## 3. Slack Integration
The `logError` utility in `lib/error-logger.ts` automatically dispatches critical errors to Slack if `SLACK_WEBHOOK_URL` is configured.

## 4. Multi-App Monitoring
To monitor multiple apps from one dashboard:
1. Implement these identical APIs in your other Next.js apps.
2. Update the `app/actions/developer.ts` (or the Dashboard UI) to iterate through a list of URLs (e.g., `['https://app1.com', 'https://app2.com']`) instead of just `localhost`.
