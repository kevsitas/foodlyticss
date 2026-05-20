import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VerifyIdentityForm } from "./verify-identity-form";

export default async function VerifyIdentityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = user.user_metadata?.role as string | undefined;

  // Clients and admins don't need verification
  if (!role || role === "client" || role === "admin") {
    redirect("/client/dashboard");
  }

  // Fetch existing verification request
  const { data: request } = await supabase
    .from("verification_requests")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const metadata = user.user_metadata ?? {};
  const verificationStatus = metadata.verification_status as string | undefined;

  return (
    <VerifyIdentityForm
      request={request ?? undefined}
      role={role}
      userId={user.id}
      verificationStatus={verificationStatus}
    />
  );
}