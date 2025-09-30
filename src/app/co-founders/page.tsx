import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import CoFoundersPageClient from "./CoFoundersPageClient";
import ClientPageWrapper from "@/components/ui/ClientPageWrapper";

export const dynamic = 'force-dynamic';

export default async function CoFoundersPage() {
  // This will redirect to sign-in if not authenticated
  await requireAuth();

  const supabase = await createClient();

  // Get all founders (co-founders) with their profiles
  const { data: founders, error } = await supabase
    .from("founders")
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
    .eq("profiles.role", "founder");

  if (error) {
    console.error("Error fetching founders:", error);
  }

  return (
    <ClientPageWrapper loadingText="Loading co-founders...">
      <CoFoundersPageClient founders={founders || []} />
    </ClientPageWrapper>
  );
}
