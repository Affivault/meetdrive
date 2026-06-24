-- =============================================
-- Sincerely: Complete Database Schema (idempotent)
-- Paste this entire file into Supabase SQL Editor and hit Run.
-- Safe to run multiple times — won't break anything.
-- =============================================

-- ============================================
-- CONTACTS
-- ============================================
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  first_name text,
  last_name text,
  company text,
  job_title text,
  phone text,
  linkedin_url text,
  website text,
  custom_fields jsonb not null default '{}',
  source text not null default 'manual',
  is_unsubscribed boolean not null default false,
  is_bounced boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, email)
);

create index if not exists idx_contacts_user_id on contacts(user_id);
create index if not exists idx_contacts_email on contacts(email);
create index if not exists idx_contacts_created_at on contacts(created_at);

alter table contacts enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'contacts' and policyname = 'Users can manage their own contacts') then
    create policy "Users can manage their own contacts" on contacts for all using (auth.uid() = user_id);
  end if;
end $$;

-- ============================================
-- TAGS
-- ============================================
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#6B7280',
  created_at timestamptz not null default now(),
  unique(user_id, name)
);

create index if not exists idx_tags_user_id on tags(user_id);

alter table tags enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'tags' and policyname = 'Users can manage their own tags') then
    create policy "Users can manage their own tags" on tags for all using (auth.uid() = user_id);
  end if;
end $$;

-- ============================================
-- CONTACT_TAGS (junction)
-- ============================================
create table if not exists contact_tags (
  contact_id uuid not null references contacts(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (contact_id, tag_id)
);

create index if not exists idx_contact_tags_tag_id on contact_tags(tag_id);

alter table contact_tags enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'contact_tags' and policyname = 'Users can manage their own contact tags') then
    create policy "Users can manage their own contact tags" on contact_tags for all using (
      exists (select 1 from contacts where contacts.id = contact_tags.contact_id and contacts.user_id = auth.uid())
    );
  end if;
end $$;

-- ============================================
-- SMTP ACCOUNTS
-- ============================================
create table if not exists smtp_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  email_address text not null,
  smtp_host text not null,
  smtp_port integer not null,
  smtp_secure boolean not null default false,
  smtp_user text not null,
  smtp_pass_encrypted text not null,
  imap_host text,
  imap_port integer,
  imap_secure boolean,
  daily_send_limit integer not null default 200,
  sends_today integer not null default 0,
  last_send_reset_at timestamptz not null default now(),
  is_verified boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_smtp_accounts_user_id on smtp_accounts(user_id);

alter table smtp_accounts enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'smtp_accounts' and policyname = 'Users can manage their own SMTP accounts') then
    create policy "Users can manage their own SMTP accounts" on smtp_accounts for all using (auth.uid() = user_id);
  end if;
end $$;

-- ============================================
-- CAMPAIGNS
-- ============================================
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  status text not null default 'draft',
  smtp_account_id uuid references smtp_accounts(id) on delete set null,
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  timezone text not null default 'UTC',
  send_window_start text,
  send_window_end text,
  send_days text[] not null default '{"monday","tuesday","wednesday","thursday","friday"}',
  total_contacts integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_campaigns_user_id on campaigns(user_id);
create index if not exists idx_campaigns_status on campaigns(status);

alter table campaigns enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'campaigns' and policyname = 'Users can manage their own campaigns') then
    create policy "Users can manage their own campaigns" on campaigns for all using (auth.uid() = user_id);
  end if;
end $$;

-- ============================================
-- CAMPAIGN STEPS
-- ============================================
create table if not exists campaign_steps (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  step_order integer not null default 0,
  step_type text not null default 'email',
  subject text,
  body_html text,
  body_text text,
  delay_days integer not null default 0,
  delay_hours integer not null default 0,
  delay_minutes integer not null default 0,
  skip_if_replied boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_campaign_steps_campaign_id on campaign_steps(campaign_id);

alter table campaign_steps enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'campaign_steps' and policyname = 'Users can manage their own campaign steps') then
    create policy "Users can manage their own campaign steps" on campaign_steps for all using (
      exists (select 1 from campaigns where campaigns.id = campaign_steps.campaign_id and campaigns.user_id = auth.uid())
    );
  end if;
end $$;

-- ============================================
-- CAMPAIGN CONTACTS
-- ============================================
create table if not exists campaign_contacts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  contact_id uuid not null references contacts(id) on delete cascade,
  status text not null default 'pending',
  current_step_order integer not null default 0,
  next_send_at timestamptz,
  completed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(campaign_id, contact_id)
);

