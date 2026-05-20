import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UtensilsCrossed, Flame, Apple } from "lucide-react";
import { es } from "@/lib/i18n";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  const user = data.user;
  const t = es.clientDashboard;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          {t.welcome}, {user.user_metadata?.full_name || "there"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t.subtitle}
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elevated">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t.calories}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">--</div>
          <div className="mt-1 text-xs text-muted-foreground">{t.caloriesGoal}</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elevated">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t.protein}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Apple className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">--</div>
          <div className="mt-1 text-xs text-muted-foreground">{t.proteinGoal}</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elevated">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t.meals}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">0</div>
          <div className="mt-1 text-xs text-muted-foreground">{t.mealsToday}</div>
        </div>
      </div>

      {/* Recent meals placeholder */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">{t.recentMeals}</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <UtensilsCrossed className="mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{t.noMeals}</p>
          <p className="text-xs text-muted-foreground/60">
            {t.noMealsDesc}
          </p>
        </div>
      </div>
    </div>
  );
}