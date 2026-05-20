"use client";

import { useActionState } from "react";
import { cancelAppointment } from "@/app/actions/appointments";
import { es } from "@/lib/i18n";
import type { FormState } from "@/types/database";
import { XCircle, Loader2 } from "lucide-react";

interface CancelButtonProps {
  appointmentId: string;
}

export function CancelButton({ appointmentId }: CancelButtonProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: FormState) => {
      const result = await cancelAppointment(appointmentId);
      if (result.success) return { success: true, error: "" };
      return { success: false, error: result.error };
    },
    { success: false, error: "" },
  );

  const t = es.clientAppointments;

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
        {t.cancel}
      </button>
    </form>
  );
}