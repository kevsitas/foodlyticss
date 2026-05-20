-- 002_fix_relationships.sql
-- Corrective migration: idempotent fixes for schema and RLS policies
-- Run AFTER 001_roles_schema.sql (mark 001 as applied via repair first)
--
-- Fixes:
--   1. CREATE TYPE user_role — wrapped in DO block (not idempotent in 001)
--   2. meals.meal_plan_id — column + FK added if table was pre-created without it
--   3. All RLS policies — dropped and recreated safely (CREATE POLICY is not idempotent)
--
-- Safe to run multiple times. Preserves existing data.
-- ── 1. Ensure enum type exists (CREATYPE TYPE has no IF NOT EXISTS) ──────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('client', 'nutritionist', 'trainer', 'admin');
  END IF;
END $$;

-- ── 2. Fix meals table: add meal_plan_id if missing ──────────────────────────
ALTER TABLE IF EXISTS meals ADD COLUMN IF NOT EXISTS meal_plan_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'meals'
      AND tc.constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE meals ADD CONSTRAINT fk_meals_meal_plan
      FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Safe NOT NULL: only succeeds if no rows have NULL in this column
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

-- ── 3. Drop all RLS policies (safe: IF EXISTS) before recreating ─────────────
-- Profiles
DROP POLICY IF EXISTS profiles_see_own ON profiles;
DROP POLICY IF EXISTS profiles_update_own ON profiles;
DROP POLICY IF EXISTS profiles_admin_all ON profiles;
DROP POLICY IF EXISTS professionals_view_profiles ON profiles;

-- Clients
DROP POLICY IF EXISTS clients_see_own ON clients;
DROP POLICY IF EXISTS clients_insert_own ON clients;
DROP POLICY IF EXISTS clients_update_own ON clients;
DROP POLICY IF EXISTS clients_professionals_select ON clients;

-- Nutritionists
DROP POLICY IF EXISTS nutritionists_see_own ON nutritionists;
DROP POLICY IF EXISTS nutritionists_insert_own ON nutritionists;
DROP POLICY IF EXISTS nutritionists_update_own ON nutritionists;
DROP POLICY IF EXISTS nutritionists_admin_all ON nutritionists;

-- Trainers
DROP POLICY IF EXISTS trainers_see_own ON trainers;
DROP POLICY IF EXISTS trainers_insert_own ON trainers;
DROP POLICY IF EXISTS trainers_update_own ON trainers;
DROP POLICY IF EXISTS trainers_admin_all ON trainers;

-- Meal Plans
DROP POLICY IF EXISTS meal_plans_nutritionist_all ON meal_plans;
DROP POLICY IF EXISTS meal_plans_client_select ON meal_plans;
DROP POLICY IF EXISTS meal_plans_admin_all ON meal_plans;

-- Meals
DROP POLICY IF EXISTS meals_select ON meals;
DROP POLICY IF EXISTS meals_nutritionist_all ON meals;

-- Exercises
DROP POLICY IF EXISTS exercises_select_all ON exercises;
DROP POLICY IF EXISTS exercises_insert_professionals ON exercises;
DROP POLICY IF EXISTS exercises_update_professionals ON exercises;

-- Routines
DROP POLICY IF EXISTS routines_trainer_all ON routines;
DROP POLICY IF EXISTS routines_client_select ON routines;
DROP POLICY IF EXISTS routines_admin_all ON routines;

-- Routine Exercises
DROP POLICY IF EXISTS routine_exercises_select ON routine_exercises;
DROP POLICY IF EXISTS routine_exercises_trainer_all ON routine_exercises;

-- Client Progress
DROP POLICY IF EXISTS progress_client_all ON client_progress;
DROP POLICY IF EXISTS progress_professionals_select ON client_progress;

-- Appointments
DROP POLICY IF EXISTS appointments_professional_all ON appointments;
DROP POLICY IF EXISTS appointments_client_select ON appointments;
DROP POLICY IF EXISTS appointments_admin_all ON appointments;

-- Messages
DROP POLICY IF EXISTS messages_select_participants ON messages;
DROP POLICY IF EXISTS messages_insert_auth ON messages;
DROP POLICY IF EXISTS messages_update_read ON messages;

-- Payments
DROP POLICY IF EXISTS payments_participants_select ON payments;
DROP POLICY IF EXISTS payments_admin_all ON payments;

-- Exercise Videos
DROP POLICY IF EXISTS exercise_videos_select_all ON exercise_videos;
DROP POLICY IF EXISTS exercise_videos_insert_professionals ON exercise_videos;

-- Recipes
DROP POLICY IF EXISTS recipes_nutritionist_all ON recipes;
DROP POLICY IF EXISTS recipes_select_all ON recipes;
DROP POLICY IF EXISTS recipes_admin_all ON recipes;

-- Subscriptions
DROP POLICY IF EXISTS subscriptions_participants_select ON subscriptions;
DROP POLICY IF EXISTS subscriptions_admin_all ON subscriptions;

