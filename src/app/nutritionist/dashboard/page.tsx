import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, ClipboardList, Calendar, TrendingUp } from "lucide-react";
import { es } from "@/lib/i18n";
import { completeOnboarding } from "@/app/actions/profiles";

export default async function NutritionistDashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  const user = data.user;
  const t = es.nutritionistDashboard;

  // Ensure role-specific record exists
  await completeOnboarding();

  // Get nutritionist record to show recent clients
  const { data: nutritionist } = await supabase
    .from("nutritionists")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  // Count clients (all clients are visible to nutritionists via RLS)
  const { count: clientCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true });

  // Count meal plans created by this nutritionist
  const { count: mealPlanCount } = await supabase
    .from("meal_plans")
    .select("*", { count: "exact", head: true })
    .eq("nutritionist_id", user.id);

  // Count active (non-template) meal plans
  const { count: activePlanCount } = await supabase
    .from("meal_plans")
    .select("*", { count: "exact", head: true })
    .eq("nutritionist_id", user.id)
    .eq("is_template", false);

  // Count upcoming appointments for this nutritionist
  const today = new Date().toISOString().split("T")[0];
  const { count: appointmentCount } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("professional_id", user.id)
    .gte("date", today);

  // Get recent clients with profile info
  const { data: recentClients } = await supabase
    .from("clients")
    .select("*, profile:profiles!user_id(full_name, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: upcomingAppointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("professional_id", user.id)
    .gte("date", today)
    .order("date", { ascending: true })
    .order("time", { ascending: true })
    .limit(5);

  // Calculate monthly revenue
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const startOfMonthStr = startOfMonth.toISOString().split("T")[0];

  const { data: payments } = await supabase
    .from("payments")
    .select("amount")
    .eq("professional_id", user.id)
    .eq("status", "completed")
    .gte("payment_date", startOfMonthStr);

  const monthlyRevenue = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          {t.welcome}, {user.user_metadata?.full_name || "Nutriólogo"}
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
            <span className="text-sm font-medium text-muted-foreground">{t.mealPlans}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <ClipboardList className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">{mealPlanCount ?? 0}</div>
          <div className="mt-1 text-xs text-muted-foreground">{t.activePlans}</div>
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

        <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elevated">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t.revenue}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">${monthlyRevenue}</div>
          <div className="mt-1 text-xs text-muted-foreground">{t.thisMonth}</div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent clients */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t.recentClients}</h2>
          {recentClients && recentClients.length > 0 ? (
            <div className="space-y-3">
              {recentClients.map((client) => (
                <div key={client.id} className="flex items-center gap-3 rounded-lg bg-background px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {client.profile?.full_name?.[0] || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{client.profile?.full_name || "Sin nombre"}</p>
                    <p className="text-xs text-muted-foreground">
                      {client.goal || "Sin objetivo"} · {client.age || "?"} años
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{t.noClients}</p>
              <p className="text-xs text-muted-foreground/60">
                {t.noClientsDesc}
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
              {t.createMealPlan}
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-accent">
              <Calendar className="h-4 w-4 text-primary" />
              {t.scheduleAppointment}
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-accent">
              <Users className="h-4 w-4 text-primary" />
              {t.viewAllClients}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}