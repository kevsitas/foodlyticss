import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { es } from "@/lib/i18n";
import { MealPlanForm } from "../meal-plan-form";

export default async function MealPlanDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ client?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const { id } = await params;
  const { client: preselectedClient } = await searchParams;
  const isNew = id === "new";

  let plan: any = null;
  let meals: any[] = [];

  if (!isNew) {
    const { data: planData } = await supabase
      .from("meal_plans")
      .select("*, meals(*)")
      .eq("id", id)
      .eq("nutritionist_id", user.id)
      .single();
    if (planData) {
      plan = planData;
      meals = planData.meals ?? [];
    }
  }

  // Get clients for assignment dropdown
  const { data: clients } = await supabase
    .from("clients")
    .select("id, user_id, profile:profiles!user_id(full_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <MealPlanForm
          plan={plan}
          meals={meals}
          clients={clients ?? []}
          preselectedClient={preselectedClient ?? null}
          t={es.nutritionistMealPlans}
        />
      </div>
    </div>
  );
}