import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UtensilsCrossed, Flame, Apple, Wheat, Dumbbell } from "lucide-react";
import { es } from "@/lib/i18n";
import { completeOnboarding } from "@/app/actions/profiles";

export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  const user = data.user;
  const t = es.clientDashboard;

  // Ensure role-specific record exists
  await completeOnboarding();

  // Get client record
  const { data: client } = await supabase
    .from("clients")
    .select("id, goal")
    .eq("user_id", user.id)
    .maybeSingle();

  // Get today's meals from active meal plan
  const today = new Date().toISOString().split("T")[0];
  let todayCalories = 0;
  let todayProtein = 0;
  let todayCarbs = 0;
  let todayFat = 0;
  let mealsToday = 0;
  let recentMeals: { name: string; meal_type: string; calories: number | null; time: string | null; meal_plan_name: string }[] = [];

  if (client) {
    // Get active meal plan for this client
    const { data: activePlan } = await supabase
      .from("meal_plans")
      .select("id, name")
      .eq("client_id", client.id)
      .eq("is_template", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activePlan) {
      const { data: meals } = await supabase
        .from("meals")
        .select("name, meal_type, calories, protein, carbs, fat, time")
        .eq("meal_plan_id", activePlan.id)
        .order("time", { ascending: true });

      if (meals) {
        mealsToday = meals.length;
        recentMeals = meals.map((m) => ({
          name: m.name,
          meal_type: m.meal_type,
          calories: m.calories,
          time: m.time,
          meal_plan_name: activePlan.name,
        }));

        for (const meal of meals) {
          todayCalories += meal.calories ?? 0;
          todayProtein += meal.protein ?? 0;
          todayCarbs += meal.carbs ?? 0;
          todayFat += meal.fat ?? 0;
        }
      }
    }
  }

  const calorieGoal = 2000;

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
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elevated">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t.calories}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">{todayCalories || "--"}</div>
          <div className="mt-1 text-xs text-muted-foreground">{t.caloriesGoal}</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elevated">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t.protein}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <Apple className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">{todayProtein ? `${todayProtein}g` : "--"}</div>
          <div className="mt-1 text-xs text-muted-foreground">{t.proteinGoal}</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elevated">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t.carbs}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500">
              <Wheat className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">{todayCarbs ? `${todayCarbs}g` : "--"}</div>
          <div className="mt-1 text-xs text-muted-foreground">{t.carbsGoal}</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elevated">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t.meals}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">{mealsToday || 0}</div>
          <div className="mt-1 text-xs text-muted-foreground">{t.mealsToday}</div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent meals */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t.recentMeals}</h2>
          {recentMeals.length > 0 ? (
            <div className="space-y-3">
              {recentMeals.map((meal, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-background px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{meal.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {meal.meal_type} {meal.time ? `· ${meal.time.slice(0, 5)}` : ""}
                    </p>
                  </div>
                  <span className="text-sm font-medium">{meal.calories ? `${meal.calories} kcal` : "--"}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UtensilsCrossed className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{t.noMeals}</p>
              <p className="text-xs text-muted-foreground/60">
                {t.noMealsDesc}
              </p>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t.quickActions}</h2>
          <div className="space-y-3">
            <button className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-accent">
              <UtensilsCrossed className="h-4 w-4 text-primary" />
              {t.logMeal}
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-accent">
              <Dumbbell className="h-4 w-4 text-primary" />
              {t.logExercise}
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-accent">
              <Apple className="h-4 w-4 text-primary" />
              {t.viewMealPlan}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}