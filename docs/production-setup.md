# Production Setup

## Environment Variables
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`.
- Facebook: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `FACEBOOK_REDIRECT_URI`, `FACEBOOK_WEBHOOK_VERIFY_TOKEN`.
- Optional: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` for deployments.

## CI/CD
- GitHub Actions workflow `.github/workflows/ci-cd.yml` builds on push to `main`.
- If `SUPABASE_DB_URL` is set, schema and policies are applied via `psql`.
- If Vercel secrets are set, deploy job runs.

## Monitoring and Alerting
- Application errors are inserted into `error_logs`.
- Connect external alerting via dashboard queries or add a webhook consumer.

## Backup and Recovery
- Use Supabase project backups or export via `pg_dump` using `SUPABASE_DB_URL`.
- Store backups in secure object storage with retention.

## Performance Optimization
- Indexes for common queries are created in `supabase/schema.sql`.
- Use upserts for idempotent writes and avoid N+1 calls in sync tasks.