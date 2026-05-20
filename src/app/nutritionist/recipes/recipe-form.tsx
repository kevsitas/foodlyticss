"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";
import type { FormState } from "@/types/database";
import { createRecipe, updateRecipe } from "@/app/actions/recipes";

interface RecipeFormProps {
  recipe: any;
  t: any;
}

export function RecipeForm({ recipe, t }: RecipeFormProps) {
  const router = useRouter();
  const isNew = !recipe;
  const [ingredients, setIngredients] = useState<any[]>(
    recipe?.ingredients && Array.isArray(recipe.ingredients)
      ? recipe.ingredients
      : [{ name: "", amount: "" }],
  );

  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, form: FormData) => {
      const data = {
        name: form.get("name") as string || "Receta",
        description: form.get("description") as string || null,
        ingredients: ingredients.filter((i: any) => i.name || i.amount),
        instructions: form.get("instructions") as string || null,
        calories: form.get("calories") ? Number(form.get("calories")) : null,
        protein: form.get("protein") ? Number(form.get("protein")) : null,
        carbs: form.get("carbs") ? Number(form.get("carbs")) : null,
        fat: form.get("fat") ? Number(form.get("fat")) : null,
      };

      const result = isNew ? await createRecipe(data) : await updateRecipe(recipe.id, data);
      if (result.success) {
        router.push("/nutritionist/recipes");
        router.refresh();
        return { success: true, error: "" };
      }
      return { success: false, error: result.error };
    },
    { success: false, error: "" },
  );

  const addIngredient = () => setIngredients([...ingredients, { name: "", amount: "" }]);
  const updateIngredient = (index: number, field: string, value: string) => {
    const updated = [...ingredients];
    (updated[index] as any)[field] = value;
    setIngredients(updated);
  };
  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) setIngredients(ingredients.filter((_, i) => i !== index));
  };

  return (
    <form action={formAction} className="space-y-6">
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

      {/* Basic info */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold">{t.nameLabel}</h2>
        <div className="space-y-4">
          <input
            name="name"
            defaultValue={recipe?.name ?? ""}
            required
            placeholder={t.namePlaceholder}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <textarea
            name="description"
            defaultValue={recipe?.description ?? ""}
            placeholder={t.descriptionPlaceholder}
            rows={2}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Ingredients */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">{t.ingredients}</h2>
          <button type="button" onClick={addIngredient} className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
            <Plus className="h-3 w-3" />
            {t.addIngredient}
          </button>
        </div>
        <div className="space-y-2">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={ing.name}
                onChange={(e) => updateIngredient(i, "name", e.target.value)}
                placeholder={t.ingredientName}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                value={ing.amount}
                onChange={(e) => updateIngredient(i, "amount", e.target.value)}
                placeholder={t.ingredientAmount}
                className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button type="button" onClick={() => removeIngredient(i)} className="text-red-500/60 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold">{t.instructions}</h2>
        <textarea
          name="instructions"
          defaultValue={recipe?.instructions ?? ""}
          placeholder={t.instructionsPlaceholder}
          rows={5}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Macros */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold">{t.macrosCalculated}</h2>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">{t.macroCalories}</label>
            <input name="calories" type="number" defaultValue={recipe?.calories ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">{t.macroProtein}</label>
            <input name="protein" type="number" step="0.1" defaultValue={recipe?.protein ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">{t.macroCarbs}</label>
            <input name="carbs" type="number" step="0.1" defaultValue={recipe?.carbs ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">{t.macroFat}</label>
            <input name="fat" type="number" step="0.1" defaultValue={recipe?.fat ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
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