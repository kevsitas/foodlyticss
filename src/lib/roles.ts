import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types/database";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function getUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const role = user.user_metadata?.role as UserRole | undefined;
  if (role && ["client", "nutritionist", "trainer", "admin"].includes(role)) {
    return role;
  }
  return "client";
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireUser();
  const role = await getUserRole();
  if (!role || !allowedRoles.includes(role)) {
    redirect("/login");
  }
  return { user, role };
}

export function getRoleDashboard(role: UserRole): string {
  const dashboards: Record<UserRole, string> = {
    client: "/client/dashboard",
    nutritionist: "/nutritionist/dashboard",
    trainer: "/trainer/dashboard",
    admin: "/admin/dashboard",
  };
  return dashboards[role];
}
