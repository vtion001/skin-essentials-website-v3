# Production Setup Guide

This guide covers setting up the Skin Essentials platform for production deployment.

## Prerequisites

- Node.js 18+ installed
- Supabase account and project created
- Facebook Developer account
- Vercel account (or other hosting platform)
- Domain name configured

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

### Supabase Configuration

```env
# Supabase Connection
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_DB_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres
```

**Get these values from**: Supabase Dashboard → Project Settings → API

### Facebook/Meta Configuration

```env
# Facebook App
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=https://your-domain.com/api/auth/facebook/callback
FACEBOOK_WEBHOOK_VERIFY_TOKEN=your-random-verify-token

# Base URL
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

**Setup Steps**:
1. Create app at [developers.facebook.com](https://developers.facebook.com)
2. Note App ID and App Secret
3. Configure OAuth redirect URL
4. Set up webhooks

See [facebook-meta-setup.md](facebook-meta-setup.md) for detailed instructions.

### SMS Configuration

```env
# iProgSMS
IPROGSMS_API_TOKEN=your-iprogms-api-token
```

**Get this from**: iProgSMS dashboard

### System Monitoring

```env
# Developer Mode
SYSTEM_MONITOR_KEY=your-secure-monitoring-key
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T000/B000/XXXX
```

**Generate monitoring key**:
```bash
openssl rand -base64 32
```

### Optional: Vercel Deployment

```env
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
```

**Get these from**: Vercel Dashboard → Settings

## Database Setup

### 1. Create Supabase Tables

Run the following SQL files in Supabase SQL Editor (order matters):

```bash
# Core tables
supabase/schema.sql

# Social media integration
supabase/social-media.sql

# Any additional migrations
supabase/migrations/*.sql
```

### 2. Enable Realtime

1. Go to Supabase Dashboard → Database → Replication
2. Enable realtime for tables:
   - `social_conversations`
   - `social_messages`
   - `appointments`
   - `audit_logs`

### 3. Configure RLS Policies

Ensure Row Level Security policies are set up properly:
- Clients can only see their own data
- Admins can access all data
- Public access is restricted

```sql
-- Example: Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed)
CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);
```

### 4. Create Indexes

Important indexes for performance:

```sql
-- Appointments
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_client_id ON appointments(client_id);

-- Social messages
CREATE INDEX idx_social_messages_conversation ON social_messages(conversation_id);
CREATE INDEX idx_social_messages_created ON social_messages(created_at DESC);

-- Error logs
CREATE INDEX idx_error_logs_created ON error_logs(created_at DESC);

-- Audit logs
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
```

## CI/CD Setup

### GitHub Actions Workflow

Create `.github/workflows/ci-cd.yml`:

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Required GitHub Secrets

Add these to your GitHub repository settings:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Deployment Platforms

### Vercel (Recommended)

1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel project settings
3. Deploy automatically on push to main

### Other Platforms

The app can be deployed to:
- **Netlify**: Requires build command `npm run build` and output directory `.next`
- **AWS**: Use SST or Serverless Framework
- **Railway**: Simple deployment with environment variables
- **DigitalOcean App Platform**: Container-based deployment

## Monitoring and Alerting

### Developer Mode Dashboard

Access at: `https://your-domain.com/admin/developer`

Features:
- System health monitoring
- Real-time error logs
- Audit trail access
- Database latency tracking

See [developer-mode.md](developer-mode.md) for details.

### Error Logging

Errors are automatically logged to:
- Supabase `error_logs` table
- Slack (if `SLACK_WEBHOOK_URL` configured)

### Custom Alerts

Set up alerts for:
- High error rate
- Database connection failures
- API response time > 2s
- Failed webhook deliveries

## Backup and Recovery

### Automatic Backups

Supabase provides:
- Daily backups (retained 30 days)
- Point-in-time recovery (7 days)
- Real-time replication

### Manual Backup

```bash
# Export database
pg_dump $SUPABASE_DB_URL > backup_$(date +%Y%m%d).sql

# Upload to secure storage
aws s3 cp backup_*.sql s3://your-backup-bucket/
```

### Recovery Steps

1. Identify the backup point
2. Use Supabase dashboard to restore
3. Or manually restore from SQL dump:
   ```bash
   psql $SUPABASE_DB_URL < backup_20250117.sql
   ```

## Performance Optimization

### Database Optimization

- Create indexes for frequently queried fields
- Use connection pooling (Supabase provides this)
- Monitor query performance
- Archive old logs periodically

### Application Optimization

- Enable caching where appropriate
- Use server actions for data fetching
- Implement pagination for large datasets
- Lazy load heavy components
- Optimize images and assets

### CDN Configuration

For Vercel:
- Automatically uses Vercel Edge Network
- Static assets cached globally
- API routes cached when possible

## Security Best Practices

### Environment Variables

- Never commit `.env` files
- Rotate secrets regularly
- Use different keys for each environment
- Monitor for leaked credentials

### Access Control

- Enable RLS on all tables
- Use service role key only server-side
- Implement proper authentication
- Audit admin access

### Webhooks

- Always verify signatures
- Use HTTPS for all endpoints
- Rate limit webhook handlers
- Validate all incoming data

### HIPAA Compliance

- Encrypt all PII at rest and in transit
- Implement audit logging
- Regular security reviews
- Business associate agreements with vendors

## Health Checks

### Application Health

```bash
# Check application status
curl https://your-domain.com/api/system/health \
  -H "Authorization: Bearer $SYSTEM_MONITOR_KEY"
```

### Database Health

Monitor:
- Connection pool usage
- Query performance
- Replication lag
- Storage usage

## Post-Deployment Checklist

After deploying to production:

- [ ] All environment variables set
- [ ] Database tables created and indexed
- [ ] Realtime subscriptions working
- [ ] Webhooks configured and verified
- [ ] SSL certificate valid
- [ ] DNS properly configured
- [ ] Monitoring dashboards active
- [ ] Backup schedule configured
- [ ] Error alerts configured
- [ ] Performance baselines established

## Maintenance

### Regular Tasks

**Daily**:
- Monitor error logs
- Check system health
- Review backup status

**Weekly**:
- Review audit logs
- Check for security vulnerabilities
- Analyze performance metrics

**Monthly**:
- Rotate secrets
- Archive old logs
- Update dependencies
- Review and optimize slow queries

## Troubleshooting

### Common Issues

**Build Failures**:
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Database Connection Issues**:
- Verify Supabase URL and keys
- Check network connectivity
- Review Supabase status page

**Webhook Failures**:
- Verify webhook tokens
- Check Facebook app status
- Review server logs

See [developer-mode.md](developer-mode.md) for detailed troubleshooting.

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Facebook Platform Docs](https://developers.facebook.com/docs)

## Additional Resources

- [Developer API Reference](developer-api.md)
- [Social Media Architecture](social-media-architecture.md)
- [Code Standards](code-standards.md)

---

**Last Updated**: January 17, 2026
