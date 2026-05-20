import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/roles";
import { BookOpen, Dumbbell, ClipboardList, Activity } from "lucide-react";
import { es } from "@/lib/i18n";

export default async function AdminContentPage() {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const [recipesRes, exercisesRes, mealPlansRes, routinesRes] = await Promise.all([
    supabase.from("recipes").select("*", { count: "exact", head: true }),
    supabase.from("exercises").select("*", { count: "exact", head: true }),
    supabase.from("meal_plans").select("*", { count: "exact", head: true }),
    supabase.from("routines").select("*", { count: "exact", head: true }),
  ]);

  const t = es.adminContent;

  const stats = [
    { label: t.recipes, count: recipesRes.count ?? 0, icon: BookOpen, color: "text-blue-500 bg-blue-500/10" },
    { label: t.exercises, count: exercisesRes.count ?? 0, icon: Dumbbell, color: "text-orange-500 bg-orange-500/10" },
    { label: t.mealPlans, count: mealPlansRes.count ?? 0, icon: ClipboardList, color: "text-green-500 bg-green-500/10" },
    { label: t.routines, count: routinesRes.count ?? 0, icon: Activity, color: "text-purple-500 bg-purple-500/10" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight">{stat.count}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">{t.recipes}</h2>
        <p className="mb-4 text-sm text-muted-foreground">{t.totalRecipes}: {recipesRes.count ?? 0}</p>
        <p className="mb-4 text-sm text-muted-foreground">{t.totalExercises}: {exercisesRes.count ?? 0}</p>
        <p className="mb-4 text-sm text-muted-foreground">{t.totalMealPlans}: {mealPlansRes.count ?? 0}</p>
        <p className="text-sm text-muted-foreground">{t.totalRoutines}: {routinesRes.count ?? 0}</p>
      </div>
    </div>
  );
}