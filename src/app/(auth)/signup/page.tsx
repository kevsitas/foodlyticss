"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import Link from "next/link";
import { Leaf, Loader2 } from "lucide-react";
import { es } from "@/lib/i18n";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, undefined);
  const t = es.signup;

  return (
    <div className="flex min-h-screen">
      {/* Brand side */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-background to-primary/5 p-12 lg:flex">
        <div className="relative z-10 max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/25">
            <Leaf className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="mb-3 text-3xl font-bold tracking-tight">{t.startJourney}</h2>
          <p className="text-muted-foreground">
            {t.journeyDesc}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-left">
            <div className="rounded-xl border border-border bg-card/50 p-4">
              <div className="text-2xl font-bold text-primary">50K+</div>
              <div className="text-xs text-muted-foreground">{t.activeUsers}</div>
            </div>
            <div className="rounded-xl border border-border bg-card/50 p-4">
              <div className="text-2xl font-bold text-primary">2.4M+</div>
              <div className="text-xs text-muted-foreground">{t.mealsTracked}</div>
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
            <h1 className="mt-8 text-2xl font-bold tracking-tight">{t.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.subtitle}
            </p>
          </div>

          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium mb-1.5">
                {t.fullName}
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                placeholder={t.fullNamePlaceholder}
                required
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                {t.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder={t.emailPlaceholder}
                required
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                {t.password}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder={t.passwordPlaceholder}
                required
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>

            {state?.error && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.error}
              </div>
            )}

            {state?.success && (
              <div className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
                {state.success}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90 disabled:opacity-50"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : t.createAccount}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t.haveAccount}{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              {t.signIn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}