create index if not exists idx_campaign_contacts_campaign_id on campaign_contacts(campaign_id);
create index if not exists idx_campaign_contacts_contact_id on campaign_contacts(contact_id);
create index if not exists idx_campaign_contacts_status on campaign_contacts(status);
create index if not exists idx_campaign_contacts_next_send on campaign_contacts(next_send_at);

alter table campaign_contacts enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'campaign_contacts' and policyname = 'Users can manage their own campaign contacts') then
    create policy "Users can manage their own campaign contacts" on campaign_contacts for all using (
      exists (select 1 from campaigns where campaigns.id = campaign_contacts.campaign_id and campaigns.user_id = auth.uid())
    );
  end if;
end $$;

-- ============================================
-- CAMPAIGN ACTIVITIES
-- ============================================
create table if not exists campaign_activities (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  campaign_contact_id uuid not null references campaign_contacts(id) on delete cascade,
  step_id uuid references campaign_steps(id) on delete set null,
  contact_id uuid not null references contacts(id) on delete cascade,
  activity_type text not null,
  metadata jsonb not null default '{}',
  message_id text,
  occurred_at timestamptz not null default now()
);

create index if not exists idx_campaign_activities_campaign_id on campaign_activities(campaign_id);
create index if not exists idx_campaign_activities_contact_id on campaign_activities(contact_id);
create index if not exists idx_campaign_activities_type on campaign_activities(activity_type);
create index if not exists idx_campaign_activities_occurred_at on campaign_activities(occurred_at);

alter table campaign_activities enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'campaign_activities' and policyname = 'Users can manage their own campaign activities') then
    create policy "Users can manage their own campaign activities" on campaign_activities for all using (
      exists (select 1 from campaigns where campaigns.id = campaign_activities.campaign_id and campaigns.user_id = auth.uid())
    );
  end if;
end $$;

-- ============================================
-- INBOX MESSAGES
-- ============================================
create table if not exists inbox_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete set null,
  campaign_contact_id uuid references campaign_contacts(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  smtp_account_id uuid references smtp_accounts(id) on delete set null,
  from_email text not null,
  to_email text not null,
  subject text,
  body_html text,
  body_text text,
  in_reply_to text,
  message_id text,
  is_read boolean not null default false,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_inbox_messages_user_id on inbox_messages(user_id);
create index if not exists idx_inbox_messages_campaign_id on inbox_messages(campaign_id);
create index if not exists idx_inbox_messages_is_read on inbox_messages(is_read);
create index if not exists idx_inbox_messages_received_at on inbox_messages(received_at);

alter table inbox_messages enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'inbox_messages' and policyname = 'Users can manage their own inbox messages') then
    create policy "Users can manage their own inbox messages" on inbox_messages for all using (auth.uid() = user_id);
  end if;
end $$;

-- ============================================
-- EMAIL TEMPLATES
-- ============================================
create table if not exists email_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  subject text,
  body_html text,
  body_text text,
  category text not null default 'general',
  is_shared boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_email_templates_user_id on email_templates(user_id);

alter table email_templates enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'email_templates' and policyname = 'Users can manage their own templates') then
    create policy "Users can manage their own templates" on email_templates for all using (auth.uid() = user_id);
  end if;
end $$;

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers (drop first to make idempotent)
drop trigger if exists contacts_updated_at on contacts;
create trigger contacts_updated_at before update on contacts
  for each row execute function update_updated_at();

drop trigger if exists smtp_accounts_updated_at on smtp_accounts;
create trigger smtp_accounts_updated_at before update on smtp_accounts
  for each row execute function update_updated_at();

drop trigger if exists campaigns_updated_at on campaigns;
create trigger campaigns_updated_at before update on campaigns
  for each row execute function update_updated_at();

drop trigger if exists campaign_steps_updated_at on campaign_steps;
create trigger campaign_steps_updated_at before update on campaign_steps
  for each row execute function update_updated_at();

drop trigger if exists campaign_contacts_updated_at on campaign_contacts;
create trigger campaign_contacts_updated_at before update on campaign_contacts
  for each row execute function update_updated_at();

drop trigger if exists email_templates_updated_at on email_templates;
create trigger email_templates_updated_at before update on email_templates
  for each row execute function update_updated_at();


