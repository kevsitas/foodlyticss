"use client";

import { useState } from "react";
import Link from "next/link";
import { Leaf, Loader2, Mail, ArrowLeft, Link as LinkIcon } from "lucide-react";
import { es } from "@/lib/i18n";
import { generateResetLink } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [resetLink, setResetLink] = useState("");
  const t = es.login;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError("");

    const result = await generateResetLink(email);
    if (!result.success) {
      setError(result.error || "Error al generar el enlace.");
      setPending(false);
    } else {
      setResetLink(result.link || "");
      setSent(true);
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-background to-primary/5 p-12 lg:flex">
        <div className="relative z-10 max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/25">
            <Leaf className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="mb-3 text-3xl font-bold tracking-tight">{t.welcomeBack}</h2>
          <p className="text-muted-foreground">{t.welcomeDesc}</p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Link href="/" className="mb-8 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Leaf className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">{es.app.name}</span>
            </Link>
            <h1 className="mt-8 text-2xl font-bold tracking-tight">{t.forgotPasswordTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.forgotPasswordSubtitle}</p>
          </div>

          {sent ? (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <LinkIcon className="h-6 w-6 text-primary" />
              </div>
              <p className="mb-4 text-sm text-muted-foreground">Enlace generado. Haz clic para restablecer tu contrasena:</p>
              <a
                href={resetLink}
                className="mb-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
              >
                <LinkIcon className="h-4 w-4" />
                Restablecer Contrasena
              </a>
              <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2">
                <p className="text-xs text-muted-foreground break-all">{resetLink}</p>
              </div>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                {t.backToLogin}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                  {t.email}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  required
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90 disabled:opacity-50"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : t.sendResetLink}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-primary hover:underline">
              <ArrowLeft className="inline h-3 w-3 mr-1" />
              {t.backToLogin}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}