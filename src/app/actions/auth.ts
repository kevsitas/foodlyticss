"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { getRoleDashboard } from "@/lib/roles";
import type { UserRole } from "@/types/database";

export async function login(_prev: unknown, formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const role = data.user?.user_metadata?.role as UserRole | undefined;

  // Unverified professionals must verify identity first
  if (role === "nutritionist" || role === "trainer") {
    const vStatus = data.user?.user_metadata?.verification_status as string | undefined;
    if (vStatus !== "approved") {
      redirect("/verify-identity");
    }
    redirect(getRoleDashboard(role));
  }

  redirect("/client/dashboard");
}

export async function signup(_prev: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const role = formData.get("role") as UserRole;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (!role || !["client", "nutritionist", "trainer"].includes(role)) {
    return { error: "Please select a valid role." };
  }

  const metadata: Record<string, string> = {
    full_name: fullName,
    role: role,
  };

  if (role !== "client") {
    metadata.verification_status = "pending";
  }

  // Use admin client to auto-confirm email (no confirmation email sent)
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/login?registered=true");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
