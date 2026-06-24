-- Sincerely Core Excellence Migration
-- Triple-Layer Verification, Webhook Event Bus, API Keys, State-Machine Sequences

-- ============================================
-- 1. VERIFICATION: Add DCS fields to contacts
-- ============================================
alter table contacts add column if not exists dcs_score integer;
alter table contacts add column if not exists dcs_syntax_ok boolean;
alter table contacts add column if not exists dcs_domain_ok boolean;
alter table contacts add column if not exists dcs_smtp_ok boolean;
alter table contacts add column if not exists dcs_verified_at timestamptz;
alter table contacts add column if not exists dcs_fail_reason text;

create index if not exists idx_contacts_dcs_score on contacts(dcs_score);

-- Add DCS threshold to campaigns
alter table campaigns add column if not exists dcs_threshold integer not null default 0;

-- ============================================
-- 2. WEBHOOK EVENT BUS
-- ============================================
create table if not exists webhook_endpoints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  label text not null default 'My Webhook',
  secret text,
  is_active boolean not null default true,
  events text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_webhook_endpoints_user_id on webhook_endpoints(user_id);
alter table webhook_endpoints enable row level security;
create policy "Users manage own webhook endpoints"
  on webhook_endpoints for all using (auth.uid() = user_id);
create trigger webhook_endpoints_updated_at before update on webhook_endpoints
  for each row execute function update_updated_at();

create table if not exists webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  endpoint_id uuid not null references webhook_endpoints(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}',
  status_code integer,
  response_body text,
  success boolean not null default false,
  attempts integer not null default 0,
  last_attempt_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_webhook_deliveries_endpoint on webhook_deliveries(endpoint_id);
create index if not exists idx_webhook_deliveries_created on webhook_deliveries(created_at);

alter table webhook_deliveries enable row level security;
create policy "Users view own webhook deliveries"
  on webhook_deliveries for all using (
    exists (select 1 from webhook_endpoints where webhook_endpoints.id = webhook_deliveries.endpoint_id and webhook_endpoints.user_id = auth.uid())
  );

-- ============================================
-- 3. API KEY MANAGEMENT
-- ============================================
create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  key_hash text not null,
  key_prefix text not null,
  scopes text[] not null default '{read,write}',
  rate_limit integer not null default 100,
  last_used_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_api_keys_user_id on api_keys(user_id);
create index if not exists idx_api_keys_hash on api_keys(key_hash);

alter table api_keys enable row level security;
create policy "Users manage own api keys"
  on api_keys for all using (auth.uid() = user_id);

-- ============================================
-- 4. STATE-MACHINE SEQUENCE: Conditional branches
-- ============================================

-- Add new step types and condition fields to campaign_steps
alter table campaign_steps add column if not exists condition_field text;
alter table campaign_steps add column if not exists condition_operator text;
alter table campaign_steps add column if not exists condition_value text;
alter table campaign_steps add column if not exists true_branch_step integer;
alter table campaign_steps add column if not exists false_branch_step integer;
alter table campaign_steps add column if not exists webhook_event text;
alter table campaign_steps add column if not exists webhook_timeout_hours integer default 72;
alter table campaign_steps add column if not exists send_at_local_time text;

-- Track webhook wait state on campaign contacts
alter table campaign_contacts add column if not exists waiting_for_webhook text;
alter table campaign_contacts add column if not exists webhook_wait_until timestamptz;
alter table campaign_contacts add column if not exists contact_timezone text;
