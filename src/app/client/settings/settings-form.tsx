"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/profiles";
import { updateMyClient } from "@/app/actions/clients";
import { es } from "@/lib/i18n";
import type { FormState } from "@/types/database";
import { Save, Loader2 } from "lucide-react";

interface SettingsFormProps {
  profile: { full_name: string; phone: string };
  client: { age: number | null; sex: string | null; weight: number | null; height: number | null };
}

export function SettingsForm({ profile, client }: SettingsFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, form: FormData) => {
      await updateProfile({
        full_name: form.get("full_name") as string || null,
        phone: form.get("phone") as string || null,
      });
      const result = await updateMyClient({
        age: form.get("age") ? Number(form.get("age")) : null,
        sex: form.get("sex") as string || null,
        weight: form.get("weight") ? Number(form.get("weight")) : null,
        height: form.get("height") ? Number(form.get("height")) : null,
      });
      if (result.success) return { success: true, error: "" };
      return { success: false, error: result.error };
    },
    { success: false, error: "" },
  );

  const t = es.clientSettings;

  return (
    <form action={formAction} className="space-y-6">
      {state.success && (
        <div className="rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
          {t.saved}
        </div>
      )}
      {state.error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {state.error}
        </div>
      )}

      {/* Personal Info */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">{t.personalInfo}</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t.fullName}</label>
            <input
              name="full_name"
              defaultValue={profile.full_name}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t.phone}</label>
            <input
              name="phone"
              defaultValue={profile.phone}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Body Info */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">{t.bodyInfo}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t.age}</label>
            <input
              name="age"
              type="number"
              defaultValue={client.age ?? ""}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t.sex}</label>
            <select
              name="sex"
              defaultValue={client.sex ?? ""}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Seleccionar...</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t.weight}</label>
            <input
              name="weight"
              type="number"
              step="0.1"
              defaultValue={client.weight ?? ""}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t.height}</label>
            <input
              name="height"
              type="number"
              step="0.1"
              defaultValue={client.height ?? ""}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {t.save}
      </button>
    </form>
  );
}