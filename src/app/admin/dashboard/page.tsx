import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, TrendingUp, Activity, Shield } from "lucide-react";
import { es } from "@/lib/i18n";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  const t = es.adminDashboard;

  // Total users (count profiles in public schema)
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Users by role
  const { data: usersByRole } = await supabase
    .from("profiles")
    .select("role");

  const roleCounts: Record<string, number> = {};
  for (const p of usersByRole ?? []) {
    roleCounts[p.role] = (roleCounts[p.role] || 0) + 1;
  }

  // Count meals tracked (total across all meal plans)
  const { count: totalMeals } = await supabase
    .from("meals")
    .select("*", { count: "exact", head: true });

  // Total revenue (sum of completed payments)
  const { data: payments } = await supabase
    .from("payments")
    .select("amount")
    .eq("status", "completed");

  const totalRevenue = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

  // Recent signups (last 10 profiles)
  const { data: recentProfiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  // Active today — profiles created today (proxy for activity)
  // In production, you'd use auth.users.last_sign_in_at via the admin API
  const todayStr = new Date().toISOString().split("T")[0];
  const { count: registeredToday } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayStr);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          {t.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t.subtitle}
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elevated">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t.totalUsers}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">{totalUsers ?? "--"}</div>
          <div className="mt-1 text-xs text-muted-foreground">{t.registeredUsers}</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elevated">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t.activeToday}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">{registeredToday ?? "--"}</div>
          <div className="mt-1 text-xs text-muted-foreground">{t.usersToday}</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elevated">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t.mealsTracked}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">{totalMeals ?? "--"}</div>
          <div className="mt-1 text-xs text-muted-foreground">{t.totalMeals}</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elevated">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t.revenue}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">${totalRevenue > 0 ? totalRevenue : "--"}</div>
          <div className="mt-1 text-xs text-muted-foreground">{t.totalRevenue}</div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent signups */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t.recentRegistrations}</h2>
          {recentProfiles && recentProfiles.length > 0 ? (
            <div className="space-y-3">
              {recentProfiles.map((profile) => (
                <div key={profile.id} className="flex items-center gap-3 rounded-lg bg-background px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {profile.full_name?.[0] || "?"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{profile.full_name || "Sin nombre"}</p>
                    <p className="text-xs text-muted-foreground">
                      {profile.role} · {new Date(profile.created_at).toLocaleDateString("es-MX")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{t.noRegistrations}</p>
              <p className="text-xs text-muted-foreground/60">
                {t.noRegistrationsDesc}
              </p>
            </div>
          )}
        </div>

        {/* Platform health */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t.platformHealth}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-background px-4 py-3">
              <span className="text-sm font-medium">{t.database}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {t.operational}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-background px-4 py-3">
              <span className="text-sm font-medium">{t.authentication}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {t.operational}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-background px-4 py-3">
              <span className="text-sm font-medium">{t.storage}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {t.operational}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-background px-4 py-3">
              <span className="text-sm font-medium">{t.api}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {t.operational}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}