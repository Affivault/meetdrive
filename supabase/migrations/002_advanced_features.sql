-- Sincerely Advanced Features Migration
-- SSE (Smart-Sharding Engine), SARA (Autonomous Reply Agent), Dynamic Assets

-- ============================================
-- SSE: Extend smtp_accounts with health tracking
-- ============================================
alter table smtp_accounts add column if not exists health_score integer not null default 100;
alter table smtp_accounts add column if not exists total_sent integer not null default 0;
alter table smtp_accounts add column if not exists total_bounced integer not null default 0;
alter table smtp_accounts add column if not exists total_opened integer not null default 0;
alter table smtp_accounts add column if not exists bounce_rate_7d real not null default 0;
alter table smtp_accounts add column if not exists last_bounce_at timestamptz;
alter table smtp_accounts add column if not exists warmup_mode boolean not null default false;
alter table smtp_accounts add column if not exists warmup_daily_target integer not null default 20;

-- ============================================
-- SSE: Campaign SMTP pool (multi-account support)
-- ============================================
create table if not exists campaign_smtp_accounts (
  campaign_id uuid not null references campaigns(id) on delete cascade,
  smtp_account_id uuid not null references smtp_accounts(id) on delete cascade,
  priority integer not null default 0,
  primary key (campaign_id, smtp_account_id)
);

create index if not exists idx_campaign_smtp_campaign on campaign_smtp_accounts(campaign_id);
create index if not exists idx_campaign_smtp_account on campaign_smtp_accounts(smtp_account_id);

alter table campaign_smtp_accounts enable row level security;
create policy "Users can manage their own campaign smtp accounts"
  on campaign_smtp_accounts for all using (
    exists (select 1 from campaigns where campaigns.id = campaign_smtp_accounts.campaign_id and campaigns.user_id = auth.uid())
  );

-- ============================================
-- SARA: Extend inbox_messages with classification
-- ============================================
alter table inbox_messages add column if not exists sara_intent text;
alter table inbox_messages add column if not exists sara_confidence real;
alter table inbox_messages add column if not exists sara_draft_reply text;
alter table inbox_messages add column if not exists sara_action text;
alter table inbox_messages add column if not exists sara_status text not null default 'pending_review';
alter table inbox_messages add column if not exists sara_reviewed_at timestamptz;
alter table inbox_messages add column if not exists sara_reviewed_by uuid references auth.users(id);

create index if not exists idx_inbox_sara_status on inbox_messages(sara_status);
create index if not exists idx_inbox_sara_intent on inbox_messages(sara_intent);

-- ============================================
-- DYNAMIC ASSETS: Template storage
-- ============================================
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
create policy "Users can manage their own asset templates"
  on asset_templates for all using (auth.uid() = user_id);

create trigger asset_templates_updated_at before update on asset_templates
  for each row execute function update_updated_at();
