"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CalendarPlus } from "lucide-react";
import type { FormState } from "@/types/database";
import { createAppointment } from "@/app/actions/appointments";

interface AppointmentFormProps {
  clients: any[];
  professionalId: string;
  t: any;
}

export function AppointmentForm({ clients, professionalId, t }: AppointmentFormProps) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, form: FormData) => {
      const result = await createAppointment({
        professional_id: professionalId,
        client_id: form.get("client_id") as string,
        title: form.get("title") as string || "Sesion",
        description: form.get("description") as string || null,
        date: form.get("date") as string,
        time: form.get("time") as string,
        duration_minutes: Number(form.get("duration_minutes")) || 30,
        type: form.get("type") as string || "training",
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
    <form action={formAction} className="space-y-4">
      {state.success && (
        <div className="rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">{t.saved}</div>
      )}
      {state.error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">{state.error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t.titleLabel}</label>
          <input
            name="title"
            required
            placeholder={t.titlePlaceholder}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t.client}</label>
          <select
            name="client_id"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">{t.selectClient}</option>
            {clients.map((c: any) => (
              <option key={c.id} value={c.id}>{c.profile?.full_name || "Sin nombre"}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t.date}</label>
          <input
            name="date"
            type="date"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t.time}</label>
          <input
            name="time"
            type="time"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t.duration}</label>
          <select
            name="duration_minutes"
            defaultValue="30"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="15">15 {t.durationMinutes}</option>
            <option value="30">30 {t.durationMinutes}</option>
            <option value="45">45 {t.durationMinutes}</option>
            <option value="60">60 {t.durationMinutes}</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t.type}</label>
          <select
            name="type"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="training">{t.training}</option>
            <option value="follow_up">{t.followUp}</option>
            <option value="assessment">{t.assessment}</option>
            <option value="other">{t.other}</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
        {t.confirm}
      </button>
    </form>
  );
}