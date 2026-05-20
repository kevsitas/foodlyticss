"use client";

import { useActionState } from "react";
import { updateMyClient } from "@/app/actions/clients";
import { es } from "@/lib/i18n";
import type { Client, FormState } from "@/types/database";
import { Save, Loader2 } from "lucide-react";

interface GoalsFormProps {
  client: Client | null;
}

export function GoalsForm({ client }: GoalsFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, form: FormData) => {
      const result = await updateMyClient({
        goal: form.get("goal") as string || null,
        activity_level: form.get("activity_level") as string || null,
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

  const t = es.clientGoals;

  return (
    <form action={formAction} className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">{t.updateGoal}</h2>

      {state.success && (
        <div className="mb-4 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-500">
          {t.saved}
        </div>
      )}
      {state.error && (
        <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500">
          {state.error}
        </div>
      )}

      <div className="mb-4 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t.goalPlaceholder}</label>
          <textarea
            name="goal"
            defaultValue={client?.goal ?? ""}
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder={t.goalPlaceholder}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t.age}</label>
            <input
              name="age"
              type="number"
              defaultValue={client?.age ?? ""}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t.sex}</label>
            <select
              name="sex"
              defaultValue={client?.sex ?? ""}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Seleccionar...</option>
              <option value="male">{t.male}</option>
              <option value="female">{t.female}</option>
              <option value="other">{t.other}</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t.weight}</label>
            <input
              name="weight"
              type="number"
              step="0.1"
              defaultValue={client?.weight ?? ""}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t.height}</label>
            <input
              name="height"
              type="number"
              step="0.1"
              defaultValue={client?.height ?? ""}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">{t.activityLevel}</label>
          <select
            name="activity_level"
            defaultValue={client?.activity_level ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Seleccionar...</option>
            <option value="sedentary">{t.sedentary}</option>
            <option value="light">{t.light}</option>
            <option value="moderate">{t.moderate}</option>
            <option value="active">{t.active}</option>
            <option value="very_active">{t.veryActive}</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {t.save}
      </button>
    </form>
  );
}