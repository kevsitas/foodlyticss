export type UserRole = "client" | "nutritionist" | "trainer" | "admin";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  age: number | null;
  sex: string | null;
  weight: number | null;
  height: number | null;
  goal: string | null;
  activity_level: string | null;
  created_at: string;
  updated_at: string;
}

export interface Nutritionist {
  id: string;
  user_id: string;
  specialty: string | null;
  license_number: string | null;
  experience_years: number | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trainer {
  id: string;
  user_id: string;
  specialty: string | null;
  certifications: string | null;
  experience_years: number | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface MealPlan {
  id: string;
  nutritionist_id: string;
  client_id: string | null;
  name: string;
  description: string | null;
  daily_calories: number | null;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface Meal {
  id: string;
  meal_plan_id: string;
  meal_type: string;
  name: string;
  description: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  time: string | null;
  created_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  muscle_group: string | null;
  equipment: string | null;
  difficulty: string | null;
  created_at: string;
}

export interface Routine {
  id: string;
  trainer_id: string;
  client_id: string | null;
  name: string;
  description: string | null;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoutineExercise {
  id: string;
  routine_id: string;
  exercise_id: string;
  sets: number | null;
  reps: number | null;
  rest_time: string | null;
  order_index: number;
  created_at: string;
}

export interface ClientProgress {
  id: string;
  client_id: string;
  weight: number | null;
  body_fat: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  arm: number | null;
  thigh: number | null;
  notes: string | null;
  photo_url: string | null;
  recorded_at: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  professional_id: string;
  client_id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  duration_minutes: number;
  status: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  professional_id: string;
  client_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_date: string;
  due_date: string | null;
  description: string | null;
  created_at: string;
}

export interface ExerciseVideo {
  id: string;
  exercise_id: string;
  title: string;
  video_url: string;
  created_at: string;
}

export interface Recipe {
  id: string;
  nutritionist_id: string;
  name: string;
  description: string | null;
  ingredients: Record<string, unknown> | null;
  instructions: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  client_id: string;
  professional_id: string;
  plan_name: string;
  amount: number;
  currency: string;
  status: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
}

// ── Action result types ──────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/** Non-discriminated variant for useActionState forms */
export type FormState = { success: boolean; error: string; message?: string };

// ── Dashboard query results ──────────────────────────────────────

export interface ClientDashboardData {
  todayCalories: number;
  todayProtein: number;
  todayCarbs: number;
  todayFat: number;
  mealsToday: number;
  calorieGoal: number;
  recentMeals: (Meal & { meal_plan_name: string })[];
}

export interface NutritionistDashboardData {
  clientCount: number;
  mealPlanCount: number;
  activePlanCount: number;
  appointmentCount: number;
  upcomingAppointments: Appointment[];
  recentClients: (Client & { profile: Pick<Profile, "full_name" | "avatar_url"> })[];
  monthlyRevenue: number;
}

export interface TrainerDashboardData {
  clientCount: number;
  routineCount: number;
  activeRoutineCount: number;
  exerciseCount: number;
  appointmentCount: number;
  todaySessions: Appointment[];
}

export interface AdminDashboardData {
  totalUsers: number;
  activeToday: number;
  totalMeals: number;
  totalRevenue: number;
  recentProfiles: Profile[];
  usersByRole: { role: string; count: number }[];
}