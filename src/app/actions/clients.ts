"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult, Client } from "@/types/database";

export async function getMyClient(): Promise<ActionResult<Client>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return { success: false, error: error.message };
  if (!data) return { success: false, error: "Client record not found" };
  return { success: true, data };
}

export async function updateMyClient(data: Partial<Pick<Client, "age" | "sex" | "weight" | "height" | "goal" | "activity_level">>): Promise<ActionResult<Client>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data: client, error } = await supabase
    .from("clients")
    .update(data)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: client };
}

export async function getClientsForProfessional(): Promise<ActionResult<(Client & { profile: { full_name: string | null; avatar_url: string | null } })[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("clients")
    .select("*, profile:profiles!user_id(full_name, avatar_url)")
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function getClientById(clientId: string): Promise<ActionResult<Client & { profile: { full_name: string | null; avatar_url: string | null } }>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .select("*, profile:profiles!user_id(full_name, avatar_url)")
    .eq("id", clientId)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}