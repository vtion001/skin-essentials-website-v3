alter table admin_users enable row level security;
alter table appointments enable row level security;
alter table clients enable row level security;
alter table social_connections enable row level security;
alter table social_conversations enable row level security;
alter table social_messages enable row level security;
alter table error_logs enable row level security;

create policy admin_read_admin_users on admin_users for select using (auth.uid() = user_id);
create policy admin_manage_admin_users on admin_users for all using (false) with check (false);

create policy admin_read_appointments on appointments for select using (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
);
create policy admin_write_appointments on appointments for all using (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
);

create policy admin_read_clients on clients for select using (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
);
create policy admin_write_clients on clients for all using (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
);

create policy admin_read_social_connections on social_connections for select using (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
);
create policy admin_write_social_connections on social_connections for all using (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
);

create policy admin_read_social_conversations on social_conversations for select using (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
);
create policy admin_write_social_conversations on social_conversations for all using (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
);

create policy admin_read_social_messages on social_messages for select using (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
);
create policy admin_write_social_messages on social_messages for all using (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
);

create policy admin_insert_error_logs on error_logs for insert with check (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
);