-- Create an admin user in Supabase Auth and grant app-level admin privileges
-- Compatible with Supabase PostgreSQL; run with sufficient privileges (SQL editor or CI with service role)

begin;

create extension if not exists pgcrypto;

do $$
declare
  v_email text := 'admin@skinessentials.local';
  v_user_id uuid;
  v_now timestamptz := now();
begin
  select id into v_user_id from auth.users where email = v_email limit 1;
  if v_user_id is null then
    raise notice 'Admin user not found; create via Admin API';
  else
    insert into public.admin_users (user_id, email, active, created_at)
    values (v_user_id, v_email, true, v_now)
    on conflict (user_id) do update set
      email = excluded.email,
      active = true,
      created_at = excluded.created_at;
  end if;
end $$;

commit;