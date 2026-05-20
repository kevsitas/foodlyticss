"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Leaf,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCheck,
  Shield,
  ArrowRight,
} from "lucide-react";
import { es } from "@/lib/i18n";
import { FileUpload } from "@/components/file-upload";
import { submitVerification } from "@/app/actions/verification";
import type { VerificationRequest, VerificationFormState } from "@/types/verification";

interface Props {
  request?: VerificationRequest;
  role: string;
  userId: string;
  verificationStatus?: string;
}

export function VerifyIdentityForm({
  request,
  role,
  userId,
  verificationStatus,
}: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(submitVerification, {
    success: false,
    error: "",
  } as VerificationFormState);

  const [docUrl1, setDocUrl1] = useState<string>("");
  const [docUrl2, setDocUrl2] = useState<string>("");
  const [docUrl3, setDocUrl3] = useState<string>("");

  const isNutritionist = role === "nutritionist";
  const docUrls = [docUrl1, docUrl2, docUrl3].filter(Boolean);
  const hasExistingRequest = verificationStatus === "pending" && !!request;
  const t = es.verification;

  // Show status screens
  if (verificationStatus === "approved") {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight">{t.approved}</h1>
          <p className="mb-8 text-sm text-muted-foreground">{t.approvedDesc}</p>
          <Link
            href={isNutritionist ? "/nutritionist/dashboard" : "/trainer/dashboard"}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90"
          >
            {t.goToDashboard}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (hasExistingRequest) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10">
            <Clock className="h-10 w-10 text-amber-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight">{t.pending}</h1>
          <p className="mb-3 text-sm text-muted-foreground">{t.pendingDesc}</p>
          <p className="text-xs text-muted-foreground/70">{t.pendingHelp}</p>
        </div>
      </div>
    );
  }

  // Upload form (fresh signup or rejected)
  const isRejected = verificationStatus === "rejected";

  return (
    <div className="flex min-h-screen">
      {/* Brand side */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-background to-primary/5 p-12 lg:flex">
        <div className="relative z-10 max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/25">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="mb-3 text-3xl font-bold tracking-tight">{t.title}</h2>
          <p className="text-muted-foreground">{t.subtitle}</p>
          <div className="mt-8 space-y-3 text-left">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card/50 p-4">
              <FileCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">Cedula Profesional</p>
                <p className="text-xs text-muted-foreground">
                  Documento oficial que acredita tu identidad profesional
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card/50 p-4">
              <FileCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">Diploma</p>
                <p className="text-xs text-muted-foreground">
                  Titulo o diploma que avala tu formacion academica
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card/50 p-4">
              <FileCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">Certificacion</p>
                <p className="text-xs text-muted-foreground">
                  Certificaciones adicionales que respaldan tu experiencia
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Link href="/" className="mb-8 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Leaf className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">{es.app.name}</span>
            </Link>
            <h1 className="mt-8 text-2xl font-bold tracking-tight">{t.uploadTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isRejected ? t.rejectedHelp : t.uploadDesc}
            </p>
          </div>

          {isRejected && request?.admin_notes && (
            <div className="mb-6 flex items-start gap-3 rounded-lg bg-destructive/10 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">{t.rejected}</p>
                <p className="text-xs text-muted-foreground">{request.admin_notes}</p>
              </div>
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t.uploadCedula}</label>
              <FileUpload
                label={t.uploadCedula}
                hint={t.uploadCedulaHint}
                folderPrefix={userId}
                onUpload={(url) => setDocUrl1(url)}
                onRemove={() => setDocUrl1("")}
                uploadedUrl={docUrl1 || undefined}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">{t.uploadDiploma}</label>
              <FileUpload
                label={t.uploadDiploma}
                hint={t.uploadDiplomaHint}
                folderPrefix={userId}
                onUpload={(url) => setDocUrl2(url)}
                onRemove={() => setDocUrl2("")}
                uploadedUrl={docUrl2 || undefined}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">{t.uploadCertificacion}</label>
              <FileUpload
                label={t.uploadCertificacion}
                hint={t.uploadCertificacionHint}
                folderPrefix={userId}
                onUpload={(url) => setDocUrl3(url)}
                onRemove={() => setDocUrl3("")}
                uploadedUrl={docUrl3 || undefined}
              />
            </div>

            <input type="hidden" name="document_urls" value={JSON.stringify(docUrls)} />

            {state?.error && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.error}
              </div>
            )}

            {state?.success && (
              <div className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
                Solicitud enviada correctamente
              </div>
            )}

            <button
              type="submit"
              disabled={pending || docUrls.length === 0}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90 disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t.submit
              )}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="font-medium text-primary hover:underline">
                {t.backToLogin}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}