import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";

export default async function ClientSettingsPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
          <p className="text-sm text-muted-foreground">Administra tu perfil e información personal.</p>
        </div>

        <SettingsForm
          profile={{
            full_name: profile?.full_name ?? "",
            phone: profile?.phone ?? "",
          }}
          client={{
            age: client?.age ?? null,
            sex: client?.sex ?? null,
            weight: client?.weight ?? null,
            height: client?.height ?? null,
          }}
        />
      </div>
    </div>
  );
}