import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Search, ChevronRight, Calendar, Dumbbell } from "lucide-react";
import { es } from "@/lib/i18n";

export default async function TrainerClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const t = es.trainerClients;
  const { q } = await searchParams;

  let query = supabase
    .from("clients")
    .select("*, profile:profiles!user_id(full_name, avatar_url)")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.textSearch("profile.full_name", q, { type: "plain" });
  }

  const { data: clients } = await query;

  // Fetch latest appointment for each client
  const clientIds = (clients ?? []).map((c) => c.id);
  const { data: latestAppointments } = clientIds.length > 0
    ? await supabase
        .from("appointments")
        .select("client_id, date, status")
        .in("client_id", clientIds)
        .order("date", { ascending: false })
    : { data: [] };

  const latestApptMap = new Map(
    (latestAppointments ?? []).map((a) => [a.client_id, a]),
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <form className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </form>

      {!clients || clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
          <Users className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{t.noClients}</p>
          <p className="mt-1 text-xs text-muted-foreground/60">{t.noClientsDesc}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => {
            const lastAppt = latestApptMap.get(client.id);
            return (
              <Link
                key={client.id}
                href={`/trainer/clients/${client.id}`}
                className="group rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elevated"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {client.profile?.full_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {client.profile?.full_name || "Sin nombre"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {client.goal || "Sin objetivo"}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-all group-hover:translate-x-0.5" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {lastAppt
                      ? `Ultima sesion: ${new Date(lastAppt.date).toLocaleDateString("es-MX")}`
                      : "Sin sesiones"}
                  </div>
                  {client.age && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {client.age} {t.ageYears}
                    </div>
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