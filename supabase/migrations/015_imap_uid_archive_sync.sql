-- ============================================================================
-- Migration 015: Store IMAP UID for two-way archive sync
-- ============================================================================

-- Add IMAP UID + folder so we can issue IMAP move/archive commands later
ALTER TABLE inbox_messages
  ADD COLUMN IF NOT EXISTS imap_uid      INTEGER,
  ADD COLUMN IF NOT EXISTS imap_folder   TEXT DEFAULT 'INBOX';

CREATE INDEX IF NOT EXISTS idx_inbox_imap_uid
  ON inbox_messages(smtp_account_id, imap_uid)
  WHERE imap_uid IS NOT NULL;
