"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, Loader2, CheckCircle2 } from "lucide-react";
import { es } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState(false);
  const [pending, setPending] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const t = es.login;

  useEffect(() => {
    const supabase = createClient();

    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get("token_hash");

    if (tokenHash) {
      supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash }).then(({ error }) => {
        if (error) {
          setError("El enlace de recuperacion no es valido o ha expirado.");
          setVerifying(false);
        } else {
          setVerifying(false);
        }
      });
    } else {
      // Check if session already has recovery scope (e.g. from onAuthStateChange)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setVerifying(false);
        else setError("No se encontro un enlace de recuperacion valido.");
        setVerifying(false);
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError("");

    if (password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres.");
      setPending(false);
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setPending(false);
    } else {
      setUpdated(true);
      setPending(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

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
            <h1 className="mt-8 text-2xl font-bold tracking-tight">{t.resetPassword}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.resetPasswordSubtitle}</p>
          </div>

          {updated ? (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <p className="mb-2 text-sm font-medium">{t.passwordUpdated}</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
              >
                {t.backToLogin}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                  {t.newPassword}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.newPasswordPlaceholder}
                  required
                  minLength={6}
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
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : t.updatePassword}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-primary hover:underline">
              {t.backToLogin}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}