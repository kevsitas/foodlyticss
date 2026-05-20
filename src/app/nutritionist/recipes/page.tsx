import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Plus, Flame, Egg, Wheat, Droplet } from "lucide-react";
import { es } from "@/lib/i18n";
import { deleteRecipe } from "@/app/actions/recipes";

export default async function NutritionistRecipesPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const t = es.nutritionistRecipes;

  const { data: recipes } = await supabase
    .from("recipes")
    .select("*")
    .eq("nutritionist_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <Link
          href="/nutritionist/recipes/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {t.create}
        </Link>
      </div>

      {!recipes || recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
          <BookOpen className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{t.noRecipes}</p>
          <p className="mt-1 text-xs text-muted-foreground/60">{t.noRecipesDesc}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => {
            const ingredients = recipe.ingredients as any[];
            return (
              <Link
                key={recipe.id}
                href={`/nutritionist/recipes/${recipe.id}`}
                className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elevated"
              >
                <h3 className="mb-1 font-medium">{recipe.name}</h3>
                {recipe.description && (
                  <p className="mb-3 text-xs text-muted-foreground line-clamp-2">{recipe.description}</p>
                )}

                {ingredients && ingredients.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">{t.ingredients}</p>
                    <div className="flex flex-wrap gap-1">
                      {ingredients.slice(0, 4).map((ing: any, i: number) => (
                        <span key={i} className="rounded-md bg-background px-2 py-0.5 text-xs text-muted-foreground">
                          {ing.name || ing}
                        </span>
                      ))}
                      {ingredients.length > 4 && (
                        <span className="text-xs text-muted-foreground">+{ingredients.length - 4} mas</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 text-xs text-muted-foreground">
                  {recipe.calories && (
                    <span className="inline-flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-500" />
                      {recipe.calories} kcal
                    </span>
                  )}
                  {recipe.protein && (
                    <span className="inline-flex items-center gap-1">
                      <Egg className="h-3 w-3 text-emerald-500" />
                      {recipe.protein}g
                    </span>
                  )}
                  {recipe.carbs && (
                    <span className="inline-flex items-center gap-1">
                      <Wheat className="h-3 w-3 text-amber-500" />
                      {recipe.carbs}g
                    </span>
                  )}
                  {recipe.fat && (
                    <span className="inline-flex items-center gap-1">
                      <Droplet className="h-3 w-3 text-blue-500" />
                      {recipe.fat}g
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}