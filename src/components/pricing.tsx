"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { es } from "@/lib/i18n";

export function Pricing() {
  const t = es.pricing;

  const plans = [
    {
      name: t.basic.name,
      price: `$${t.basic.price}`,
      period: "/mes",
      description: t.basic.desc,
      features: t.basic.features,
      cta: t.cta,
      href: "/signup",
      featured: false,
    },
    {
      name: t.pro.name,
      price: `$${t.pro.price}`,
      period: "/mes",
      description: t.pro.desc,
      features: t.pro.features,
      cta: t.cta,
      href: "/signup",
      featured: true,
    },
    {
      name: t.elite.name,
      price: `$${t.elite.price}`,
      period: "/mes",
      description: t.elite.desc,
      features: t.elite.features,
      cta: t.cta,
      href: "/signup",
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {t.subtitle}
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                plan.featured
                  ? "border-primary bg-card shadow-elevated"
                  : "border-border bg-card"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                  {t.popular}
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`inline-flex h-11 items-center justify-center rounded-xl text-sm font-medium transition-all ${
                  plan.featured
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90"
                    : "border border-input bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}