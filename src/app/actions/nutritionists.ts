"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult, Nutritionist } from "@/types/database";

export async function getMyNutritionist(): Promise<ActionResult<Nutritionist>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("nutritionists")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return { success: false, error: error.message };
  if (!data) return { success: false, error: "Nutritionist record not found" };
  return { success: true, data };
}

export async function updateMyNutritionist(data: Partial<Pick<Nutritionist, "specialty" | "license_number" | "experience_years" | "bio">>): Promise<ActionResult<Nutritionist>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data: nutritionist, error } = await supabase
    .from("nutritionists")
    .update(data)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: nutritionist };
}

export async function listNutritionists(): Promise<ActionResult<Nutritionist[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("nutritionists")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}