-- 001_roles_schema.sql
-- Database schema for Foodlytics
-- Run this in your Supabase SQL Editor

-- ── 1. Enum ──────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('client', 'nutritionist', 'trainer', 'admin');

-- ── 2. Profiles ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  phone       text,
  avatar_url  text,
  role        user_role NOT NULL DEFAULT 'client',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Auto-create profile on user signup via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(
      (NEW.raw_user_meta_data ->> 'role')::user_role,
      'client'::user_role
    )
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 3. Clients ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  age            integer,
  sex            text,
  weight         numeric(5,2),
  height         numeric(5,2),
  goal           text,
  activity_level text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- ── 4. Nutritionists ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nutritionists (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  specialty       text,
  license_number  text,
  experience_years integer,
  bio             text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ── 5. Trainers ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trainers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  specialty       text,
  certifications  text,
  experience_years integer,
  bio             text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ── 6. Meal Plans ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meal_plans (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id      uuid REFERENCES clients(id) ON DELETE SET NULL,
  name           text NOT NULL,
  description    text,
  daily_calories integer,
  is_template    boolean DEFAULT false,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- ── 7. Meals ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id uuid REFERENCES meal_plans(id) ON DELETE CASCADE NOT NULL,
  meal_type   text NOT NULL,
  name        text NOT NULL,
  description text,
  calories    integer,
  protein     numeric(5,1),
  carbs       numeric(5,1),
  fat         numeric(5,1),
  time        time,
  created_at  timestamptz DEFAULT now()
);

-- ── 8. Exercises ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exercises (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  description  text,
  muscle_group text,
  equipment    text,
  difficulty   text,
  created_at   timestamptz DEFAULT now()
);

-- ── 9. Training Routines ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS routines (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id  uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id   uuid REFERENCES clients(id) ON DELETE SET NULL,
  name        text NOT NULL,
  description text,
  is_template boolean DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- ── 10. Routine Exercises ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS routine_exercises (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id  uuid REFERENCES routines(id) ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  sets        integer,
  reps        integer,
  rest_time   text,
  order_index integer NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- ── 11. Client Progress ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_progress (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  weight      numeric(5,2),
  body_fat    numeric(5,2),
  chest       numeric(5,2),
  waist       numeric(5,2),
  hips        numeric(5,2),
  arm         numeric(5,2),
  thigh       numeric(5,2),
  notes       text,
  photo_url   text,
  recorded_at date DEFAULT CURRENT_DATE,
  created_at  timestamptz DEFAULT now()
);

-- ── 12. Appointments ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id       uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  title           text NOT NULL,
  description     text,
  date            date NOT NULL,
  time            time NOT NULL,
  duration_minutes integer DEFAULT 30,
  status          text DEFAULT 'scheduled',
  type            text NOT NULL,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ── 13. Messages ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content     text NOT NULL,
  read        boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- ── 14. Payments ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id       uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  amount          numeric(10,2) NOT NULL,
  currency        text DEFAULT 'MXN',
  status          text DEFAULT 'pending',
  payment_date    timestamptz,
  due_date        date,
  description     text,
  created_at      timestamptz DEFAULT now()
);

-- ── 15. Exercise Videos ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exercise_videos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  title       text NOT NULL,
  video_url   text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- ── 16. Recipes ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recipes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name            text NOT NULL,
  description     text,
  ingredients     jsonb,
  instructions    text,
  calories        integer,
  protein         numeric(5,1),
  carbs           numeric(5,1),
  fat             numeric(5,1),
  created_at      timestamptz DEFAULT now()
);

-- ── 17. Subscriptions ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  professional_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan_name       text NOT NULL,
  amount          numeric(10,2) NOT NULL,
  currency        text DEFAULT 'MXN',
  status          text DEFAULT 'active',
  start_date      date NOT NULL,
  end_date        date,
  created_at      timestamptz DEFAULT now()
);

-- ── Indexes ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_professional ON appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_messages_participants ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_client_progress_client_date ON client_progress(client_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_meal_plans_nutritionist ON meal_plans(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_client ON meal_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_routines_trainer ON routines(trainer_id);
CREATE INDEX IF NOT EXISTS idx_payments_professional ON payments(professional_id);

-- ── RLS ──────────────────────────────────────────────────────────
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutritionists     ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans        ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals             ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises         ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines          ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_progress   ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_videos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions     ENABLE ROW LEVEL SECURITY;

-- ── Profiles ─────────────────────────────────────────────────────
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

-- ── Clients ──────────────────────────────────────────────────────
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

-- ── Nutritionists ────────────────────────────────────────────────
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

-- ── Trainers ─────────────────────────────────────────────────────
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

-- ── Meal Plans ───────────────────────────────────────────────────
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

-- ── Meals ────────────────────────────────────────────────────────
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

-- ── Exercises ────────────────────────────────────────────────────
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

-- ── Routines ─────────────────────────────────────────────────────
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

-- ── Routine Exercises ────────────────────────────────────────────
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

-- ── Client Progress ──────────────────────────────────────────────
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

-- ── Appointments ─────────────────────────────────────────────────
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

-- ── Messages ─────────────────────────────────────────────────────
CREATE POLICY messages_select_participants ON messages
  FOR SELECT USING (auth.uid() IN (sender_id, receiver_id));
CREATE POLICY messages_insert_auth ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY messages_update_read ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- ── Payments ─────────────────────────────────────────────────────
CREATE POLICY payments_participants_select ON payments
  FOR SELECT USING (
    auth.uid() = professional_id
    OR EXISTS (SELECT 1 FROM clients WHERE id = payments.client_id AND user_id = auth.uid())
  );
CREATE POLICY payments_admin_all ON payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── Exercise Videos ──────────────────────────────────────────────
CREATE POLICY exercise_videos_select_all ON exercise_videos
  FOR SELECT USING (true);
CREATE POLICY exercise_videos_insert_professionals ON exercise_videos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('trainer', 'admin')
    )
  );

-- ── Recipes ──────────────────────────────────────────────────────
CREATE POLICY recipes_nutritionist_all ON recipes
  FOR ALL USING (auth.uid() = nutritionist_id);
CREATE POLICY recipes_select_all ON recipes
  FOR SELECT USING (true);
CREATE POLICY recipes_admin_all ON recipes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── Subscriptions ────────────────────────────────────────────────
CREATE POLICY subscriptions_participants_select ON subscriptions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM clients WHERE id = subscriptions.client_id AND user_id = auth.uid())
    OR auth.uid() = subscriptions.professional_id
  );
CREATE POLICY subscriptions_admin_all ON subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── updated_at trigger function & triggers ───────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER nutritionists_updated_at
  BEFORE UPDATE ON nutritionists FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trainers_updated_at
  BEFORE UPDATE ON trainers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER meal_plans_updated_at
  BEFORE UPDATE ON meal_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER routines_updated_at
  BEFORE UPDATE ON routines FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();