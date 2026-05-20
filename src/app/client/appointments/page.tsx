import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Calendar, Clock, User } from "lucide-react";
import { es } from "@/lib/i18n";
import { CancelButton } from "./cancel-button";

export default async function ClientAppointmentsPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const t = es.clientAppointments;
  const today = new Date().toISOString().split("T")[0];

  // Get the client record
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  let upcoming: any[] = [];
  let past: any[] = [];

  if (client) {
    const { data: all } = await supabase
      .from("appointments")
      .select("*, professional:profiles!professional_id(full_name)")
      .eq("client_id", client.id)
      .order("date", { ascending: false })
      .order("time", { ascending: false })
      .limit(50);

    if (all) {
      upcoming = all.filter((a) => a.date >= today && a.status !== "cancelled");
      past = all.filter((a) => a.date < today || a.status === "cancelled");
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Section: Upcoming */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">{t.upcoming}</h2>
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-12 text-center">
            <Calendar className="mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t.noUpcoming}</p>
            <p className="text-xs text-muted-foreground/60">{t.noUpcomingDesc}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((appt) => (
              <div key={appt.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{appt.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(appt.date).toLocaleDateString("es-MX", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {appt.time?.slice(0, 5)}
                      </span>
                      <span>{appt.duration_minutes} {t.duration}</span>
                      {appt.professional && (
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {t.with} {appt.professional.full_name}
                        </span>
                      )}
                    </div>
                    <span className="mt-1 inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-500">
                      {appt.type}
                    </span>
                  </div>
                </div>
                <CancelButton appointmentId={appt.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section: Past */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">{t.past}</h2>
        {past.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-12 text-center">
            <Calendar className="mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t.noPast}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {past.map((appt) => (
              <div key={appt.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-5 py-3 opacity-60">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium">{appt.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(appt.date).toLocaleDateString("es-MX")} · {appt.time?.slice(0, 5)}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  appt.status === "completed"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : appt.status === "cancelled"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-yellow-500/10 text-yellow-500"
                }`}>
                  {appt.status === "completed" && t.completed}
                  {appt.status === "cancelled" && t.cancelled}
                  {appt.status === "scheduled" && "No asistida"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}