"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult, Trainer } from "@/types/database";

export async function getMyTrainer(): Promise<ActionResult<Trainer>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("trainers")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return { success: false, error: error.message };
  if (!data) return { success: false, error: "Trainer record not found" };
  return { success: true, data };
}

export async function updateMyTrainer(data: Partial<Pick<Trainer, "specialty" | "certifications" | "experience_years" | "bio">>): Promise<ActionResult<Trainer>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data: trainer, error } = await supabase
    .from("trainers")
    .update(data)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: trainer };
}

export async function listTrainers(): Promise<ActionResult<Trainer[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trainers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}