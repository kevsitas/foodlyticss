"use client";

import { motion } from "framer-motion";
import { Camera, Brain, BarChart3, Dumbbell, Calendar, TrendingUp } from "lucide-react";
import { es } from "@/lib/i18n";

const features = [
  {
    icon: Camera,
    title: es.features.aiRecognition,
    description: es.features.aiRecognitionDesc,
  },
  {
    icon: Brain,
    title: es.features.mealPlanning,
    description: es.features.mealPlanningDesc,
  },
  {
    icon: BarChart3,
    title: es.features.analytics,
    description: es.features.analyticsDesc,
  },
  {
    icon: Dumbbell,
    title: es.features.exerciseTracking,
    description: es.features.exerciseTrackingDesc,
  },
  {
    icon: Calendar,
    title: es.features.appointments,
    description: es.features.appointmentsDesc,
  },
  {
    icon: TrendingUp,
    title: es.features.progress,
    description: es.features.progressDesc,
  },
];

export function Features() {
  const t = es.features;

  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="mb-4 inline-flex rounded-full border border-border bg-secondary/50 px-4 py-1 text-sm text-muted-foreground">
            {t.title}
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t.subtitle}
          </h2>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-elevated"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}