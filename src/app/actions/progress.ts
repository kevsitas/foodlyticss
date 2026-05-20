"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult, ClientProgress } from "@/types/database";

export async function getMyProgress(): Promise<ActionResult<ClientProgress[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!client) return { success: true, data: [] };

  const { data, error } = await supabase
    .from("client_progress")
    .select("*")
    .eq("client_id", client.id)
    .order("recorded_at", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function getClientProgress(clientId: string): Promise<ActionResult<ClientProgress[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("client_progress")
    .select("*")
    .eq("client_id", clientId)
    .order("recorded_at", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function createProgressEntry(data: Pick<ClientProgress, "client_id" | "weight" | "body_fat" | "chest" | "waist" | "hips" | "arm" | "thigh" | "notes" | "recorded_at">): Promise<ActionResult<ClientProgress>> {
  const supabase = await createClient();

  const { data: entry, error } = await supabase
    .from("client_progress")
    .insert(data)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: entry };
}

export async function deleteProgressEntry(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("client_progress")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}