-- ── 4. Recreate ALL RLS policies ──────────────────────────────────────────────
-- Profiles
CREATE POLICY profiles_see_own ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY profiles_admin_all ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY professionals_view_profiles ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('nutritionist', 'trainer', 'admin')
    )
  );

-- Clients
CREATE POLICY clients_see_own ON clients
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY clients_insert_own ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY clients_update_own ON clients
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY clients_professionals_select ON clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('nutritionist', 'trainer', 'admin')
    )
  );

-- Nutritionists
CREATE POLICY nutritionists_see_own ON nutritionists
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY nutritionists_insert_own ON nutritionists
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY nutritionists_update_own ON nutritionists
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY nutritionists_admin_all ON nutritionists
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Trainers
CREATE POLICY trainers_see_own ON trainers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY trainers_insert_own ON trainers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY trainers_update_own ON trainers
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY trainers_admin_all ON trainers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Meal Plans
CREATE POLICY meal_plans_nutritionist_all ON meal_plans
  FOR ALL USING (auth.uid() = nutritionist_id);
CREATE POLICY meal_plans_client_select ON meal_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE id = meal_plans.client_id AND user_id = auth.uid()
    )
  );
CREATE POLICY meal_plans_admin_all ON meal_plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Meals
CREATE POLICY meals_select ON meals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meal_plans
      WHERE id = meals.meal_plan_id
        AND (
          nutritionist_id = auth.uid()
          OR EXISTS (SELECT 1 FROM clients WHERE id = meal_plans.client_id AND user_id = auth.uid())
          OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        )
    )
  );
CREATE POLICY meals_nutritionist_all ON meals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM meal_plans WHERE id = meals.meal_plan_id AND nutritionist_id = auth.uid()
    )
  );

-- Exercises
CREATE POLICY exercises_select_all ON exercises
  FOR SELECT USING (true);
CREATE POLICY exercises_insert_professionals ON exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('trainer', 'nutritionist', 'admin')
    )
  );
CREATE POLICY exercises_update_professionals ON exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('trainer', 'nutritionist', 'admin')
    )
  );

-- Routines
CREATE POLICY routines_trainer_all ON routines
  FOR ALL USING (auth.uid() = trainer_id);
CREATE POLICY routines_client_select ON routines
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients WHERE id = routines.client_id AND user_id = auth.uid()
    )
  );
CREATE POLICY routines_admin_all ON routines
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Routine Exercises
CREATE POLICY routine_exercises_select ON routine_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM routines WHERE id = routine_exercises.routine_id
        AND (
          trainer_id = auth.uid()
          OR EXISTS (SELECT 1 FROM clients WHERE id = routines.client_id AND user_id = auth.uid())
          OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        )
    )
  );
CREATE POLICY routine_exercises_trainer_all ON routine_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM routines WHERE id = routine_exercises.routine_id AND trainer_id = auth.uid()
    )
  );

-- Client Progress
CREATE POLICY progress_client_all ON client_progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients WHERE id = client_progress.client_id AND user_id = auth.uid()
    )
  );
CREATE POLICY progress_professionals_select ON client_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('nutritionist', 'trainer', 'admin')
    )
  );

-- Appointments
CREATE POLICY appointments_professional_all ON appointments
  FOR ALL USING (auth.uid() = professional_id);
CREATE POLICY appointments_client_select ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients WHERE id = appointments.client_id AND user_id = auth.uid()
    )
  );
CREATE POLICY appointments_admin_all ON appointments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Messages
CREATE POLICY messages_select_participants ON messages
  FOR SELECT USING (auth.uid() IN (sender_id, receiver_id));
CREATE POLICY messages_insert_auth ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY messages_update_read ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Payments
CREATE POLICY payments_participants_select ON payments
  FOR SELECT USING (
    auth.uid() = professional_id
    OR EXISTS (SELECT 1 FROM clients WHERE id = payments.client_id AND user_id = auth.uid())
  );
CREATE POLICY payments_admin_all ON payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Exercise Videos
CREATE POLICY exercise_videos_select_all ON exercise_videos
  FOR SELECT USING (true);
CREATE POLICY exercise_videos_insert_professionals ON exercise_videos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('trainer', 'admin')
    )
  );

-- Recipes
CREATE POLICY recipes_nutritionist_all ON recipes
  FOR ALL USING (auth.uid() = nutritionist_id);
CREATE POLICY recipes_select_all ON recipes
  FOR SELECT USING (true);
CREATE POLICY recipes_admin_all ON recipes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Subscriptions
CREATE POLICY subscriptions_participants_select ON subscriptions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM clients WHERE id = subscriptions.client_id AND user_id = auth.uid())
    OR auth.uid() = subscriptions.professional_id
  );
CREATE POLICY subscriptions_admin_all ON subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );