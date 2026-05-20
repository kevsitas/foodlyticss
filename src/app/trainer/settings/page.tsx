import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { es } from "@/lib/i18n";
import { SettingsForm } from "./settings-form";

export default async function TrainerSettingsPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const t = es.trainerSettings;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: trainer } = await supabase
    .from("trainers")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <SettingsForm profile={profile} trainer={trainer} t={t} />
      </div>
    </div>
  );
}