alter table admin_users enable row level security;
alter table appointments enable row level security;
alter table clients enable row level security;
alter table social_connections enable row level security;
alter table social_conversations enable row level security;
alter table social_messages enable row level security;
alter table error_logs enable row level security;

-- Newly added tables
alter table payments enable row level security;
alter table medical_records enable row level security;
alter table staff enable row level security;
alter table influencers enable row level security;
alter table influencer_referrals enable row level security;

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

-- Payments
create policy admin_read_payments on payments for select using (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
);
create policy admin_write_payments on payments for all using (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
) with check (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
);

-- Medical Records
create policy admin_read_medical_records on medical_records for select using (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
);
create policy admin_write_medical_records on medical_records for all using (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
) with check (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
);

-- Staff
create policy admin_read_staff on staff for select using (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
);
create policy admin_write_staff on staff for all using (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
) with check (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
);

-- Influencers
create policy admin_read_influencers on influencers for select using (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
);
create policy admin_write_influencers on influencers for all using (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
) with check (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
);

-- Influencer Referrals
create policy admin_read_influencer_referrals on influencer_referrals for select using (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
);
create policy admin_write_influencer_referrals on influencer_referrals for all using (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
) with check (
  exists(select 1 from admin_users where admin_users.user_id = auth.uid() and admin_users.active)
);