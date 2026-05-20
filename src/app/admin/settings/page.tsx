import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/roles";
import { Settings, Shield, AlertTriangle, Save } from "lucide-react";
import { es } from "@/lib/i18n";

export default async function AdminSettingsPage() {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const t = es.adminSettings;

  // Get user count for reference
  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="space-y-6">
        {/* General */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">{t.general}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t.platformName}</label>
              <input
                type="text"
                defaultValue="Foodlytics"
                disabled
                className="w-full rounded-lg border border-input bg-muted/50 px-3 py-2.5 text-sm outline-none cursor-not-allowed opacity-60"
              />
              <p className="mt-1 text-xs text-muted-foreground">Foodlytics</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t.platformDescription}</label>
              <textarea
                rows={3}
                defaultValue="Plataforma de nutricion y entrenamiento personal."
                disabled
                className="w-full rounded-lg border border-input bg-muted/50 px-3 py-2.5 text-sm outline-none cursor-not-allowed opacity-60 resize-none"
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
              <Save className="h-4 w-4" />
              {t.saved}
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">{t.security}</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-background px-4 py-3">
              <div>
                <p className="text-sm font-medium">{t.emailConfirmation}</p>
                <p className="text-xs text-muted-foreground">{t.emailConfirmationDesc}</p>
              </div>
              <div className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Desactivado
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">{t.maintenance}</h2>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-background px-4 py-3">
            <div>
              <p className="text-sm font-medium">{t.maintenanceMode}</p>
              <p className="text-xs text-muted-foreground">{t.maintenanceModeDesc}</p>
            </div>
            <div className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              Inactivo
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h2 className="text-lg font-semibold text-destructive">{t.danger}</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">{t.dangerDesc}</p>
          <div className="flex items-center justify-between rounded-lg bg-background px-4 py-3">
            <div>
              <p className="text-sm font-medium">{t.resetPlatform}</p>
              <p className="text-xs text-muted-foreground">{userCount ?? 0} usuarios seran afectados</p>
            </div>
            <button
              disabled
              className="inline-flex items-center rounded-lg bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive opacity-50 cursor-not-allowed"
            >
              <AlertTriangle className="h-4 w-4 mr-1.5" />
              {t.resetPlatform}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}