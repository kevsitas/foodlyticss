"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/profiles";
import { updateMyNutritionist } from "@/app/actions/nutritionists";
import type { FormState } from "@/types/database";
import { Save, Loader2, Upload } from "lucide-react";

interface SettingsFormProps {
  profile: any;
  nutritionist: any;
  t: any;
}

export function SettingsForm({ profile, nutritionist, t }: SettingsFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, form: FormData) => {
      await updateProfile({
        full_name: form.get("full_name") as string || null,
        phone: form.get("phone") as string || null,
      });
      const result = await updateMyNutritionist({
        specialty: form.get("specialty") as string || null,
        license_number: form.get("license_number") as string || null,
        experience_years: form.get("experience_years") ? Number(form.get("experience_years")) : null,
        bio: form.get("bio") as string || null,
      });
      if (result.success) return { success: true, error: "" };
      return { success: false, error: result.error };
    },
    { success: false, error: "" },
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.success && (
        <div className="rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">{t.saved}</div>
      )}
      {state.error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">{state.error}</div>
      )}

      {/* Personal info */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold">{t.profileInfo}</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Nombre Completo</label>
            <input
              name="full_name"
              defaultValue={profile?.full_name ?? ""}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Telefono</label>
            <input
              name="phone"
              defaultValue={profile?.phone ?? ""}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Professional info */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold">{t.professionalInfo}</h2>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t.specialty}</label>
              <input
                name="specialty"
                defaultValue={nutritionist?.specialty ?? ""}
                placeholder={t.specialtyPlaceholder}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t.licenseNumber}</label>
              <input
                name="license_number"
                defaultValue={nutritionist?.license_number ?? ""}
                placeholder={t.licensePlaceholder}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t.experienceYears}</label>
            <input
              name="experience_years"
              type="number"
              defaultValue={nutritionist?.experience_years ?? ""}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t.bio}</label>
            <textarea
              name="bio"
              defaultValue={nutritionist?.bio ?? ""}
              placeholder={t.bioPlaceholder}
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Verification */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold">{t.verification}</h2>
        <p className="mb-4 text-sm text-muted-foreground">{t.verificationDesc}</p>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent">
          <Upload className="h-4 w-4" />
          {t.uploadDocument}
          <input type="file" className="hidden" accept=".pdf,.jpg,.png" />
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {t.save}
      </button>
    </form>
  );
}