"use client";

import { User, Stethoscope, Dumbbell } from "lucide-react";
import type { UserRole } from "@/types/database";
import { es } from "@/lib/i18n";

interface RoleSelectorProps {
  value: UserRole | null;
  onChange: (role: UserRole) => void;
}

const roles: {
  value: UserRole;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    value: "client",
    label: es.role.client,
    desc: es.signup.clientDesc,
    icon: User,
  },
  {
    value: "nutritionist",
    label: es.role.nutritionist,
    desc: es.signup.nutritionistDesc,
    icon: Stethoscope,
  },
  {
    value: "trainer",
    label: es.role.trainer,
    desc: es.signup.trainerDesc,
    icon: Dumbbell,
  },
];

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">{es.signup.selectRole}</label>
      <p className="-mt-2 text-xs text-muted-foreground">{es.signup.roleSubtitle}</p>
      {roles.map((role) => {
        const isSelected = value === role.value;
        const isProfessional = role.value !== "client";
        return (
          <button
            key={role.value}
            type="button"
            onClick={() => onChange(role.value)}
            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all w-full ${
              isSelected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <role.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{role.label}</span>
                {isProfessional && (
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500 whitespace-nowrap">
                    Profesional
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                {role.desc}
              </p>
              {isProfessional && isSelected && (
                <p className="mt-1.5 text-[11px] text-amber-500">
                  {es.signup.professionalNote}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}