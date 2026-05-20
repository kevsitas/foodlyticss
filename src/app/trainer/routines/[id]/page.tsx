import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { es } from "@/lib/i18n";
import { RoutineForm } from "../routine-form";

export default async function RoutineDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ client?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const { id } = await params;
  const { client: preselectedClient } = await searchParams;
  const t = es.trainerRoutines;
  const isNew = id === "new";

  // Fetch routine if editing
  let routine: any = null;
  if (!isNew) {
    const { data } = await supabase
      .from("routines")
      .select("*, exercises:routine_exercises(*, exercise:exercises(*))")
      .eq("id", id)
      .single();

    if (!data) redirect("/trainer/routines");
    routine = data;
  }

  // Fetch clients for assignment
  const { data: clients } = await supabase
    .from("clients")
    .select("id, user_id, profile:profiles!user_id(full_name)")
    .order("created_at", { ascending: false });

  // Fetch exercises for the exercise selector
  const { data: exercises } = await supabase
    .from("exercises")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {isNew ? t.create : t.edit}
        </h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="mx-auto max-w-3xl">
        <RoutineForm
          routine={routine}
          clients={clients ?? []}
          exercises={exercises ?? []}
          preselectedClient={preselectedClient ?? null}
          t={t}
        />
      </div>
    </div>
  );
}