import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, ClipboardList, Dumbbell, Calendar } from "lucide-react";
import { es } from "@/lib/i18n";
import { completeOnboarding } from "@/app/actions/profiles";

export default async function TrainerDashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  const user = data.user;
  const t = es.trainerDashboard;

  // Ensure role-specific record exists
  await completeOnboarding();

  // Count clients (all clients are visible to trainers via RLS)
  const { count: clientCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true });

  // Count routines created by this trainer
  const { count: routineCount } = await supabase
    .from("routines")
    .select("*", { count: "exact", head: true })
    .eq("trainer_id", user.id);

  // Count active routines (assigned to a client, non-template)
  const { count: activeRoutineCount } = await supabase
    .from("routines")
    .select("*", { count: "exact", head: true })
    .eq("trainer_id", user.id)
    .not("client_id", "is", null)
    .eq("is_template", false);

  // Count exercises in the library
  const { count: exerciseCount } = await supabase
    .from("exercises")
    .select("*", { count: "exact", head: true });

  // Count upcoming appointments for this trainer (today and future)
  const today = new Date().toISOString().split("T")[0];
  const { count: appointmentCount } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("professional_id", user.id)
    .gte("date", today);

  // Get today's sessions
  const { data: todaySessions } = await supabase
    .from("appointments")
    .select("*")
    .eq("professional_id", user.id)
    .eq("date", today)
    .order("time", { ascending: true })
    .limit(10);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          {t.welcome}, {user.user_metadata?.full_name || "Entrenador"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t.subtitle}
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elevated">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t.activeClients}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">{clientCount ?? 0}</div>
          <div className="mt-1 text-xs text-muted-foreground">{t.awaitingAssignment}</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elevated">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t.activeRoutines}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <ClipboardList className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">{activeRoutineCount ?? 0}</div>
          <div className="mt-1 text-xs text-muted-foreground">{t.assignedToClients}</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elevated">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t.exercises}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
              <Dumbbell className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">{exerciseCount ?? 0}</div>
          <div className="mt-1 text-xs text-muted-foreground">{t.inLibrary}</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elevated">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t.appointments}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">{appointmentCount ?? 0}</div>
          <div className="mt-1 text-xs text-muted-foreground">{t.upcomingWeek}</div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's sessions */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t.todaysSessions}</h2>
          {todaySessions && todaySessions.length > 0 ? (
            <div className="space-y-3">
              {todaySessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between rounded-lg bg-background px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{session.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.time?.slice(0, 5)} · {session.duration_minutes} min
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    session.status === "scheduled"
                      ? "bg-blue-500/10 text-blue-500"
                      : session.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-red-500/10 text-red-500"
                  }`}>
                    {session.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Dumbbell className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{t.noSessions}</p>
              <p className="text-xs text-muted-foreground/60">
                {t.noSessionsDesc}
              </p>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t.quickActions}</h2>
          <div className="space-y-3">
            <button className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-accent">
              <ClipboardList className="h-4 w-4 text-primary" />
              {t.createRoutine}
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-accent">
              <Calendar className="h-4 w-4 text-primary" />
              {t.scheduleSession}
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-accent">
              <Dumbbell className="h-4 w-4 text-primary" />
              {t.manageExercises}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}