-- =============================================
-- MIGRATION 002: SSE, SARA, Dynamic Assets
-- =============================================

-- SSE: Health tracking on smtp_accounts
alter table smtp_accounts add column if not exists health_score integer not null default 100;
alter table smtp_accounts add column if not exists total_sent integer not null default 0;
alter table smtp_accounts add column if not exists total_bounced integer not null default 0;
alter table smtp_accounts add column if not exists total_opened integer not null default 0;
alter table smtp_accounts add column if not exists bounce_rate_7d real not null default 0;
alter table smtp_accounts add column if not exists last_bounce_at timestamptz;
alter table smtp_accounts add column if not exists warmup_mode boolean not null default false;
alter table smtp_accounts add column if not exists warmup_daily_target integer not null default 20;

-- SSE: Campaign SMTP pool
create table if not exists campaign_smtp_accounts (
  campaign_id uuid not null references campaigns(id) on delete cascade,
  smtp_account_id uuid not null references smtp_accounts(id) on delete cascade,
  priority integer not null default 0,
  primary key (campaign_id, smtp_account_id)
);

create index if not exists idx_campaign_smtp_campaign on campaign_smtp_accounts(campaign_id);
create index if not exists idx_campaign_smtp_account on campaign_smtp_accounts(smtp_account_id);

alter table campaign_smtp_accounts enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'campaign_smtp_accounts' and policyname = 'Users can manage their own campaign smtp accounts') then
    create policy "Users can manage their own campaign smtp accounts" on campaign_smtp_accounts for all using (
      exists (select 1 from campaigns where campaigns.id = campaign_smtp_accounts.campaign_id and campaigns.user_id = auth.uid())
    );
  end if;
end $$;

-- SARA: Inbox message classification
alter table inbox_messages add column if not exists sara_intent text;
alter table inbox_messages add column if not exists sara_confidence real;
alter table inbox_messages add column if not exists sara_draft_reply text;
alter table inbox_messages add column if not exists sara_action text;
alter table inbox_messages add column if not exists sara_status text not null default 'pending_review';
alter table inbox_messages add column if not exists sara_reviewed_at timestamptz;
alter table inbox_messages add column if not exists sara_reviewed_by uuid references auth.users(id);

create index if not exists idx_inbox_sara_status on inbox_messages(sara_status);
create index if not exists idx_inbox_sara_intent on inbox_messages(sara_intent);

-- Dynamic Assets
create table if not exists asset_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  width integer not null default 600,
  height integer not null default 315,
  background_color text not null default '#ffffff',
  layers jsonb not null default '[]',
  preview_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_asset_templates_user_id on asset_templates(user_id);

alter table asset_templates enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'asset_templates' and policyname = 'Users can manage their own asset templates') then
    create policy "Users can manage their own asset templates" on asset_templates for all using (auth.uid() = user_id);
  end if;
end $$;

drop trigger if exists asset_templates_updated_at on asset_templates;
create trigger asset_templates_updated_at before update on asset_templates
  for each row execute function update_updated_at();


-- =============================================
-- MIGRATION 003: Verification, Webhooks, API Keys, Sequences
-- =============================================

-- DCS fields on contacts
alter table contacts add column if not exists dcs_score integer;
alter table contacts add column if not exists dcs_syntax_ok boolean;
alter table contacts add column if not exists dcs_domain_ok boolean;
alter table contacts add column if not exists dcs_smtp_ok boolean;
alter table contacts add column if not exists dcs_verified_at timestamptz;
alter table contacts add column if not exists dcs_fail_reason text;

create index if not exists idx_contacts_dcs_score on contacts(dcs_score);

alter table campaigns add column if not exists dcs_threshold integer not null default 0;

-- Webhook endpoints
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
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'webhook_endpoints' and policyname = 'Users manage own webhook endpoints') then
    create policy "Users manage own webhook endpoints" on webhook_endpoints for all using (auth.uid() = user_id);
  end if;
end $$;

drop trigger if exists webhook_endpoints_updated_at on webhook_endpoints;
create trigger webhook_endpoints_updated_at before update on webhook_endpoints
  for each row execute function update_updated_at();

-- Webhook deliveries
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
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'webhook_deliveries' and policyname = 'Users view own webhook deliveries') then
    create policy "Users view own webhook deliveries" on webhook_deliveries for all using (
      exists (select 1 from webhook_endpoints where webhook_endpoints.id = webhook_deliveries.endpoint_id and webhook_endpoints.user_id = auth.uid())
    );
  end if;
