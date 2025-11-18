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