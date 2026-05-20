"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult, ExerciseVideo } from "@/types/database";

export async function getExerciseVideos(exerciseId: string): Promise<ActionResult<ExerciseVideo[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exercise_videos")
    .select("*")
    .eq("exercise_id", exerciseId)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function createExerciseVideo(data: Pick<ExerciseVideo, "exercise_id" | "title" | "video_url">): Promise<ActionResult<ExerciseVideo>> {
  const supabase = await createClient();

  const { data: video, error } = await supabase
    .from("exercise_videos")
    .insert(data)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: video };
}

export async function deleteExerciseVideo(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("exercise_videos")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}