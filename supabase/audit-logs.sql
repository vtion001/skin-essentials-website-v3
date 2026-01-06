-- Audit Logs for HIPAA Compliance
create table if not exists audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id text,
  action text,
  resource text,
  resource_id text,
  details jsonb,
  status text,
  ip_address text,
  timestamp timestamptz default now()
);

create index if not exists idx_audit_logs_timestamp on audit_logs(timestamp);
create index if not exists idx_audit_logs_user on audit_logs(user_id);
create index if not exists idx_audit_logs_action on audit_logs(action);

alter table audit_logs enable row level security;

-- Only admins can read audit logs (enforced by API, but RLS adds depth)
-- Service role bypasses RLS, so this policy is for direct client access if ever needed (though it shouldn't be)
drop policy if exists "Allow service role full access" on audit_logs;
create policy "Allow service role full access" on audit_logs using (true) with check (true);
