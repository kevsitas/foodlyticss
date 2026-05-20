import Link from "next/link";
import { Leaf } from "lucide-react";
import { es } from "@/lib/i18n";

export function Footer() {
  const t = es.footer;

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold">{es.app.name}</span>
          </div>
          <nav className="flex gap-6">
            <Link href="#features" className="text-xs text-muted-foreground transition-colors hover:text-foreground">{t.productFeatures}</Link>
            <Link href="#pricing" className="text-xs text-muted-foreground transition-colors hover:text-foreground">{t.productPricing}</Link>
            <Link href="#faq" className="text-xs text-muted-foreground transition-colors hover:text-foreground">{t.productFAQ}</Link>
          </nav>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {es.app.name}. {t.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}