"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Ruler } from "lucide-react";
import type { FormState } from "@/types/database";
import { createProgressEntry } from "@/app/actions/progress";

interface AddProgressFormProps {
  clientId: string;
  t: any;
}

export function AddProgressForm({ clientId, t }: AddProgressFormProps) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, form: FormData) => {
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
        recorded_at: form.get("recorded_at") as string || new Date().toISOString(),
      });
      if (result.success) {
        router.refresh();
        return { success: true, error: "" };
      }
      return { success: false, error: result.error };
    },
    { success: false, error: "" },
  );

  return (
    <form action={formAction} className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Ruler className="h-4 w-4" />
        {t.addMeasurement}
      </h3>

      {state.success && (
        <div className="mb-4 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">{t.saved}</div>
      )}
      {state.error && (
        <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">{state.error}</div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">{t.weight}</label>
          <input
            name="weight"
            type="number"
            step="0.1"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">{t.bodyFat}</label>
          <input
            name="body_fat"
            type="number"
            step="0.1"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">{t.chest}</label>
          <input
            name="chest"
            type="number"
            step="0.1"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">{t.waist}</label>
          <input
            name="waist"
            type="number"
            step="0.1"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">{t.hips}</label>
          <input
            name="hips"
            type="number"
            step="0.1"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">{t.arm}</label>
          <input
            name="arm"
            type="number"
            step="0.1"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">{t.thigh}</label>
          <input
            name="thigh"
            type="number"
            step="0.1"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">{t.date}</label>
          <input
            name="recorded_at"
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="mt-4">
        <textarea
          name="notes"
          placeholder={t.notesPlaceholder}
          rows={2}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ruler className="h-4 w-4" />}
        {t.save}
      </button>
    </form>
  );
}