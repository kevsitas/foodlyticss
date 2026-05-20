import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Calendar, Plus } from "lucide-react";
import { es } from "@/lib/i18n";
import { AppointmentForm } from "./appointment-form";
import { CancelButton } from "./cancel-button";
import { CompleteButton } from "./complete-button";

export default async function NutritionistAppointmentsPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const t = es.nutritionistAppointments;

  const today = new Date().toISOString().split("T")[0];

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*, client:clients!client_id(user_id, profile:profiles!user_id(full_name))")
    .eq("professional_id", user.id)
    .order("date", { ascending: false })
    .order("time", { ascending: true });

  const upcoming = (appointments ?? []).filter(
    (a) => a.date >= today && a.status !== "cancelled",
  );
  const past = (appointments ?? []).filter(
    (a) => a.date < today || a.status === "cancelled",
  );

  // Get clients for the form
  const { data: clients } = await supabase
    .from("clients")
    .select("id, user_id, profile:profiles!user_id(full_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
      </div>

      {/* Schedule form */}
      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Plus className="h-4 w-4" />
          {t.schedule}
        </h2>
        <AppointmentForm clients={clients ?? []} professionalId={user.id} t={t} />
      </div>

      {/* Upcoming */}
      <div className="mb-8">
        <h2 className="mb-4 text-sm font-semibold text-muted-foreground">{t.upcoming}</h2>
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-8 text-center">
            <Calendar className="mb-2 h-6 w-6 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t.noAppointments}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold">{new Date(apt.date).getDate()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(apt.date).toLocaleDateString("es-MX", { month: "short" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{apt.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {apt.time?.slice(0, 5)} · {apt.duration_minutes}{t.durationMinutes} · {apt.client?.profile?.full_name || "Cliente"}
                    </p>
                    <span className="mt-1 inline-block rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-500 capitalize">
                      {apt.type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CompleteButton appointmentId={apt.id} t={t} />
                  <CancelButton appointmentId={apt.id} t={t} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-muted-foreground">{t.past}</h2>
        {past.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.noAppointmentsDesc}</p>
        ) : (
          <div className="space-y-2">
            {past.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold">{new Date(apt.date).getDate()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(apt.date).toLocaleDateString("es-MX", { month: "short" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{apt.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {apt.client?.profile?.full_name || "Cliente"}
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  apt.status === "completed"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : apt.status === "cancelled"
                    ? "bg-red-500/10 text-red-500"
                    : "bg-blue-500/10 text-blue-500"
                }`}>
                  {apt.status === "completed" ? t.completed : apt.status === "cancelled" ? t.cancelled : t.scheduled}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}