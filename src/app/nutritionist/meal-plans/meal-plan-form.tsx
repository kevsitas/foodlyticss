"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";
import type { FormState } from "@/types/database";
import { createMealPlan, updateMealPlan, createMeal, deleteMeal } from "@/app/actions/meal-plans";

interface MealPlanFormProps {
  plan: any;
  meals: any[];
  clients: any[];
  preselectedClient: string | null;
  t: any;
}

export function MealPlanForm({ plan, meals: initialMeals, clients, preselectedClient, t }: MealPlanFormProps) {
  const router = useRouter();
  const isNew = !plan;
  const [meals, setMeals] = useState<any[]>(isNew ? [] : initialMeals);

  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, form: FormData) => {
      const planData = {
        name: form.get("name") as string || "Plan sin nombre",
        description: form.get("description") as string || null,
        daily_calories: form.get("daily_calories") ? Number(form.get("daily_calories")) : null,
        client_id: form.get("client_id") as string || null,
        is_template: form.get("is_template") === "on",
      };

      if (isNew) {
        const result = await createMealPlan(planData);
        if (!result.success) return { success: false, error: result.error };

        // Create meals
        for (const meal of meals) {
          await createMeal({ ...meal, meal_plan_id: result.data.id });
        }

        router.push("/nutritionist/meal-plans");
        router.refresh();
        return { success: true, error: "" };
      } else {
        const result = await updateMealPlan(plan.id, planData);
        if (!result.success) return { success: false, error: result.error };

        // Delete existing meals, then recreate
        const existingMealIds = initialMeals.map((m: any) => m.id);
        for (const mealId of existingMealIds) {
          await deleteMeal(mealId);
        }
        for (const meal of meals) {
          await createMeal({ ...meal, meal_plan_id: plan.id });
        }

        router.push("/nutritionist/meal-plans");
        router.refresh();
        return { success: true, error: "" };
      }
    },
    { success: false, error: "" },
  );

  const addMeal = () => {
    setMeals([...meals, { name: "", meal_type: "breakfast", calories: null, protein: null, carbs: null, fat: null, time: null }]);
  };

  const updateMealField = (index: number, field: string, value: any) => {
    const updated = [...meals];
    (updated[index] as any)[field] = value;
    setMeals(updated);
  };

  const removeMeal = (index: number) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  return (
    <form action={formAction} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">{isNew ? t.create : t.edit}</h1>
        </div>
      </div>

      {state.success && (
        <div className="rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">{t.saved}</div>
      )}
      {state.error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">{state.error}</div>
      )}

      {/* Plan info */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold">{t.edit || "Informacion del Plan"}</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t.nameLabel}</label>
            <input
              name="name"
              defaultValue={plan?.name ?? ""}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t.descriptionLabel}</label>
            <textarea
              name="description"
              defaultValue={plan?.description ?? ""}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t.dailyCalories}</label>
              <input
                name="daily_calories"
                type="number"
                defaultValue={plan?.daily_calories ?? ""}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t.clientAssignment}</label>
              <select
                name="client_id"
                defaultValue={preselectedClient ?? plan?.client_id ?? ""}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">{t.noAssigned}</option>
                {clients.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.profile?.full_name || "Sin nombre"}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              name="is_template"
              type="checkbox"
              defaultChecked={plan?.is_template ?? false}
              className="rounded border-border"
            />
            {t.saveAsTemplate}
          </label>
        </div>
      </div>

      {/* Meals */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Comidas</h2>
          <button
            type="button"
            onClick={addMeal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Plus className="h-3 w-3" />
            {t.addMeal}
          </button>
        </div>

        {meals.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Agrega comidas al plan</p>
        ) : (
          <div className="space-y-3">
            {meals.map((meal, index) => (
              <div key={index} className="rounded-lg border border-border bg-background p-4">
                <div className="mb-3 flex items-center justify-between">
                  <select
                    value={meal.meal_type}
                    onChange={(e) => updateMealField(index, "meal_type", e.target.value)}
                    className="rounded-lg border border-border bg-card px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="breakfast">{t.breakfast}</option>
                    <option value="lunch">{t.lunch}</option>
                    <option value="dinner">{t.dinner}</option>
                    <option value="snack">{t.snack}</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeMeal(index)}
                    className="text-red-500/60 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">{t.mealName}</label>
                    <input
                      value={meal.name}
                      onChange={(e) => updateMealField(index, "name", e.target.value)}
                      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">{t.calories}</label>
                      <input
                        type="number"
                        value={meal.calories ?? ""}
                        onChange={(e) => updateMealField(index, "calories", e.target.value ? Number(e.target.value) : null)}
                        className="w-full rounded-lg border border-border bg-card px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">{t.protein}</label>
                      <input
                        type="number"
                        step="0.1"
                        value={meal.protein ?? ""}
                        onChange={(e) => updateMealField(index, "protein", e.target.value ? Number(e.target.value) : null)}
                        className="w-full rounded-lg border border-border bg-card px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">{t.carbs}</label>
                      <input
                        type="number"
                        step="0.1"
                        value={meal.carbs ?? ""}
                        onChange={(e) => updateMealField(index, "carbs", e.target.value ? Number(e.target.value) : null)}
                        className="w-full rounded-lg border border-border bg-card px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">{t.fat}</label>
                      <input
                        type="number"
                        step="0.1"
                        value={meal.fat ?? ""}
                        onChange={(e) => updateMealField(index, "fat", e.target.value ? Number(e.target.value) : null)}
                        className="w-full rounded-lg border border-border bg-card px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">{t.mealTime}</label>
                    <input
                      type="time"
                      value={meal.time ?? ""}
                      onChange={(e) => updateMealField(index, "time", e.target.value || null)}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {isNew ? t.create : "Guardar Cambios"}
      </button>
    </form>
  );
}