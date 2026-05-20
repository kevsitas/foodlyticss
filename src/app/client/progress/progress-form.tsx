"use client";

import { useActionState } from "react";
import { createProgressEntry } from "@/app/actions/progress";
import { es } from "@/lib/i18n";
import type { FormState } from "@/types/database";
import { Plus, Loader2 } from "lucide-react";

interface ProgressFormProps {
  clientId: string;
}

export function ProgressForm({ clientId }: ProgressFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, form: FormData) => {
      if (!clientId) return { success: false, error: "No tienes un perfil de cliente configurado." };
      const result = await createProgressEntry({
        client_id: clientId,
        weight: form.get("weight") ? Number(form.get("weight")) : null,
        body_fat: form.get("body_fat") ? Number(form.get("body_fat")) : null,
        chest: form.get("chest") ? Number(form.get("chest")) : null,
        waist: form.get("waist") ? Number(form.get("waist")) : null,
        hips: form.get("hips") ? Number(form.get("hips")) : null,
        arm: form.get("arm") ? Number(form.get("arm")) : null,
        thigh: form.get("thigh") ? Number(form.get("thigh")) : null,
        notes: form.get("notes") as string || null,
        recorded_at: (form.get("recorded_at") as string) || new Date().toISOString().split("T")[0],
      });
      if (result.success) return { success: true, error: "" };
      return { success: false, error: result.error };
    },
    { success: false, error: "" },
  );

  const t = es.clientProgress;

  if (!clientId) {
    return <p className="text-sm text-muted-foreground">Completa tu perfil en Configuración primero.</p>;
  }

  return (
    <form action={formAction}>
      {state.success && (
        <div className="mb-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500">
          {t.saved}
        </div>
      )}
      {state.error && (
        <div className="mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {state.error}
        </div>
      )}

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t.weight}</label>
            <input name="weight" type="number" step="0.1" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t.bodyFat}</label>
            <input name="body_fat" type="number" step="0.1" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t.chest}</label>
            <input name="chest" type="number" step="0.1" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t.waist}</label>
            <input name="waist" type="number" step="0.1" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t.arm}</label>
            <input name="arm" type="number" step="0.1" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t.thigh}</label>
            <input name="thigh" type="number" step="0.1" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{t.notes}</label>
          <textarea name="notes" rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder={t.notesPlaceholder} />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{t.date}</label>
          <input name="recorded_at" type="date" defaultValue={new Date().toISOString().split("T")[0]} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        {t.save}
      </button>
    </form>
  );
}