"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult, Recipe } from "@/types/database";

export async function getMyRecipes(): Promise<ActionResult<Recipe[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("nutritionist_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function getRecipeById(id: string): Promise<ActionResult<Recipe>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function createRecipe(
  data: Pick<Recipe, "name" | "description" | "instructions" | "calories" | "protein" | "carbs" | "fat"> & { ingredients: any },
): Promise<ActionResult<Recipe>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data: recipe, error } = await supabase
    .from("recipes")
    .insert({ ...data, nutritionist_id: user.id })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: recipe };
}

export async function updateRecipe(
  id: string,
  data: Partial<Pick<Recipe, "name" | "description" | "instructions" | "calories" | "protein" | "carbs" | "fat"> & { ingredients: any }>,
): Promise<ActionResult<Recipe>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data: recipe, error } = await supabase
    .from("recipes")
    .update(data)
    .eq("id", id)
    .eq("nutritionist_id", user.id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: recipe };
}

export async function deleteRecipe(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", id)
    .eq("nutritionist_id", user.id);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}