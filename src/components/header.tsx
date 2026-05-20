"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Leaf } from "lucide-react";
import { es } from "@/lib/i18n";

export function Header() {
  const t = es.header;

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">{es.app.name}</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{t.features}</a>
          <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{t.pricing}</a>
          <a href="#faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{t.faq}</a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            {t.login}
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90"
          >
            {t.signup}
          </Link>
        </div>
      </div>
    </header>
  );
}