import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UtensilsCrossed, Apple, Wheat, Flame, Droplet, Coffee } from "lucide-react";
import { es } from "@/lib/i18n";

export default async function ClientMealsPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const t = es.clientMeals;

  // Get client record
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  // Get meal plans assigned to this client
  let mealPlans: any[] = [];

  if (client) {
    const { data: plans } = await supabase
      .from("meal_plans")
      .select("*, nutritionist:profiles!nutritionist_id(full_name)")
      .eq("client_id", client.id)
      .eq("is_template", false)
      .order("created_at", { ascending: false });

    if (plans) {
      // Get meals for each plan
      const planIds = plans.map((p) => p.id);
      const { data: meals } = planIds.length > 0
        ? await supabase
            .from("meals")
            .select("*")
            .in("meal_plan_id", planIds)
            .order("time", { ascending: true })
        : { data: [] };

      mealPlans = plans.map((plan) => ({
        ...plan,
        meals: (meals ?? []).filter((m) => m.meal_plan_id === plan.id),
      }));
    }
  }

  // Calculate totals
  const totalCalories = mealPlans.reduce(
    (sum, p) => sum + p.meals.reduce((s: number, m: any) => s + (m.calories ?? 0), 0),
    0
  );
  const totalProtein = mealPlans.reduce(
    (sum, p) => sum + p.meals.reduce((s: number, m: any) => s + (m.protein ?? 0), 0),
    0
  );
  const totalCarbs = mealPlans.reduce(
    (sum, p) => sum + p.meals.reduce((s: number, m: any) => s + (m.carbs ?? 0), 0),
    0
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      {mealPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
          <UtensilsCrossed className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{t.noPlans}</p>
          <p className="mt-1 text-xs text-muted-foreground/60">{t.noPlansDesc}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Global summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Flame className="h-4 w-4 text-orange-500" />
                {t.calories}
              </div>
              <div className="text-2xl font-bold tracking-tight">{totalCalories.toLocaleString()}</div>
              <div className="mt-1 text-xs text-muted-foreground">{t.dailyCalories}</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Apple className="h-4 w-4 text-red-500" />
                {t.protein}
              </div>
              <div className="text-2xl font-bold tracking-tight">{totalProtein.toFixed(1)}g</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Wheat className="h-4 w-4 text-yellow-500" />
                {t.carbs}
              </div>
              <div className="text-2xl font-bold tracking-tight">{totalCarbs.toFixed(1)}g</div>
            </div>
          </div>

          {/* Plans */}
          {mealPlans.map((plan) => (
            <div key={plan.id} className="rounded-xl border border-border bg-card">
              <div className="border-b border-border px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{plan.name}</h2>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {plan.daily_calories && (
                      <span className="font-medium text-foreground">{plan.daily_calories}</span>
                    )} {t.dailyCalories}
                    {plan.nutritionist && (
                      <p className="text-xs">por {plan.nutritionist.full_name || "Nutriólogo"}</p>
                    )}
                  </div>
                </div>
              </div>
              {plan.meals.length > 0 ? (
                <div className="divide-y divide-border">
                  {plan.meals.map((meal: any) => (
                    <div key={meal.id} className="flex items-center justify-between px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          {meal.meal_type === "breakfast" && <Coffee className="h-4 w-4 text-primary" />}
                          {meal.meal_type === "lunch" && <UtensilsCrossed className="h-4 w-4 text-primary" />}
                          {meal.meal_type === "dinner" && <UtensilsCrossed className="h-4 w-4 text-primary" />}
                          {meal.meal_type === "snack" && <Apple className="h-4 w-4 text-primary" />}
                          {!["breakfast", "lunch", "dinner", "snack"].includes(meal.meal_type) && (
                            <Droplet className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{meal.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {meal.meal_type === "breakfast" && t.breakfast}
                            {meal.meal_type === "lunch" && t.lunch}
                            {meal.meal_type === "dinner" && t.dinner}
                            {meal.meal_type === "snack" && t.snack}
                            {meal.time ? ` · ${meal.time.slice(0, 5)}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        {meal.calories != null && (
                          <span className="font-medium">{meal.calories} <span className="text-muted-foreground font-normal">kcal</span></span>
                        )}
                        <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
                          {meal.protein != null && <span>P: {meal.protein}g</span>}
                          {meal.carbs != null && <span>C: {meal.carbs}g</span>}
                          {meal.fat != null && <span>G: {meal.fat}g</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <UtensilsCrossed className="mb-2 h-6 w-6 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Este plan no tiene comidas registradas.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

