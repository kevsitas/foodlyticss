"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Dumbbell, Save } from "lucide-react";
import type { FormState } from "@/types/database";
import { createRoutine, updateRoutine, addExerciseToRoutine, removeExerciseFromRoutine } from "@/app/actions/routines";

interface RoutineExerciseEntry {
  exercise_id: string;
  sets: number;
  reps: number;
  rest_time: string;
}

interface RoutineFormProps {
  routine: any;
  clients: any[];
  exercises: any[];
  preselectedClient: string | null;
  t: any;
}

export function RoutineForm({ routine, clients, exercises, preselectedClient, t }: RoutineFormProps) {
  const router = useRouter();
  const isEdit = !!routine;

  const [routineExercises, setRoutineExercises] = useState<RoutineExerciseEntry[]>(
    routine?.exercises?.map((re: any) => ({
      exercise_id: re.exercise_id,
      sets: re.sets ?? 3,
      reps: re.reps ?? 10,
      rest_time: re.rest_time ?? "60",
    })) ?? [],
  );

  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, form: FormData) => {
      const routineData = {
        name: form.get("name") as string,
        description: form.get("description") as string || null,
        client_id: form.get("client_id") as string || null,
        is_template: form.get("is_template") === "on",
      };

      let routineResult;
      if (isEdit) {
        routineResult = await updateRoutine(routine.id, routineData);
      } else {
        routineResult = await createRoutine(routineData);
      }

      if (!routineResult.success) {
        return { success: false, error: routineResult.error };
      }

      // Sync routine exercises
      if (isEdit && routine.exercises) {
        // Remove existing exercises that are no longer in the list
        for (const existing of routine.exercises) {
          if (!routineExercises.find((re) => re.exercise_id === existing.exercise_id)) {
            await removeExerciseFromRoutine(existing.id);
          }
        }
      }

      // Add new exercises
      const existingIds = new Set((routine?.exercises ?? []).map((re: any) => re.exercise_id));
      for (const re of routineExercises) {
        if (!existingIds.has(re.exercise_id)) {
          await addExerciseToRoutine({
            routine_id: routineResult.data.id,
            exercise_id: re.exercise_id,
            sets: re.sets || null,
            reps: re.reps || null,
            rest_time: re.rest_time || "60",
            order_index: routineExercises.indexOf(re),
          });
        }
      }

      router.push("/trainer/routines");
      router.refresh();
      return { success: true, error: "" };
    },
    { success: false, error: "" },
  );

  function addExercise() {
    setRoutineExercises([...routineExercises, { exercise_id: "", sets: 3, reps: 10, rest_time: "60" }]);
  }

  function updateExercise(index: number, field: keyof RoutineExerciseEntry, value: any) {
    const updated = [...routineExercises];
    (updated[index] as any)[field] = value;
    setRoutineExercises(updated);
  }

  function removeExercise(index: number) {
    setRoutineExercises(routineExercises.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.success && (
        <div className="rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">{t.saved}</div>
      )}
      {state.error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">{state.error}</div>
      )}

      {/* Basic info */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold">{t.nameLabel}</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t.nameLabel}</label>
            <input
              name="name"
              required
              defaultValue={routine?.name ?? ""}
              placeholder={t.namePlaceholder}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t.descriptionLabel}</label>
            <textarea
              name="description"
              defaultValue={routine?.description ?? ""}
              placeholder={t.descriptionPlaceholder}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t.clientAssignment}</label>
              <select
                name="client_id"
                defaultValue={routine?.client_id ?? preselectedClient ?? ""}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">{t.noAssigned}</option>
                {clients.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.profile?.full_name || "Sin nombre"}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  name="is_template"
                  type="checkbox"
                  defaultChecked={routine?.is_template ?? false}
                  className="rounded border-border"
                />
                {t.saveAsTemplate}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">{t.exercisesCount}</h2>
          <button
            type="button"
            onClick={addExercise}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
          >
            <Plus className="h-3 w-3" />
            {t.addExercise}
          </button>
        </div>

        {routineExercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Dumbbell className="mb-2 h-6 w-6 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t.addExercise}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {routineExercises.map((re, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-background p-4">
                <div className="flex-1 space-y-3">
                  <select
                    value={re.exercise_id}
                    onChange={(e) => updateExercise(i, "exercise_id", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">{t.selectExercise}</option>
                    {exercises.map((ex: any) => (
                      <option key={ex.id} value={ex.id}>{ex.name}</option>
                    ))}
                  </select>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">{t.sets}</label>
                      <input
                        type="number"
                        value={re.sets}
                        onChange={(e) => updateExercise(i, "sets", Number(e.target.value))}
                        min={1}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">{t.reps}</label>
                      <input
                        type="number"
                        value={re.reps}
                        onChange={(e) => updateExercise(i, "reps", Number(e.target.value))}
                        min={1}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">{t.restTime} ({t.restSeconds})</label>
                      <input
                        type="number"
                        value={re.rest_time}
                        onChange={(e) => updateExercise(i, "rest_time", e.target.value)}
                        min={0}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeExercise(i)}
                  className="mt-6 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {isEdit ? t.edit : t.create}
      </button>
    </form>
  );
}