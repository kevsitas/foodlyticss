"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import type { FormState } from "@/types/database";
import { createExercise } from "@/app/actions/routines";
import { createExerciseVideo, deleteExerciseVideo } from "@/app/actions/exercise-videos";

interface ExerciseFormProps {
  exercise: any;
  videos: any[];
  t: any;
}

export function ExerciseForm({ exercise, videos, t }: ExerciseFormProps) {
  const router = useRouter();
  const isEdit = !!exercise;

  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, form: FormData) => {
      const exerciseData = {
        name: form.get("name") as string,
        description: form.get("description") as string || null,
        muscle_group: form.get("muscle_group") as string || null,
        equipment: form.get("equipment") as string || null,
        difficulty: form.get("difficulty") as string || null,
      };

      const result = await createExercise(exerciseData);
      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Handle video upload if provided
      const videoTitle = form.get("video_title") as string;
      const videoUrl = form.get("video_url") as string;
      if (videoTitle && videoUrl) {
        await createExerciseVideo({
          exercise_id: result.data.id,
          title: videoTitle,
          video_url: videoUrl,
        });
      }

      router.push("/trainer/exercises");
      router.refresh();
      return { success: true, error: "" };
    },
    { success: false, error: "" },
  );

  async function handleRemoveVideo(videoId: string) {
    const result = await deleteExerciseVideo(videoId);
    if (result.success) {
      router.refresh();
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.success && (
        <div className="rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">{t.saved}</div>
      )}
      {state.error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">{state.error}</div>
      )}

      {/* Exercise info */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold">{t.nameLabel}</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t.nameLabel}</label>
            <input
              name="name"
              required
              defaultValue={exercise?.name ?? ""}
              placeholder={t.namePlaceholder}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t.descriptionLabel}</label>
            <textarea
              name="description"
              defaultValue={exercise?.description ?? ""}
              placeholder={t.descriptionPlaceholder}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t.muscleGroup}</label>
              <input
                name="muscle_group"
                defaultValue={exercise?.muscle_group ?? ""}
                placeholder={t.muscleGroupPlaceholder}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t.equipment}</label>
              <input
                name="equipment"
                defaultValue={exercise?.equipment ?? ""}
                placeholder={t.equipmentPlaceholder}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t.difficulty}</label>
              <select
                name="difficulty"
                defaultValue={exercise?.difficulty ?? ""}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">{t.allDifficulties}</option>
                <option value="beginner">{t.beginner}</option>
                <option value="intermediate">{t.intermediate}</option>
                <option value="advanced">{t.advanced}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Videos section (new exercise only, or display for edit) */}
      {isEdit && videos.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold">{t.videos}</h2>
          <div className="space-y-2">
            {videos.map((v: any) => (
              <div key={v.id} className="flex items-center justify-between rounded-lg bg-background px-4 py-2.5 text-sm">
                <div>
                  <p className="font-medium">{v.title}</p>
                  <a href={v.video_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                    {v.video_url}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveVideo(v.id)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video upload */}
      {!isEdit && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Plus className="h-4 w-4" />
            {t.videos}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t.videoTitle}</label>
              <input
                name="video_title"
                placeholder={t.videoTitlePlaceholder}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t.videoUrl}</label>
              <input
                name="video_url"
                placeholder={t.videoUrlPlaceholder}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
      )}

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