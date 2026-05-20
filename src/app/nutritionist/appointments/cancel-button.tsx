"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { cancelAppointment } from "@/app/actions/appointments";
import type { FormState } from "@/types/database";
import { XCircle, Loader2 } from "lucide-react";

interface CancelButtonProps {
  appointmentId: string;
  t: any;
}

export function CancelButton({ appointmentId, t }: CancelButtonProps) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    async (_prev: FormState) => {
      const result = await cancelAppointment(appointmentId);
      if (result.success) {
        router.refresh();
        return { success: true, error: "" };
      }
      return { success: false, error: result.error };
    },
    { success: false, error: "" },
  );

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
        {t.cancel}
      </button>
    </form>
  );
}