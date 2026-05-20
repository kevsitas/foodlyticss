import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { es } from "@/lib/i18n";
import { RecipeForm } from "../recipe-form";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const { id } = await params;
  const isNew = id === "new";

  let recipe: any = null;
  if (!isNew) {
    const { data } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .single();
    recipe = data;
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <RecipeForm recipe={recipe} t={es.nutritionistRecipes} />
      </div>
    </div>
  );
}