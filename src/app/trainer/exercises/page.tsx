import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Dumbbell, Plus, Search } from "lucide-react";
import { es } from "@/lib/i18n";

export default async function TrainerExercisesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; muscle_group?: string; difficulty?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const t = es.trainerExercises;
  const { q, muscle_group, difficulty } = await searchParams;

  let query = supabase
    .from("exercises")
    .select("*")
    .order("name", { ascending: true });

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }
  if (muscle_group) {
    query = query.eq("muscle_group", muscle_group);
  }
  if (difficulty) {
    query = query.eq("difficulty", difficulty);
  }

  const { data: exercises } = await query;

  // Get unique muscle groups for filter
  const { data: allExercises } = await supabase
    .from("exercises")
    .select("muscle_group");

  const muscleGroups = [...new Set((allExercises ?? []).map((e) => e.muscle_group).filter(Boolean))];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <Link
          href="/trainer/exercises/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {t.create}
        </Link>
      </div>

      {/* Filters */}
      <form className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder={t.namePlaceholder}
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          name="muscle_group"
          defaultValue={muscle_group ?? ""}
          className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">{t.allMuscleGroups}</option>
          {muscleGroups.map((mg) => (
            <option key={mg} value={mg!}>{mg}</option>
          ))}
        </select>
        <select
          name="difficulty"
          defaultValue={difficulty ?? ""}
          className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">{t.allDifficulties}</option>
          <option value="beginner">{t.beginner}</option>
          <option value="intermediate">{t.intermediate}</option>
          <option value="advanced">{t.advanced}</option>
        </select>
      </form>

      {/* Exercise grid */}
      {!exercises || exercises.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
          <Dumbbell className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{t.noExercises}</p>
          <p className="mt-1 text-xs text-muted-foreground/60">{t.noExercisesDesc}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exercises.map((exercise) => (
            <Link
              key={exercise.id}
              href={`/trainer/exercises/${exercise.id}`}
              className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elevated"
            >
              <div className="mb-3 flex items-start justify-between">
                <h3 className="font-medium">{exercise.name}</h3>
                {exercise.difficulty && (
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                    exercise.difficulty === "beginner"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : exercise.difficulty === "intermediate"
                      ? "bg-yellow-500/10 text-yellow-500"
                      : "bg-red-500/10 text-red-500"
                  }`}>
                    {exercise.difficulty === "beginner" ? t.beginner
                      : exercise.difficulty === "intermediate" ? t.intermediate
                      : t.advanced}
                  </span>
                )}
              </div>
              {exercise.description && (
                <p className="mb-3 text-xs text-muted-foreground line-clamp-2">{exercise.description}</p>
              )}
              <div className="flex gap-2">
                {exercise.muscle_group && (
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {exercise.muscle_group}
                  </span>
                )}
                {exercise.equipment && (
                  <span className="rounded-md bg-accent/50 px-2 py-0.5 text-xs text-muted-foreground">
                    {exercise.equipment}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}