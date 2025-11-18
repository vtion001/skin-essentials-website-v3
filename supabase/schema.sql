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