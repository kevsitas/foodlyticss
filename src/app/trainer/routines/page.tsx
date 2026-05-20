import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardList, Plus, Users, FileText } from "lucide-react";
import { es } from "@/lib/i18n";

export default async function TrainerRoutinesPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const t = es.trainerRoutines;

  const { data: templates } = await supabase
    .from("routines")
    .select("id, name, description, created_at")
    .eq("trainer_id", user.id)
    .eq("is_template", true)
    .order("created_at", { ascending: false });

  const { data: assignedRoutines } = await supabase
    .from("routines")
    .select("*, client:clients!client_id(id, user_id, profile:profiles!user_id(full_name))")
    .eq("trainer_id", user.id)
    .eq("is_template", false)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <Link
          href="/trainer/routines/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {t.create}
        </Link>
      </div>

      {/* Templates */}
      <div className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <FileText className="h-4 w-4" />
          {t.templates}
        </h2>
        {!templates || templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-8 text-center">
            <ClipboardList className="mb-2 h-6 w-6 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t.noRoutines}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((routine) => (
              <Link
                key={routine.id}
                href={`/trainer/routines/${routine.id}`}
                className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elevated"
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-medium">{routine.name}</h3>
                  <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-500">Plantilla</span>
                </div>
                {routine.description && <p className="mb-3 text-xs text-muted-foreground line-clamp-2">{routine.description}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Assigned routines */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Users className="h-4 w-4" />
          {t.assigned}
        </h2>
        {!assignedRoutines || assignedRoutines.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-8 text-center">
            <Users className="mb-2 h-6 w-6 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t.noRoutines}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assignedRoutines.map((routine) => (
              <Link
                key={routine.id}
                href={`/trainer/routines/${routine.id}`}
                className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elevated"
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-medium">{routine.name}</h3>
                </div>
                {routine.description && <p className="mb-3 text-xs text-muted-foreground line-clamp-2">{routine.description}</p>}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{routine.client?.profile?.full_name || t.noAssigned}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}