end $$;

-- API Keys
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
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'api_keys' and policyname = 'Users manage own api keys') then
    create policy "Users manage own api keys" on api_keys for all using (auth.uid() = user_id);
  end if;
end $$;

-- State-machine sequence fields
alter table campaign_steps add column if not exists condition_field text;
alter table campaign_steps add column if not exists condition_operator text;
alter table campaign_steps add column if not exists condition_value text;
alter table campaign_steps add column if not exists true_branch_step integer;
alter table campaign_steps add column if not exists false_branch_step integer;
alter table campaign_steps add column if not exists webhook_event text;
alter table campaign_steps add column if not exists webhook_timeout_hours integer default 72;
alter table campaign_steps add column if not exists send_at_local_time text;

alter table campaign_contacts add column if not exists waiting_for_webhook text;
alter table campaign_contacts add column if not exists webhook_wait_until timestamptz;
alter table campaign_contacts add column if not exists contact_timezone text;


-- =============================================
-- MIGRATION 004: Contact Lists & Segments
-- =============================================

create table if not exists contact_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  color text not null default '#6B7280',
  icon text default 'users',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, name)
);

create index if not exists idx_contact_lists_user_id on contact_lists(user_id);

alter table contact_lists enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'contact_lists' and policyname = 'Users can manage their own contact lists') then
    create policy "Users can manage their own contact lists" on contact_lists for all using (auth.uid() = user_id);
  end if;
end $$;

create table if not exists list_contacts (
  list_id uuid not null references contact_lists(id) on delete cascade,
  contact_id uuid not null references contacts(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (list_id, contact_id)
);

create index if not exists idx_list_contacts_contact_id on list_contacts(contact_id);

alter table list_contacts enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'list_contacts' and policyname = 'Users can manage their own list contacts') then
    create policy "Users can manage their own list contacts" on list_contacts for all using (
      exists (select 1 from contact_lists where contact_lists.id = list_contacts.list_id and contact_lists.user_id = auth.uid())
    );
  end if;
end $$;

create table if not exists saved_segments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  icon text default 'filter',
  color text not null default '#8B5CF6',
  filter_config jsonb not null default '{"conditions":[],"logic":"and"}',
  cached_count integer default 0,
  cached_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, name)
);

create index if not exists idx_saved_segments_user_id on saved_segments(user_id);

alter table saved_segments enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'saved_segments' and policyname = 'Users can manage their own saved segments') then
    create policy "Users can manage their own saved segments" on saved_segments for all using (auth.uid() = user_id);
  end if;
end $$;

drop trigger if exists contact_lists_updated_at on contact_lists;
create trigger contact_lists_updated_at before update on contact_lists
  for each row execute function update_updated_at();

drop trigger if exists saved_segments_updated_at on saved_segments;
create trigger saved_segments_updated_at before update on saved_segments
  for each row execute function update_updated_at();

-- Default list creation function
create or replace function create_default_list_for_user()
returns trigger as $$
begin
  insert into contact_lists (user_id, name, description, is_default, icon, color)
  values (new.id, 'All Contacts', 'Default list containing all your contacts', true, 'users', '#10B981');
  return new;
end;
$$ language plpgsql security definer;


-- =============================================
-- MIGRATION 005: Inbox sync tracking
-- =============================================
alter table smtp_accounts add column if not exists last_inbox_sync_at timestamptz;


-- =============================================
-- MIGRATION 006: Campaign sending controls
-- =============================================
alter table campaigns add column if not exists daily_limit integer not null default 0;
alter table campaigns add column if not exists delay_between_emails integer not null default 60;
alter table campaigns add column if not exists stop_on_reply boolean not null default true;
alter table campaigns add column if not exists track_opens boolean not null default true;
alter table campaigns add column if not exists track_clicks boolean not null default true;


-- =============================================
-- MIGRATION 007: A/B subject line testing
-- =============================================
alter table campaign_steps add column if not exists subject_b text;


-- =============================================
-- MIGRATION 008: Fix missing columns + include_unsubscribe
-- =============================================
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_unsubscribed boolean NOT NULL DEFAULT false;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_bounced boolean NOT NULL DEFAULT false;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS include_unsubscribe boolean NOT NULL DEFAULT false;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS delay_between_emails_min integer NOT NULL DEFAULT 50;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS delay_between_emails_max integer NOT NULL DEFAULT 200;


-- =============================================
-- DONE
-- =============================================
