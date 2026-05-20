"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult, Routine, RoutineExercise, Exercise } from "@/types/database";

// ── Routines ────────────────────────────────────────────────────

export async function getMyRoutines(): Promise<ActionResult<Routine[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .or(`trainer_id.eq.${user.id},client_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function getRoutineById(id: string): Promise<ActionResult<Routine & { exercises: (RoutineExercise & { exercise: Exercise })[] }>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("routines")
    .select("*, exercises:routine_exercises(*, exercise:exercises(*))")
    .eq("id", id)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function createRoutine(data: Pick<Routine, "name" | "description" | "client_id" | "is_template">): Promise<ActionResult<Routine>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data: routine, error } = await supabase
    .from("routines")
    .insert({ ...data, trainer_id: user.id })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: routine };
}

export async function updateRoutine(id: string, data: Partial<Pick<Routine, "name" | "description" | "client_id" | "is_template">>): Promise<ActionResult<Routine>> {
  const supabase = await createClient();

  const { data: routine, error } = await supabase
    .from("routines")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: routine };
}

export async function deleteRoutine(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("routines")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

// ── Routine Exercises ────────────────────────────────────────────

export async function addExerciseToRoutine(data: Pick<RoutineExercise, "routine_id" | "exercise_id" | "sets" | "reps" | "rest_time" | "order_index">): Promise<ActionResult<RoutineExercise>> {
  const supabase = await createClient();

  const { data: entry, error } = await supabase
    .from("routine_exercises")
    .insert(data)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: entry };
}

export async function updateRoutineExercise(id: string, data: Partial<Pick<RoutineExercise, "sets" | "reps" | "rest_time" | "order_index">>): Promise<ActionResult<RoutineExercise>> {
  const supabase = await createClient();

  const { data: entry, error } = await supabase
    .from("routine_exercises")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: entry };
}

export async function removeExerciseFromRoutine(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("routine_exercises")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

// ── Exercises (library) ─────────────────────────────────────────

export async function listExercises(): Promise<ActionResult<Exercise[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .order("name", { ascending: true });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function createExercise(data: Pick<Exercise, "name" | "description" | "muscle_group" | "equipment" | "difficulty">): Promise<ActionResult<Exercise>> {
  const supabase = await createClient();

  const { data: exercise, error } = await supabase
    .from("exercises")
    .insert(data)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: exercise };
}