-- 003_verification_schema.sql
-- Verification system for professional roles (nutritionist, trainer)

-- ── 1. Verification Status Enum ─────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── 2. Verification Requests Table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS verification_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role            user_role NOT NULL,
  document_urls   text[] NOT NULL DEFAULT '{}',
  status          verification_status NOT NULL DEFAULT 'pending',
  admin_notes     text,
  reviewed_by     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at     timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verification_requests_user ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_reviewed_by ON verification_requests(reviewed_by);

-- ── 3. RLS ──────────────────────────────────────────────────────────
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- Users can see their own requests
CREATE POLICY verification_requests_select_own ON verification_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own requests
CREATE POLICY verification_requests_insert_own ON verification_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own requests
CREATE POLICY verification_requests_update_own ON verification_requests
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY verification_requests_admin_all ON verification_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── 4. updated_at trigger ──────────────────────────────────────────
CREATE TRIGGER verification_requests_updated_at
  BEFORE UPDATE ON verification_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();