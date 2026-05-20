import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, ClipboardList, Calendar, TrendingUp, Download } from "lucide-react";
import { es } from "@/lib/i18n";

export default async function TrainerReportsPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const t = es.trainerReports;

  // Get counts
  const [{ count: clientCount }, { count: activeRoutineCount }, { count: completedSessions }] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("routines").select("*", { count: "exact", head: true }).eq("trainer_id", user.id).eq("is_template", false),
    supabase.from("appointments").select("*", { count: "exact", head: true }).eq("professional_id", user.id).eq("status", "completed"),
  ]);

  // Monthly revenue
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, payment_date, status")
    .eq("professional_id", user.id)
    .eq("status", "completed")
    .gte("payment_date", startOfMonth);

  const monthlyRevenue = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

  // Client growth by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const { data: allClients } = await supabase
    .from("clients")
    .select("created_at")
    .gte("created_at", sixMonthsAgo.toISOString())
    .order("created_at", { ascending: true });

  const monthLabels: string[] = [];
  const monthCounts: number[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = d.toLocaleDateString("es-MX", { month: "short", year: "2-digit" });
    monthLabels.push(label);
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const count = (allClients ?? []).filter(
      (c) => new Date(c.created_at) >= monthStart && new Date(c.created_at) <= monthEnd,
    ).length;
    monthCounts.push(count);
  }
  const maxClientCount = Math.max(...monthCounts, 1);

  // Session stats
  const { data: allAppointments } = await supabase
    .from("appointments")
    .select("status")
    .eq("professional_id", user.id);

  const totalSessions = allAppointments?.length ?? 0;
  const completedCount = allAppointments?.filter((a) => a.status === "completed").length ?? 0;
  const cancelledCount = allAppointments?.filter((a) => a.status === "cancelled").length ?? 0;
  const scheduledCount = allAppointments?.filter((a) => a.status === "scheduled").length ?? 0;
  const maxSessionsCount = Math.max(completedCount, cancelledCount, scheduledCount, 1);

  // Routine adherence
  const { data: routines } = await supabase
    .from("routines")
    .select("id, name, client_id")
    .eq("trainer_id", user.id)
    .not("client_id", "is", null);

  // Fetch client names separately
  const routineClientIds = [...new Set((routines ?? []).map((r) => r.client_id).filter(Boolean))];
  const { data: routineClients } = routineClientIds.length > 0
    ? await supabase
        .from("clients")
        .select("id, profile:profiles!user_id(full_name)")
        .in("id", routineClientIds)
    : { data: [] };

  const clientNameMap = new Map(
    (routineClients ?? []).map((c: any) => [c.id, c.profile?.full_name]),
  );

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
          <Download className="h-4 w-4" />
          {t.exportReport}
        </button>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t.totalClients}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">{clientCount ?? 0}</div>
          <div className="mt-1 text-xs text-muted-foreground">{t.last30Days}</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t.activeRoutines}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <ClipboardList className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">{activeRoutineCount ?? 0}</div>
          <div className="mt-1 text-xs text-muted-foreground">{t.thisMonth}</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t.completedSessions}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">{completedSessions ?? 0}</div>
          <div className="mt-1 text-xs text-muted-foreground">{t.last30Days}</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t.monthlyRevenue}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">${monthlyRevenue.toFixed(2)}</div>
          <div className="mt-1 text-xs text-muted-foreground">{t.thisMonth}</div>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Client growth */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold">{t.clientGrowth}</h3>
          {clientCount && clientCount > 0 ? (
            <div className="flex items-end gap-2" style={{ height: 120 }}>
              {monthLabels.map((label, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-blue-500/60 transition-all hover:bg-blue-500"
                    style={{ height: `${(monthCounts[i] / maxClientCount) * 100}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">{t.noData}</p>
          )}
        </div>

        {/* Session stats */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold">{t.sessionStats}</h3>
          {totalSessions > 0 ? (
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">{t.completedSessions}</span>
                  <span>{completedCount}</span>
                </div>
                <div className="h-2 rounded-full bg-emerald-500/20">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${(completedCount / maxSessionsCount) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Programadas</span>
                  <span>{scheduledCount}</span>
                </div>
                <div className="h-2 rounded-full bg-blue-500/20">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: `${(scheduledCount / maxSessionsCount) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Canceladas</span>
                  <span>{cancelledCount}</span>
                </div>
                <div className="h-2 rounded-full bg-red-500/20">
                  <div className="h-2 rounded-full bg-red-500" style={{ width: `${(cancelledCount / maxSessionsCount) * 100}%` }} />
                </div>
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">{t.noData}</p>
          )}
        </div>
      </div>

      {/* Assigned routines */}
      {routines && routines.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold">{t.routineAdherence}</h3>
          <div className="space-y-3">
            {routines.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg bg-background px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{r.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {clientNameMap.get(r.client_id) || "Sin cliente"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}