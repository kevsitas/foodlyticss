"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { completeAppointment } from "@/app/actions/appointments";
import type { FormState } from "@/types/database";
import { CheckCircle2, Loader2 } from "lucide-react";

interface CompleteButtonProps {
  appointmentId: string;
  t: any;
}

export function CompleteButton({ appointmentId, t }: CompleteButtonProps) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    async (_prev: FormState) => {
      const result = await completeAppointment(appointmentId);
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
        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-500 disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
        {t.complete}
      </button>
    </form>
  );
}