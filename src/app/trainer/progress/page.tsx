import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Activity, TrendingUp, Users, Ruler } from "lucide-react";
import { es } from "@/lib/i18n";

export default async function TrainerProgressPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const t = es.trainerProgress;

  // Get all clients with their latest progress
  const { data: clients } = await supabase
    .from("clients")
    .select("id, profile:profiles!user_id(full_name)")
    .order("created_at", { ascending: false });

  const clientIds = (clients ?? []).map((c) => c.id);

  // Get latest progress entry for each client
  let clientProgress: any[] = [];
  if (clientIds.length > 0) {
    const { data: latestProgress } = await supabase
      .from("client_progress")
      .select("*, client:clients!client_id(id, profile:profiles!user_id(full_name))")
      .in("client_id", clientIds)
      .order("recorded_at", { ascending: false });

    // Get only the latest entry per client
    const seen = new Set<string>();
    for (const entry of latestProgress ?? []) {
      if (!seen.has(entry.client_id)) {
        seen.add(entry.client_id);
        clientProgress.push(entry);
      }
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      {clientProgress.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
          <Activity className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{t.noData}</p>
          <p className="mt-1 text-xs text-muted-foreground/60">{t.noDataDesc}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {clientProgress.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  {entry.client?.profile?.full_name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="text-sm font-medium">{entry.client?.profile?.full_name || "Sin nombre"}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.lastMeasurement}: {new Date(entry.recorded_at).toLocaleDateString("es-MX")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {entry.weight != null && (
                  <div className="rounded-lg bg-background p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Ruler className="h-3 w-3" />
                      {t.weight}
                    </div>
                    <p className="mt-1 text-lg font-semibold">{entry.weight} <span className="text-xs text-muted-foreground">kg</span></p>
                  </div>
                )}
                {entry.body_fat != null && (
                  <div className="rounded-lg bg-background p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      {t.bodyFat}
                    </div>
                    <p className="mt-1 text-lg font-semibold">{entry.body_fat}%</p>
                  </div>
                )}
                {entry.chest != null && (
                  <div className="rounded-lg bg-background p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Ruler className="h-3 w-3" />
                      Pecho
                    </div>
                    <p className="mt-1 text-lg font-semibold">{entry.chest} <span className="text-xs text-muted-foreground">cm</span></p>
                  </div>
                )}
                {entry.waist != null && (
                  <div className="rounded-lg bg-background p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Ruler className="h-3 w-3" />
                      Cintura
                    </div>
                    <p className="mt-1 text-lg font-semibold">{entry.waist} <span className="text-xs text-muted-foreground">cm</span></p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}