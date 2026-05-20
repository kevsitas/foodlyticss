"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/database";

export async function getMyPayments(): Promise<ActionResult<any[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("payments")
    .select("*, client:clients!client_id(user_id, profile:profiles!user_id(full_name))")
    .eq("professional_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function getClientPayments(clientId: string): Promise<ActionResult<any[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("client_id", clientId)
    .eq("professional_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function getPaymentStats(): Promise<ActionResult<{ total: number; count: number; thisMonth: number }>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data: payments, error } = await supabase
    .from("payments")
    .select("amount, status, payment_date")
    .eq("professional_id", user.id);

  if (error) return { success: false, error: error.message };

  const total = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
  const count = payments?.length ?? 0;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thisMonth = (payments ?? [])
    .filter((p) => p.status === "completed" && p.payment_date && p.payment_date >= startOfMonth)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return { success: true, data: { total, count, thisMonth } };
}