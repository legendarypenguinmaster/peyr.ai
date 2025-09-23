import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import CoFoundersPageClient from "./CoFoundersPageClient";
import ClientPageWrapper from "@/components/ui/ClientPageWrapper";

export const dynamic = 'force-dynamic';

export default async function CoFoundersPage() {
  // This will redirect to sign-in if not authenticated
  await requireAuth();

  const supabase = await createClient();

  // Get all mentors (co-founders) with their profiles
  const { data: mentors, error } = await supabase
    .from("mentors")
    .select(
      `
      *,
      profiles!inner (
        id,
        name,
        email,
        avatar_url,
        role,
        id_verification
      )
    `
    )
    .eq("profiles.role", "mentor");

  if (error) {
    console.error("Error fetching mentors:", error);
  }

  return (
    <ClientPageWrapper loadingText="Loading co-founders...">
      <CoFoundersPageClient mentors={mentors || []} />
    </ClientPageWrapper>
  );
}
