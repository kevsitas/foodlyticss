import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { es } from "@/lib/i18n";
import { ExerciseForm } from "../exercise-form";

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const { id } = await params;
  const t = es.trainerExercises;
  const isNew = id === "new";

  let exercise: any = null;
  let videos: any[] = [];

  if (!isNew) {
    const { data: ex } = await supabase
      .from("exercises")
      .select("*")
      .eq("id", id)
      .single();

    if (!ex) redirect("/trainer/exercises");
    exercise = ex;

    const { data: vids } = await supabase
      .from("exercise_videos")
      .select("*")
      .eq("exercise_id", id)
      .order("created_at", { ascending: false });

    videos = vids ?? [];
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {isNew ? t.create : t.edit}
        </h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <ExerciseForm exercise={exercise} videos={videos} t={t} />
      </div>
    </div>
  );
}