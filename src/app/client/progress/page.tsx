import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BarChart3, TrendingUp } from "lucide-react";
import { es } from "@/lib/i18n";
import { ProgressForm } from "./progress-form";
import { ProgressHistory } from "./progress-history";

export default async function ClientProgressPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const t = es.clientProgress;

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  let entries: any[] = [];

  if (client) {
    const { data } = await supabase
      .from("client_progress")
      .select("*")
      .eq("client_id", client.id)
      .order("recorded_at", { ascending: false });

    entries = data ?? [];
  }

  const latest = entries[0];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Latest measurements */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">{t.history}</h2>
            </div>

            {entries.length > 0 ? (
              <ProgressHistory entries={entries} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <TrendingUp className="mb-3 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">{t.noData}</p>
                <p className="text-xs text-muted-foreground/60">{t.noDataDesc}</p>
              </div>
            )}
          </div>
        </div>

        {/* Add measurement + latest values */}
        <div className="space-y-6">
          {latest && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Última Medición</h2>
              <div className="space-y-2">
                {latest.weight != null && <InfoRow label={t.weight} value={`${latest.weight} ${t.kg}`} />}
                {latest.body_fat != null && <InfoRow label={t.bodyFat} value={`${latest.body_fat}%`} />}
                {latest.chest != null && <InfoRow label={t.chest} value={`${latest.chest} ${t.cm}`} />}
                {latest.waist != null && <InfoRow label={t.waist} value={`${latest.waist} ${t.cm}`} />}
                {latest.arm != null && <InfoRow label={t.arm} value={`${latest.arm} ${t.cm}`} />}
                {latest.thigh != null && <InfoRow label={t.thigh} value={`${latest.thigh} ${t.cm}`} />}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {new Date(latest.recorded_at).toLocaleDateString("es-MX")}
              </p>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">{t.addMeasurement}</h2>
            <ProgressForm clientId={client?.id ?? ""} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}