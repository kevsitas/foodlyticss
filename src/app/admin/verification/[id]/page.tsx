import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/roles";
import { notFound } from "next/navigation";
import { ReviewForm } from "./review-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function VerificationDetailPage({ params }: Props) {
  const { id } = await params;
  await requireRole(["admin"]);
  const supabase = await createClient();

  const { data: request } = await supabase
    .from("verification_requests")
    .select("*, profiles!inner(full_name, avatar_url)")
    .eq("id", id)
    .single();

  if (!request) {
    notFound();
  }

  return <ReviewForm request={request} />;
}