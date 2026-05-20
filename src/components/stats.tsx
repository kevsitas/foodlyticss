"use client";

import { motion } from "framer-motion";
import { es } from "@/lib/i18n";

const stats = [
  { label: es.stats.users, value: "50,000+" },
  { label: es.stats.meals, value: "2.4M+" },
  { label: es.stats.professionals, value: "1,000+" },
  { label: es.stats.satisfaction, value: "94%" },
];

export function Stats() {
  return (
    <section className="border-y border-border bg-secondary/30 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}