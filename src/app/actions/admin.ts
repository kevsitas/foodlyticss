"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/roles";

export async function deleteUser(userId: string) {
  const { user } = await requireRole(["admin"]);
  if (!user) return { success: false, error: "No autenticado." };

  const admin = createAdminClient();

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { success: false, error: error.message };

  return { success: true, error: "" };
}