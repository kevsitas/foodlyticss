"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult, Profile } from "@/types/database";

export async function getProfile(): Promise<ActionResult<Profile>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function updateProfile(data: Partial<Pick<Profile, "full_name" | "phone" | "avatar_url">>): Promise<ActionResult<Profile>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", user.id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: profile };
}

export async function getProfileById(userId: string): Promise<ActionResult<Profile>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function listProfilesByRole(role: Profile["role"]): Promise<ActionResult<Profile[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", role)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function completeOnboarding(): Promise<ActionResult<{ created: boolean }>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const role = (user.user_metadata?.role || "client") as Profile["role"];

  // Check if role-specific record already exists
  if (role === "client") {
    const { data: existing } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) return { success: true, data: { created: false } };

    const { error: insertError } = await supabase
      .from("clients")
      .insert({ user_id: user.id });

    if (insertError) return { success: false, error: insertError.message };
    return { success: true, data: { created: true } };
  }

  if (role === "nutritionist") {
    const { data: existing } = await supabase
      .from("nutritionists")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) return { success: true, data: { created: false } };

    const { error: insertError } = await supabase
      .from("nutritionists")
      .insert({ user_id: user.id });

    if (insertError) return { success: false, error: insertError.message };
    return { success: true, data: { created: true } };
  }

  if (role === "trainer") {
    const { data: existing } = await supabase
      .from("trainers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) return { success: true, data: { created: false } };

    const { error: insertError } = await supabase
      .from("trainers")
      .insert({ user_id: user.id });

    if (insertError) return { success: false, error: insertError.message };
    return { success: true, data: { created: true } };
  }

  return { success: true, data: { created: false } };
}