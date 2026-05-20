"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteUser } from "@/app/actions/admin";

interface DeleteUserButtonProps {
  userId: string;
  userName: string;
}

export function DeleteUserButton({ userId, userName }: DeleteUserButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          disabled={pending}
          onClick={async () => {
            setPending(true);
            const result = await deleteUser(userId);
            if (result.success) {
              router.refresh();
            } else {
              alert(result.error);
              setPending(false);
            }
            setShowConfirm(false);
          }}
          className="inline-flex items-center rounded bg-destructive px-2 py-1 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirmar"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="inline-flex items-center rounded bg-muted px-2 py-1 text-xs font-medium hover:bg-muted/80"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-500/60 transition-colors hover:text-red-500"
      title={`Eliminar a ${userName}`}
    >
      <Trash2 className="h-3 w-3" />
    </button>
  );
}