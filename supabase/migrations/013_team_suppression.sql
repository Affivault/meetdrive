-- ============================================================
-- Migration 013: Team / Multi-user + Suppression List
-- ============================================================

-- Suppression list
CREATE TABLE IF NOT EXISTS suppression_list (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  reason      TEXT NOT NULL DEFAULT 'manual' CHECK (reason IN ('unsubscribed', 'bounced', 'complained', 'manual')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, email)
);
CREATE INDEX IF NOT EXISTS idx_suppression_user ON suppression_list (user_id);

-- Organisations
CREATE TABLE IF NOT EXISTS organizations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  owner_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations (owner_id);

-- Team members
CREATE TABLE IF NOT EXISTS team_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id, user_id),
  UNIQUE (org_id, email)
);
CREATE INDEX IF NOT EXISTS idx_team_members_org ON team_members (org_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members (user_id);

-- Team invites
CREATE TABLE IF NOT EXISTS team_invites (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  token        TEXT NOT NULL UNIQUE,
  invited_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at   TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id, email)
);
CREATE INDEX IF NOT EXISTS idx_team_invites_org ON team_invites (org_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_token ON team_invites (token);

-- body_html_b for A/B body testing
ALTER TABLE campaign_steps ADD COLUMN IF NOT EXISTS body_html_b TEXT;
