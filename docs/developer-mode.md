# Developer Mode Documentation

## Overview

The Developer Mode is a centralized monitoring and operations dashboard for the Skin Essentials platform. It provides real-time system health monitoring, log access, and error tracking capabilities through an intuitive web interface and REST API.

## Features

- **System Health Monitoring**: Real-time status of system uptime, database connectivity, and resource usage
- **Log Access**: View and search application error logs and audit trails
- **Test Error Generation**: Trigger test errors to validate error logging pipeline
- **Auto-refresh**: Automatic data refresh every 30 seconds
- **Slack Integration**: Automatic alerts for critical errors
- **Secure Access**: Bearer token authentication for API endpoints

## Access

The Developer Dashboard is available at:
```
/admin/developer
```

⚠️ **Security Note**: Access to this endpoint should be restricted to authorized personnel only. Production environments should implement additional authentication/authorization layers.

## Setup

### 1. Environment Variables

Add the following to your `.env.local` file:

```env
# Secure key for system monitoring API access
SYSTEM_MONITOR_KEY=your-secure-random-key-here

# Optional: Slack webhook for error alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T000/B000/XXXX
```

Generate a secure `SYSTEM_MONITOR_KEY` using:
```bash
openssl rand -base64 32
```

### 2. Database Tables

Ensure the following tables exist in your Supabase database:

#### `error_logs` table
- `id`: uuid (primary key)
- `context`: text
- `message`: text
- `stack`: text (nullable)
- `meta`: jsonb (nullable)
- `created_at`: timestamp with time zone

#### `audit_logs` table
- `id`: uuid (primary key)
- `user_id`: uuid
- `action`: text
- `resource`: text
- `details`: jsonb (nullable)
- `status`: text
- `ip_address`: text
- `timestamp`: timestamp with time zone

## API Endpoints

All API endpoints require Bearer token authentication:

```
Authorization: Bearer <SYSTEM_MONITOR_KEY>
```

### 1. Health Check

**Endpoint**: `GET /api/system/health`

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-17T10:00:00.000Z",
  "environment": "production",
  "system": {
    "uptime": 3600,
    "memory": {
      "rss": "256MB",
      "heapTotal": "128MB",
      "heapUsed": "64MB"
    }
  },
  "services": {
    "database": {
      "status": "healthy",
      "latency": "45ms"
    }
  },
  "meta": {
    "duration": "52ms"
  }
}
```

### 2. Log Access

**Endpoint**: `GET /api/system/logs`

**Query Parameters**:
- `limit` (optional): Number of logs to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `type` (optional): Log type - `"error"` or `"audit"` (default: "error")
- `search` (optional): Text filter for log content

**Response**:
```json
{
  "data": [
    {
      "id": "uuid-here",
      "level": "ERROR",
      "source": "API_ROUTE",
      "message": "Database connection failed",
      "timestamp": "2026-01-17T10:00:00.000Z",
      "metadata": {
        "stack": "Error: Database connection failed...",
        "meta": {
          "additional": "context data"
        }
      }
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

## Dashboard UI Components

### System Health Cards

1. **System Status**
   - Shows overall system health (Operational/Degraded)
   - Displays system uptime in minutes
   - Animated status indicator

2. **Database**
   - Connection status with icon
   - Query latency in milliseconds
   - Connection pool status

3. **Resources**
   - Memory usage (RSS)
   - Heap memory statistics

### Live Logs Tab

- Displays error logs in chronological order
- Searchable by content
- Expandable stack traces
- Color-coded severity levels
- Auto-refreshes every 30 seconds

### Audit Trail Tab

- Shows HIPAA compliance logs
- User actions tracking
- Resource access monitoring
- IP address logging

## Server Actions

### `fetchSystemHealth()`

Fetches current system health metrics from the health API endpoint.

```typescript
import { fetchSystemHealth } from '@/app/actions/developer';

const health = await fetchSystemHealth();
console.log(health.status); // "healthy" | "degraded"
```

### `fetchSystemLogs(type, search)`

Fetches logs with optional filtering.

```typescript
import { fetchSystemLogs } from '@/app/actions/developer';

// Get error logs
const errorLogs = await fetchSystemLogs('error', 'database');

// Get audit logs
const auditLogs = await fetchSystemLogs('audit', 'login');
```

### `triggerTestError()`

Triggers a test error to validate the error logging pipeline.

```typescript
import { triggerTestError } from '@/app/actions/developer';

await triggerTestError();
```

## Slack Integration

### Setup

1. Create a Slack app and enable Incoming Webhooks
2. Copy the webhook URL
3. Add to environment variables:
   ```env
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T000/B000/XXXX
   ```

### Usage

The `logError` utility in `lib/error-logger.ts` automatically sends errors to Slack when configured:

```typescript
import { logError } from '@/lib/error-logger';

try {
  // Your code
} catch (error) {
  await logError('API_ENDPOINT', error, {
    userId: '123',
    endpoint: '/api/users'
  });
}
```

### Slack Alert Format

```
[API_ENDPOINT] Database connection failed

Context:
- Stack: Error trace...
- Meta: {"userId":"123","endpoint":"/api/users"}
```

## Security Best Practices

1. **Secure the API Key**: Never commit `SYSTEM_MONITOR_KEY` to version control
2. **Environment Specific**: Use different keys for development, staging, and production
3. **Rate Limiting**: Implement rate limiting on API endpoints in production
4. **Access Control**: Add authentication middleware to the admin routes
5. **Audit**: Monitor access to the developer dashboard

## Multi-Application Monitoring

To monitor multiple applications from a single dashboard:

1. Implement the same API endpoints in other Next.js applications
2. Update `app/actions/developer.ts` to iterate through multiple base URLs:

```typescript
const BASE_URLS = [
  'https://app1.yourdomain.com',
  'https://app2.yourdomain.com',
  'https://app3.yourdomain.com'
];

export async function fetchSystemHealth() {
  const results = await Promise.all(
    BASE_URLS.map(url => 
      fetch(`${url}/api/system/health`, {
        headers: { 'Authorization': `Bearer ${SYSTEM_MONITOR_KEY}` },
        cache: 'no-store'
      }).then(res => res.json())
    )
  );
  
  return { results, timestamp: new Date().toISOString() };
}
```

## Troubleshooting

### "Unauthorized" Response

- Verify `SYSTEM_MONITOR_KEY` is set in environment variables
- Ensure the Authorization header format is correct: `Bearer <key>`
- Check for typos in the key value

### Empty Logs

- Verify database connection is working
- Check if logs table has any records
- Ensure search query is not too restrictive

### Health Check Degraded

- Check database connectivity
- Verify Supabase service status
- Review application logs for connection errors

## Maintenance

### Log Cleanup

Implement a scheduled job to clean up old logs:

```sql
-- Delete logs older than 90 days
DELETE FROM error_logs 
WHERE created_at < NOW() - INTERVAL '90 days';

DELETE FROM audit_logs 
WHERE timestamp < NOW() - INTERVAL '90 days';
```

### Performance Monitoring

Monitor the following metrics:
- API response time
- Database query latency
- Memory usage trends
- Error rate over time

## Future Enhancements

- [ ] Real-time WebSocket support for live log streaming
- [ ] Custom alert thresholds and notifications
- [ ] Log aggregation from multiple sources
- [ ] Performance profiling integration
- [ ] Automated log analysis and anomaly detection
