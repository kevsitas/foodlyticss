"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult, Appointment } from "@/types/database";

export async function getMyAppointments(): Promise<ActionResult<Appointment[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .or(`professional_id.eq.${user.id},client_id.eq.${user.id}`)
    .order("date", { ascending: true })
    .order("time", { ascending: true });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function getUpcomingAppointments(): Promise<ActionResult<Appointment[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Not authenticated" };

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .or(`professional_id.eq.${user.id},client_id.eq.${user.id}`)
    .gte("date", today)
    .order("date", { ascending: true })
    .order("time", { ascending: true })
    .limit(10);

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function getAppointmentsByDate(date: string): Promise<ActionResult<Appointment[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("date", date)
    .or(`professional_id.eq.${user.id},client_id.eq.${user.id}`)
    .order("time", { ascending: true });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function createAppointment(data: Pick<Appointment, "professional_id" | "client_id" | "title" | "description" | "date" | "time" | "duration_minutes" | "type">): Promise<ActionResult<Appointment>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({ ...data, status: "scheduled" })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: appointment };
}

export async function updateAppointment(id: string, data: Partial<Pick<Appointment, "title" | "description" | "date" | "time" | "duration_minutes" | "status" | "type">>): Promise<ActionResult<Appointment>> {
  const supabase = await createClient();

  const { data: appointment, error } = await supabase
    .from("appointments")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: appointment };
}

export async function cancelAppointment(id: string): Promise<ActionResult<Appointment>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function completeAppointment(id: string): Promise<ActionResult<Appointment>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("appointments")
    .update({ status: "completed" })
    .eq("id", id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}