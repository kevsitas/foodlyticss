-- 000_fix_existing_tables.sql
-- Pre-migration fix: ensures existing tables have all required columns
-- Runs BEFORE 001_roles_schema.sql so that CREATE POLICY does not fail.
-- Safe to run multiple times. Preserves existing data.

-- ── Fix meals table: add meal_plan_id column + FK if missing ──────────────
ALTER TABLE IF EXISTS meals ADD COLUMN IF NOT EXISTS meal_plan_id uuid;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'meals'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'meals'
      AND tc.constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE meals ADD CONSTRAINT fk_meals_meal_plan
      FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Safe NOT NULL: only if no existing rows have NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'meals'
      AND column_name = 'meal_plan_id'
      AND is_nullable = 'YES'
  ) AND NOT EXISTS (
    SELECT 1 FROM meals WHERE meal_plan_id IS NULL
  ) THEN
    ALTER TABLE meals ALTER COLUMN meal_plan_id SET NOT NULL;
  END IF;
END $$;