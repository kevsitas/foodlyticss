import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/roles";
import { TrendingUp, Users, BarChart3, DollarSign } from "lucide-react";
import { es } from "@/lib/i18n";

export default async function AdminAnalyticsPage() {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const t = es.adminAnalytics;

  // Users by role
  const { data: profiles } = await supabase.from("profiles").select("role, created_at");
  const roleCounts: Record<string, number> = {};
  for (const p of profiles ?? []) {
    roleCounts[p.role] = (roleCounts[p.role] || 0) + 1;
  }

  // Total meals
  const { count: totalMeals } = await supabase
    .from("meals")
    .select("*", { count: "exact", head: true });

  // Revenue
  const { data: payments } = await supabase
    .from("payments")
    .select("amount")
    .eq("status", "completed");

  const totalRevenue = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

  // Users registered in last 7 days
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { count: lastWeek } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", weekAgo);

  // Users registered in last 30 days
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const { count: lastMonth } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", monthAgo);

  const metrics = [
    { label: t.usersByRole, value: profiles?.length ?? 0, icon: Users, color: "text-blue-500 bg-blue-500/10", change: `+${lastWeek ?? 0} ${t.last7Days}` },
    { label: t.revenue, value: `$${totalRevenue}`, icon: DollarSign, color: "text-emerald-500 bg-emerald-500/10", change: "" },
    { label: "Comidas", value: totalMeals ?? 0, icon: BarChart3, color: "text-orange-500 bg-orange-500/10", change: "" },
    { label: t.registrations, value: `${lastMonth ?? 0}`, icon: TrendingUp, color: "text-purple-500 bg-purple-500/10", change: `+${lastWeek ?? 0} ${t.last7Days}` },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Metrics */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{m.label}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${m.color}`}>
                <m.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight">{m.value}</div>
            {m.change && <div className="mt-1 text-xs text-emerald-500">{m.change}</div>}
          </div>
        ))}
      </div>

      {/* Role distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t.platformGrowth}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-background px-4 py-3">
              <span className="text-sm font-medium">{t.clientsLabel}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${profiles?.length ? ((roleCounts["client"] || 0) / profiles.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">{roleCounts["client"] || 0}</span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-background px-4 py-3">
              <span className="text-sm font-medium">{t.nutritionistsLabel}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: `${profiles?.length ? ((roleCounts["nutritionist"] || 0) / profiles.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">{roleCounts["nutritionist"] || 0}</span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-background px-4 py-3">
              <span className="text-sm font-medium">{t.trainersLabel}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{ width: `${profiles?.length ? ((roleCounts["trainer"] || 0) / profiles.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">{roleCounts["trainer"] || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t.overview}</h2>
          <div className="space-y-3">
            <div className="flex justify-between rounded-lg bg-background px-4 py-3">
              <span className="text-sm text-muted-foreground">{t.registrations} ({t.last7Days})</span>
              <span className="text-sm font-medium">{lastWeek ?? 0}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-background px-4 py-3">
              <span className="text-sm text-muted-foreground">{t.registrations} ({t.last30Days})</span>
              <span className="text-sm font-medium">{lastMonth ?? 0}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-background px-4 py-3">
              <span className="text-sm text-muted-foreground">{t.total}</span>
              <span className="text-sm font-medium">{profiles?.length ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}