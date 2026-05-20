import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Dumbbell } from "lucide-react";
import { es } from "@/lib/i18n";

export default async function ClientRoutinesPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const t = es.clientRoutines;

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  let routines: any[] = [];

  if (client) {
    const { data: routinesData } = await supabase
      .from("routines")
      .select("*, trainer:profiles!trainer_id(full_name)")
      .eq("client_id", client.id)
      .eq("is_template", false)
      .order("created_at", { ascending: false });

    if (routinesData && routinesData.length > 0) {
      // Get exercises for each routine
      const routineIds = routinesData.map((r) => r.id);
      const { data: routineExercises } = await supabase
        .from("routine_exercises")
        .select("*, exercise:exercises(*)")
        .in("routine_id", routineIds)
        .order("order_index", { ascending: true });

      routines = routinesData.map((routine) => ({
        ...routine,
        exercises: (routineExercises ?? []).filter((re) => re.routine_id === routine.id),
      }));
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      {routines.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
          <Dumbbell className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{t.noRoutines}</p>
          <p className="mt-1 text-xs text-muted-foreground/60">{t.noRoutinesDesc}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {routines.map((routine) => (
            <div key={routine.id} className="rounded-xl border border-border bg-card">
              <div className="border-b border-border px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{routine.name}</h2>
                    {routine.description && (
                      <p className="text-sm text-muted-foreground">{routine.description}</p>
                    )}
                  </div>
                  {routine.trainer && (
                    <p className="text-sm text-muted-foreground">
                      {t.assignedBy} {routine.trainer.full_name || "Entrenador"}
                    </p>
                  )}
                </div>
              </div>

              {routine.exercises.length > 0 ? (
                <div className="divide-y divide-border">
                  {routine.exercises.map((re: any) => (
                    <div key={re.id} className="flex items-center justify-between px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Dumbbell className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{re.exercise?.name || "Ejercicio"}</p>
                          {re.exercise?.description && (
                            <p className="text-xs text-muted-foreground">{re.exercise.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        {re.sets != null && (
                          <div className="text-center">
                            <p className="font-medium">{re.sets}</p>
                            <p className="text-xs text-muted-foreground">{t.sets}</p>
                          </div>
                        )}
                        {re.reps != null && (
                          <div className="text-center">
                            <p className="font-medium">{re.reps}</p>
                            <p className="text-xs text-muted-foreground">{t.reps}</p>
                          </div>
                        )}
                        {re.rest_time && (
                          <div className="text-center">
                            <p className="font-medium">{re.rest_time}</p>
                            <p className="text-xs text-muted-foreground">{t.rest}</p>
                          </div>
                        )}
                        {re.exercise?.muscle_group && (
                          <div className="text-center">
                            <p className="text-xs capitalize text-muted-foreground">{re.exercise.muscle_group}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <Dumbbell className="mb-2 h-6 w-6 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Esta rutina no tiene ejercicios registrados.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}