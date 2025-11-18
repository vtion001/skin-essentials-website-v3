-- Cleanup manually created admin user/identity to resolve GoTrue schema errors
-- Use with caution; run only if login fails with "Database error querying schema"

begin;

do $$
declare
  v_email text := 'admin@skinessentials.local';
  v_user_id uuid;
begin
  -- Find any user id by email
  select id into v_user_id from auth.users where email = v_email limit 1;

  -- Remove email identity rows referencing the user/email
  delete from auth.identities 
  where provider = 'email' 
    and (provider_id = v_email or user_id = v_user_id);

  -- Remove user row if present
  if v_user_id is not null then
    delete from auth.users where id = v_user_id;
  end if;
  -- Remove any stale admin mapping
  delete from public.admin_users where email = v_email or user_id = v_user_id;
end $$;

commit;