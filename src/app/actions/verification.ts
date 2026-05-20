"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { requireUser, getCurrentUser } from "@/lib/roles";
import type { VerificationFormState } from "@/types/verification";
import type { UserRole } from "@/types/database";

export async function submitVerification(
  _prev: VerificationFormState,
  formData: FormData,
): Promise<VerificationFormState> {
  const supabase = await createClient();
  const user = await requireUser();
  const role = user.user_metadata?.role as UserRole | undefined;

  if (!role || (role !== "nutritionist" && role !== "trainer")) {
    return { success: false, error: "Solo los profesionales requieren verificacion." };
  }

  const documentUrlsRaw = formData.get("document_urls");
  let documentUrls: string[] = [];

  try {
    documentUrls = documentUrlsRaw ? JSON.parse(documentUrlsRaw as string) : [];
  } catch {
    return { success: false, error: "Formato de documentos invalido." };
  }

  if (documentUrls.length === 0) {
    return { success: false, error: "Debes subir al menos un documento." };
  }

  const { data: existing } = await supabase
    .from("verification_requests")
    .select("id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.status === "pending") {
    return { success: false, error: "Ya tienes una solicitud pendiente." };
  }

  if (existing) {
    const { error } = await supabase
      .from("verification_requests")
      .update({
        document_urls: documentUrls,
        status: "pending",
        admin_notes: null,
        reviewed_by: null,
        reviewed_at: null,
      })
      .eq("id", existing.id);

    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("verification_requests").insert({
      user_id: user.id,
      role,
      document_urls: documentUrls,
      status: "pending",
    });

    if (error) return { success: false, error: error.message };
  }

  // Update user metadata to reflect pending status
  const adminClient = createAdminClient();
  await adminClient.auth.admin.updateUserById(user.id, {
    user_metadata: { verification_status: "pending" },
  });

  return { success: true, error: "", status: "pending" };
}

export async function approveVerification(
  requestId: string,
  adminNotes?: string,
): Promise<VerificationFormState> {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user: adminUser } } = await supabase.auth.getUser();
  if (!adminUser) return { success: false, error: "No autenticado." };

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", adminUser.id)
    .single();

  if (adminProfile?.role !== "admin") {
    return { success: false, error: "Solo administradores pueden aprobar solicitudes." };
  }

  const { data: request } = await supabase
    .from("verification_requests")
    .select("user_id")
    .eq("id", requestId)
    .single();

  if (!request) return { success: false, error: "Solicitud no encontrada." };

  const { error: updateError } = await supabase
    .from("verification_requests")
    .update({
      status: "approved",
      reviewed_by: adminUser.id,
      reviewed_at: new Date().toISOString(),
      admin_notes: adminNotes || null,
    })
    .eq("id", requestId);

  if (updateError) return { success: false, error: updateError.message };

  const { error: metadataError } = await adminClient.auth.admin.updateUserById(
    request.user_id,
    { user_metadata: { verification_status: "approved" } },
  );

  if (metadataError) return { success: false, error: metadataError.message };

  return { success: true, error: "" };
}

export async function rejectVerification(
  requestId: string,
  adminNotes?: string,
): Promise<VerificationFormState> {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user: adminUser } } = await supabase.auth.getUser();
  if (!adminUser) return { success: false, error: "No autenticado." };

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", adminUser.id)
    .single();

  if (adminProfile?.role !== "admin") {
    return { success: false, error: "Solo administradores pueden rechazar solicitudes." };
  }

  const { data: request } = await supabase
    .from("verification_requests")
    .select("user_id")
    .eq("id", requestId)
    .single();

  if (!request) return { success: false, error: "Solicitud no encontrada." };

  const { error: updateError } = await supabase
    .from("verification_requests")
    .update({
      status: "rejected",
      reviewed_by: adminUser.id,
      reviewed_at: new Date().toISOString(),
      admin_notes: adminNotes || null,
    })
    .eq("id", requestId);

  if (updateError) return { success: false, error: updateError.message };

  const { error: metadataError } = await adminClient.auth.admin.updateUserById(
    request.user_id,
    { user_metadata: { verification_status: "rejected" } },
  );

  if (metadataError) return { success: false, error: metadataError.message };

  return { success: true, error: "" };
}

export async function checkAuthenticated() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}