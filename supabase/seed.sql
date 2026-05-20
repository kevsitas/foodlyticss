-- Seed data for Foodlytics
-- Run after applying the migration. Note: profile records are created
-- automatically via the on_auth_user_created trigger when users sign up.
-- This seed creates auth users, then manually inserts additional data.

-- ── Helper: create auth user + auto-profile ─────────────────────
-- These are handled by the app signup flow. For manual seed, create
-- auth users via the Supabase dashboard or API.

-- ── Sample exercises ────────────────────────────────────────────
INSERT INTO exercises (name, description, muscle_group, equipment, difficulty) VALUES
  ('Sentadilla', 'Ejercicio compuesto para piernas y glúteos', 'piernas', 'barra', 'intermedio'),
  ('Press de banca', 'Ejercicio de empuje para pecho', 'pecho', 'barra', 'intermedio'),
  ('Peso muerto', 'Ejercicio compuesto para espalda baja y piernas', 'espalda', 'barra', 'avanzado'),
  ('Dominadas', 'Ejercicio de tracción para espalda', 'espalda', 'barra', 'intermedio'),
  ('Press militar', 'Ejercicio de empuje para hombros', 'hombros', 'mancuernas', 'intermedio'),
  ('Remo con barra', 'Ejercicio de tracción para espalda', 'espalda', 'barra', 'intermedio'),
  ('Curl de bíceps', 'Ejercicio de aislamiento para bíceps', 'brazos', 'mancuernas', 'principiante'),
  ('Fondos en paralelas', 'Ejercicio compuesto para tríceps y pecho', 'brazos', 'paralelas', 'intermedio'),
  ('Plancha', 'Ejercicio isométrico para core', 'core', 'ninguno', 'principiante'),
  ('Zancadas', 'Ejercicio unilateral para piernas', 'piernas', 'mancuernas', 'principiante'),
  ('Remo con mancuerna', 'Ejercicio unilateral para espalda', 'espalda', 'mancuerna', 'intermedio'),
  ('Elevaciones laterales', 'Ejercicio de aislamiento para hombros', 'hombros', 'mancuernas', 'principiante'),
  ('Press francés', 'Ejercicio de aislamiento para tríceps', 'brazos', 'barra', 'intermedio'),
  ('Peso muerto rumano', 'Ejercicio de cadena posterior', 'piernas', 'mancuernas', 'intermedio'),
  ('Mountain climbers', 'Ejercicio cardiovascular', 'core', 'ninguno', 'principiante')
ON CONFLICT DO NOTHING;

-- ── Sample recipes ──────────────────────────────────────────────
-- Note: these reference a nutritionist profile ID that must exist.
-- They are commented out because the nutritionist ID depends on auth.
-- Uncomment and replace the nutritionist_id after creating a nutritionist user.
--
-- INSERT INTO recipes (nutritionist_id, name, description, ingredients, instructions, calories, protein, carbs, fat) VALUES
--   ('<REPLACE_WITH_NUTRITIONIST_UUID>', 'Bowl de quinoa y pollo',
--     'Quinoa con pechuga de pollo, verduras y aderezo de limón',
--     '[{"name": "quinoa", "amount": "1 taza"}, {"name": "pollo", "amount": "200g"}, {"name": "brócoli", "amount": "1 taza"}, {"name": "limón", "amount": "1"}]',
--     '1. Cocina la quinoa. 2. Asa el pollo. 3. Mezcla todo. 4. Añade limón.',
--     450, 35, 50, 12);

-- ── Verify installation ─────────────────────────────────────────
-- Run these queries to confirm everything is set up:
--
-- SELECT 'tables' AS check, count(*) FROM information_schema.tables
--   WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
--
-- SELECT 'policies' AS check, count(*) FROM pg_policies
--   WHERE schemaname = 'public';