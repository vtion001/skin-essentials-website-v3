create table if not exists admin_users (
  user_id uuid primary key,
  email text unique,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists appointments (
  id text primary key,
  client_id text,
  client_name text,
  client_email text,
  client_phone text,
  service text,
  date date,
  time text,
  status text,
  notes text,
  duration int,
  price numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists clients (
  id text primary key,
  first_name text,
  last_name text,
  email text,
  phone text,
  date_of_birth date,
  gender text,
  address text,
  emergency_contact jsonb,
  medical_history jsonb default '[]'::jsonb,
  allergies jsonb default '[]'::jsonb,
  preferences jsonb,
  source text,
  status text,
  total_spent numeric default 0,
  last_visit date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists social_connections (
  id text primary key,
  platform text,
  page_id text,
  page_name text,
  is_connected boolean,
  last_sync_timestamp timestamptz,
  webhook_verified boolean
);

create table if not exists social_conversations (
  id text primary key,
  platform text,
  participant_id text,
  participant_name text,
  participant_profile_picture text,
  last_message text,
  last_message_timestamp timestamptz,
  unread_count int,
  is_active boolean,
  page_id text,
  page_name text,
  client_id text
);

create table if not exists social_messages (
  id text primary key,
  platform text,
  sender_id text,
  sender_name text,
  sender_profile_picture text,
  message text,
  timestamp timestamptz,
  is_read boolean,
  is_replied boolean,
  reply_message text,
  reply_timestamp timestamptz,
  attachments jsonb,
  client_id text,
  conversation_id text,
  message_type text,
  is_from_page boolean
);

create table if not exists error_logs (
  id bigserial primary key,
  context text,
  message text,
  stack text,
  meta jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_appointments_date on appointments(date);
create index if not exists idx_clients_email on clients(email);
create index if not exists idx_social_messages_conversation on social_messages(conversation_id);
create index if not exists idx_social_messages_timestamp on social_messages(timestamp);

create table if not exists payments (
  id text primary key,
  appointment_id text references appointments(id) on delete set null,
  client_id text references clients(id) on delete set null,
  amount numeric,
  method text,
  status text,
  transaction_id text,
  receipt_url text,
  uploaded_files jsonb default '[]'::jsonb,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists medical_records (
  id text primary key,
  client_id text references clients(id) on delete cascade,
  appointment_id text references appointments(id) on delete set null,
  date date,
  chief_complaint text,
  medical_history jsonb default '[]'::jsonb,
  allergies jsonb default '[]'::jsonb,
  current_medications jsonb default '[]'::jsonb,
  treatment_plan text,
  notes text,
  attachments jsonb default '[]'::jsonb,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  is_confidential boolean default true
);

create table if not exists staff (
  id text primary key,
  first_name text,
  last_name text,
  email text unique,
  phone text,
  position text,
  department text,
  license_number text,
  specialties jsonb default '[]'::jsonb,
  hire_date date,
  status text,
  avatar_url text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists influencers (
  id text primary key,
  name text,
  handle text,
  platform text,
  email text,
  phone text,
  referral_code text unique,
  commission_rate numeric default 0.10,
  total_commission_paid numeric default 0,
  status text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists influencer_referrals (
  id text primary key,
  influencer_id text references influencers(id) on delete cascade,
  client_id text references clients(id) on delete set null,
  client_name text,
  amount numeric,
  date date,
  appointment_id text references appointments(id) on delete set null,
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_payments_created_at on payments(created_at);
create index if not exists idx_payments_client on payments(client_id);
create index if not exists idx_payments_status on payments(status);
create index if not exists idx_payments_method on payments(method);

create index if not exists idx_medical_records_client on medical_records(client_id);
create index if not exists idx_medical_records_date on medical_records(date);

create index if not exists idx_staff_status on staff(status);
create index if not exists idx_staff_position on staff(position);

create index if not exists idx_influencers_platform on influencers(platform);
create index if not exists idx_influencer_referrals_influencer on influencer_referrals(influencer_id);
create index if not exists idx_influencer_referrals_date on influencer_referrals(date);

-- Ensure a client exists for every appointment (auto-create/update)
create or replace function ensure_client_on_appointments_insert()
returns trigger as $$
declare
  target_id text;
  first_name text;
  last_name text;
begin
  target_id := NEW.client_id;

  if target_id is null then
    if NEW.client_email is not null then
      select id into target_id from clients where email = NEW.client_email limit 1;
    end if;
  end if;

  if target_id is null then
    if NEW.client_phone is not null then
      select id into target_id from clients where phone = NEW.client_phone limit 1;
    end if;
  end if;

  -- derive names
  first_name := split_part(coalesce(NEW.client_name, ''), ' ', 1);
  if first_name = '' then first_name := coalesce(NEW.client_name, ''); end if;
  last_name := regexp_replace(coalesce(NEW.client_name, ''), '^\S+\s?', '');

  if target_id is null then
    target_id := 'client_' || right(md5(random()::text || clock_timestamp()::text), 12);
    insert into clients (
      id, first_name, last_name, email, phone, source, status, total_spent, last_visit
    ) values (
      target_id, first_name, nullif(last_name,''), NEW.client_email, NEW.client_phone, 'website', 'active', 0, NEW.date
    );
  else
    update clients
      set email = coalesce(NEW.client_email, email),
          phone = coalesce(NEW.client_phone, phone),
          last_visit = NEW.date,
          updated_at = now()
      where id = target_id;
  end if;

  NEW.client_id := target_id;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_appointments_ensure_client on appointments;
create trigger trg_appointments_ensure_client
before insert on appointments
for each row execute function ensure_client_on_appointments_insert();
alter table if exists medical_records add column if not exists treatments jsonb default '[]'::jsonb;
alter table if exists staff add column if not exists treatments jsonb default '[]'::jsonb;
alter table if exists appointments add column if not exists source_platform text;
alter table if exists appointments add column if not exists influencer_id text references influencers(id) on delete set null;
alter table if exists appointments add column if not exists influencer_name text;
alter table if exists appointments add column if not exists referral_code text;
alter table if exists appointments add column if not exists discount_applied boolean default false;
create index if not exists idx_appointments_source_platform on appointments(source_platform);
create index if not exists idx_appointments_influencer on appointments(influencer_id);

create table if not exists treatments (
  id text primary key,
  staff_id text references staff(id) on delete set null,
  medical_record_id text references medical_records(id) on delete set null,
  client_id text references clients(id) on delete set null,
  appointment_id text references appointments(id) on delete set null,
  procedure text,
  total numeric,
  date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_treatments_staff on treatments(staff_id);
create index if not exists idx_treatments_medical_record on treatments(medical_record_id);
create index if not exists idx_treatments_client on treatments(client_id);
create index if not exists idx_treatments_appointment on treatments(appointment_id);
create index if not exists idx_treatments_date on treatments(date);

alter table if exists treatments add column if not exists date date;

create or replace function rebuild_staff_treatments(staff_target text)
returns void as $$
begin
  update staff s
    set treatments = coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'procedure', t.procedure,
            'clientName', coalesce(c.first_name,'') || case when coalesce(c.last_name,'') <> '' then ' ' || c.last_name else '' end,
            'total', coalesce(t.total,0),
            'date', t.date::text,
            'aestheticianId', t.staff_id,
            'clientId', t.client_id
          )
        )
        from treatments t
        left join clients c on c.id = t.client_id
        where t.staff_id = staff_target
      ), '[]'::jsonb
    ),
    updated_at = now()
  where s.id = staff_target;
end;
$$ language plpgsql security definer;

create or replace function rebuild_medical_record_treatments(med_target text)
returns void as $$
begin
  update medical_records m
    set treatments = coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'date', t.date::text,
            'procedure', t.procedure,
            'aestheticianId', t.staff_id,
            'clientId', t.client_id
          )
        )
        from treatments t
        where t.medical_record_id = med_target
      ), '[]'::jsonb
    ),
    updated_at = now()
  where m.id = med_target;
end;
$$ language plpgsql security definer;

create or replace function trg_treatments_sync()
returns trigger as $$
begin
  if tg_op = 'INSERT' or tg_op = 'UPDATE' then
    if new.staff_id is not null then perform rebuild_staff_treatments(new.staff_id); end if;
    if new.medical_record_id is not null then perform rebuild_medical_record_treatments(new.medical_record_id); end if;
  elsif tg_op = 'DELETE' then
    if old.staff_id is not null then perform rebuild_staff_treatments(old.staff_id); end if;
    if old.medical_record_id is not null then perform rebuild_medical_record_treatments(old.medical_record_id); end if;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_treatments_sync_changes on treatments;
create trigger trg_treatments_sync_changes
after insert or update or delete on treatments
for each row execute function trg_treatments_sync();
-- Service catalog for Services Manager and public Services page
create table if not exists service_categories (
  id text primary key,
  category text unique,
  description text,
  image text,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists services (
  id text primary key,
  category_id text references service_categories(id) on delete cascade,
  name text,
  price text,
  description text,
  duration text,
  results text,
  sessions text,
  includes text,
  benefits jsonb default '[]'::jsonb,
  faqs jsonb default '[]'::jsonb,
  original_price text,
  badge text,
  pricing text,
  image text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_service_categories_category on service_categories(category);
create index if not exists idx_services_category on services(category_id);
create index if not exists idx_services_name on services(name);

-- Public portfolio items used by Portfolio Manager and portfolio page
create table if not exists portfolio_items (
  id text primary key,
  title text,
  category text,
  before_image text,
  after_image text,
  description text,
  treatment text,
  duration text,
  results text,
  extra_results jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_portfolio_category on portfolio_items(category);
create index if not exists idx_portfolio_treatment on portfolio_items(treatment);

-- Enable RLS on public tables
alter table service_categories enable row level security;
alter table services enable row level security;
alter table portfolio_items enable row level security;

-- Public Read Policies
drop policy if exists "Allow public read" on service_categories;
create policy "Allow public read" on service_categories for select using (true);

drop policy if exists "Allow public read" on services;
create policy "Allow public read" on services for select using (true);

drop policy if exists "Allow public read" on portfolio_items;
create policy "Allow public read" on portfolio_items for select using (true);

-- Ensure image columns exist for existing tables
do $$ 
begin
  if not exists (select 1 from information_schema.columns where table_name='services' and column_name='image') then
    alter table services add column image text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='service_categories' and column_name='image') then
    alter table service_categories add column image text;
  end if;
end $$;

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
drop policy if exists "Allow service role full access" on audit_logs;
create policy "Allow service role full access" on audit_logs using (true) with check (true);