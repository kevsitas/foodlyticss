import type { UserRole } from "./database";

export type VerificationStatus = "pending" | "approved" | "rejected";

export interface VerificationRequest {
  id: string;
  user_id: string;
  role: UserRole;
  document_urls: string[];
  status: VerificationStatus;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerificationRequestWithProfile extends VerificationRequest {
  profiles: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

export interface VerificationFormState {
  success: boolean;
  error: string;
  status?: VerificationStatus;
}