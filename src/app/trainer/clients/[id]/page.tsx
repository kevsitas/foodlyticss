import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Ruler, Target, Calendar, Dumbbell } from "lucide-react";
import { es } from "@/lib/i18n";
import { ClientTabs } from "./client-tabs";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const { id } = await params;
  const t = es.trainerClients;

  const { data: client } = await supabase
    .from("clients")
    .select("*, profile:profiles!user_id(full_name, avatar_url, email, phone)")
    .eq("id", id)
    .single();

  if (!client) {
    redirect("/trainer/clients");
  }

  // Fetch all related data in parallel
  const [progressRes, routinesRes, appointmentsRes] = await Promise.all([
    supabase
      .from("client_progress")
      .select("*")
      .eq("client_id", id)
      .order("recorded_at", { ascending: false }),
    supabase
      .from("routines")
      .select("*, exercises:routine_exercises(*, exercise:exercises(*))")
      .eq("client_id", id)
      .eq("is_template", false)
      .order("created_at", { ascending: false }),
    supabase
      .from("appointments")
      .select("*, client:clients!client_id(user_id, profile:profiles!user_id(full_name))")
      .eq("client_id", id)
      .order("date", { ascending: false }),
  ]);

  const progress = progressRes.data ?? [];
  const routines = routinesRes.data ?? [];
  const appointments = appointmentsRes.data ?? [];

  return (
    <div className="p-6 lg:p-8">
      {/* Back link */}
      <Link
        href="/trainer/clients"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.title}
      </Link>

      {/* Profile header */}
      <div className="mb-6 rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-medium text-primary">
            {client.profile?.full_name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{client.profile?.full_name || "Sin nombre"}</h1>
            <p className="text-sm text-muted-foreground">{client.profile?.email}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {client.goal && (
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-500">
                  <Target className="h-3 w-3" />
                  {client.goal}
                </div>
              )}
              {client.age && (
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-500">
                  <Users className="h-3 w-3" />
                  {client.age} {t.ageYears}
                </div>
              )}
              {client.weight && (
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-500">
                  <Ruler className="h-3 w-3" />
                  {client.weight} kg
                </div>
              )}
              {client.height && (
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-500">
                  <Ruler className="h-3 w-3" />
                  {client.height} cm
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/trainer/routines/new?client=${client.id}`}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t.assignRoutine}
            </Link>
            <Link
              href={`/trainer/messages`}
              className="rounded-lg border border-border px-4 py-2 text-xs font-medium transition-colors hover:bg-accent"
            >
              {t.sendMessage}
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ClientTabs
        client={client}
        progress={progress}
        routines={routines}
        appointments={appointments}
        t={t}
      />
    </div>
  );
}