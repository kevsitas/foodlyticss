import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Target, Weight, Ruler, Activity } from "lucide-react";
import { es } from "@/lib/i18n";
import { GoalsForm } from "./goals-form";

export default async function ClientGoalsPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const t = es.clientGoals;

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current goal card */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">{t.currentGoal}</h2>
          </div>

          {client?.goal ? (
            <p className="text-sm text-muted-foreground">{client.goal}</p>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Target className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Aún no has definido tu objetivo.</p>
              <p className="text-xs text-muted-foreground/60">Establece una meta para recibir recomendaciones personalizadas.</p>
            </div>
          )}
        </div>

        {/* Stats card */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Datos Actuales</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-background p-4">
              <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Weight className="h-4 w-4" />
                {t.weight}
              </div>
              <span className="text-xl font-bold">{client?.weight ?? "--"}</span>
            </div>
            <div className="rounded-lg bg-background p-4">
              <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Ruler className="h-4 w-4" />
                {t.height}
              </div>
              <span className="text-xl font-bold">{client?.height ?? "--"}</span>
            </div>
            <div className="rounded-lg bg-background p-4">
              <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                {t.activityLevel}
              </div>
              <span className="text-sm font-medium capitalize">{client?.activity_level?.replace("_", " ") || "--"}</span>
            </div>
            <div className="rounded-lg bg-background p-4">
              <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                {t.age}
              </div>
              <span className="text-xl font-bold">{client?.age ?? "--"}</span>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="lg:col-span-2">
          <GoalsForm client={client} />
        </div>
      </div>
    </div>
  );
}