import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/roles";
import { Users, Search, Shield, Trash2 } from "lucide-react";
import { es } from "@/lib/i18n";

export default async function AdminUsersPage() {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const t = es.adminUsers;
  const items = profiles ?? [];

  const roleCounts: Record<string, number> = {};
  for (const p of items) {
    roleCounts[p.role] = (roleCounts[p.role] || 0) + 1;
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">{t.totalUsers}</p>
          <p className="mt-1 text-2xl font-bold">{items.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">{t.clients}</p>
          <p className="mt-1 text-2xl font-bold">{roleCounts["client"] || 0}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">{t.nutritionists}</p>
          <p className="mt-1 text-2xl font-bold">{roleCounts["nutritionist"] || 0}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">{t.trainers}</p>
          <p className="mt-1 text-2xl font-bold">{roleCounts["trainer"] || 0}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">{t.admins}</p>
          <p className="mt-1 text-2xl font-bold">{roleCounts["admin"] || 0}</p>
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Usuario</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((profile) => (
                <tr key={profile.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {profile.full_name?.[0] || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{profile.full_name || "Sin nombre"}</p>
                        <p className="text-xs text-muted-foreground">{profile.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium capitalize">
                      {profile.role === "client" && "Cliente"}
                      {profile.role === "nutritionist" && "Nutriologo"}
                      {profile.role === "trainer" && "Entrenador"}
                      {profile.role === "admin" && "Admin"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(profile.created_at).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}