"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult, MealPlan, Meal } from "@/types/database";

// ── Meal Plans ──────────────────────────────────────────────────

export async function getMyMealPlans(): Promise<ActionResult<MealPlan[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("meal_plans")
    .select("*")
    .or(`nutritionist_id.eq.${user.id},client_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function getMealPlanById(id: string): Promise<ActionResult<MealPlan & { meals: Meal[] }>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("meal_plans")
    .select("*, meals(*)")
    .eq("id", id)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function getMyTemplates(): Promise<ActionResult<MealPlan[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("nutritionist_id", user.id)
    .eq("is_template", true)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function createMealPlan(data: Pick<MealPlan, "name" | "description" | "daily_calories" | "client_id" | "is_template">): Promise<ActionResult<MealPlan>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data: plan, error } = await supabase
    .from("meal_plans")
    .insert({ ...data, nutritionist_id: user.id })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: plan };
}

export async function updateMealPlan(id: string, data: Partial<Pick<MealPlan, "name" | "description" | "daily_calories" | "client_id" | "is_template">>): Promise<ActionResult<MealPlan>> {
  const supabase = await createClient();

  const { data: plan, error } = await supabase
    .from("meal_plans")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: plan };
}

export async function deleteMealPlan(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("meal_plans")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

// ── Meals ────────────────────────────────────────────────────────

export async function getMeals(mealPlanId: string): Promise<ActionResult<Meal[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("meals")
    .select("*")
    .eq("meal_plan_id", mealPlanId)
    .order("time", { ascending: true });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function createMeal(data: Pick<Meal, "meal_plan_id" | "meal_type" | "name" | "description" | "calories" | "protein" | "carbs" | "fat" | "time">): Promise<ActionResult<Meal>> {
  const supabase = await createClient();

  const { data: meal, error } = await supabase
    .from("meals")
    .insert(data)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: meal };
}

export async function deleteMeal(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("meals")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

export async function getTodayMeals(): Promise<ActionResult<(Meal & { meal_plan: Pick<MealPlan, "name"> })[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Not authenticated" };

  // Get today's meals from the client's assigned active meal plan
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!client) return { success: true, data: [] };

  const { data: activePlan } = await supabase
    .from("meal_plans")
    .select("id, name")
    .eq("client_id", client.id)
    .eq("is_template", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!activePlan) return { success: true, data: [] };

  const { data, error } = await supabase
    .from("meals")
    .select("*, meal_plan:meal_plans!inner(name)")
    .eq("meal_plan_id", activePlan.id)
    .order("time", { ascending: true });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}