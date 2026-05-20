"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Leaf,
  ArrowLeft,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  FileText,
} from "lucide-react";
import { es } from "@/lib/i18n";
import { approveVerification, rejectVerification } from "@/app/actions/verification";
import type { VerificationRequestWithProfile } from "@/types/verification";

interface Props {
  request: VerificationRequestWithProfile;
}

export function ReviewForm({ request }: Props) {
  const router = useRouter();
  const t = es.verification;

  const [approveState, approveAction, approvePending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const notes = formData.get("admin_notes") as string;
      const result = await approveVerification(request.id, notes);
      if (result.success) {
        router.refresh();
      }
      return result;
    },
    { success: false, error: "" },
  );

  const [rejectState, rejectAction, rejectPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const notes = formData.get("admin_notes") as string;
      const result = await rejectVerification(request.id, notes);
      if (result.success) {
        router.refresh();
      }
      return result;
    },
    { success: false, error: "" },
  );

  const profile = request.profiles;
  const statusColors: Record<string, string> = {
    pending: "border-amber-500/30 bg-amber-500/10 text-amber-500",
    approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
    rejected: "border-destructive/30 bg-destructive/10 text-destructive",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    approved: "Aprobado",
    rejected: "Rechazado",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-5 w-5" />,
    approved: <CheckCircle2 className="h-5 w-5" />,
    rejected: <XCircle className="h-5 w-5" />,
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Back link */}
      <Link
        href="/admin/verification"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a solicitudes
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User info card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                {profile.full_name?.[0] || "?"}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{profile.full_name || "Sin nombre"}</h2>
                <p className="text-sm text-muted-foreground">{profile.email || ""}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium capitalize">
                    <Shield className="h-3 w-3" />
                    {request.role === "nutritionist" ? "Nutriologo" : "Entrenador"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[request.status]}`}
                  >
                    {statusIcons[request.status]}
                    {statusLabels[request.status]}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t.requestedOn}</p>
                <p className="font-medium">
                  {new Date(request.created_at).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {request.reviewed_at && (
                <div>
                  <p className="text-muted-foreground">{t.reviewedOn}</p>
                  <p className="font-medium">
                    {new Date(request.reviewed_at).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">{t.documents}</h3>
            {request.document_urls.length > 0 ? (
              <div className="space-y-3">
                {request.document_urls.map((url, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Documento {idx + 1}
                      </span>
                    </div>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                    >
                      {t.viewDocument}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t.noDocuments}</p>
            )}
          </div>

          {/* Admin notes display */}
          {request.admin_notes && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                {t.adminNotes}
              </h3>
              <p className="text-sm">{request.admin_notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          {/* Approve form */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-emerald-500">{t.approve}</h3>
            {request.status === "approved" ? (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
                {t.approvedToast}
              </div>
            ) : (
              <form action={approveAction} className="space-y-4">
                <textarea
                  name="admin_notes"
                  placeholder={t.adminNotesPlaceholder}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring resize-none"
                />
                {approveState?.error && (
                  <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {approveState.error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={approvePending}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {approvePending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      {t.approve}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Reject form */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-destructive">{t.reject}</h3>
            {request.status === "rejected" ? (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <XCircle className="h-4 w-4" />
                {t.rejectedToast}
              </div>
            ) : (
              <form action={rejectAction} className="space-y-4">
                <textarea
                  name="admin_notes"
                  placeholder={t.adminNotesPlaceholder}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring resize-none"
                />
                {rejectState?.error && (
                  <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {rejectState.error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={rejectPending}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-destructive px-4 text-sm font-medium text-destructive-foreground shadow-lg shadow-destructive/25 transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {rejectPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      {t.reject}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}