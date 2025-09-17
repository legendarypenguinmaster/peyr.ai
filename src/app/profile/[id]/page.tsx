import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProfilePageClient from "../ProfilePageClient";
import ClientPageWrapper from "@/components/ui/ClientPageWrapper";

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  // This will redirect to sign-in if not authenticated
  const currentUser = await requireAuth();

  // Await params before using its properties
  const { id } = await params;

  const supabase = await createClient();

  // Get the profile data for the specified user ID
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // Get role-specific data
  let roleData = null;
  if (profile.role === "founder") {
    const { data } = await supabase
      .from("founders")
      .select("*")
      .eq("id", id)
      .single();
    roleData = data;
  } else if (profile.role === "mentor") {
    const { data } = await supabase
      .from("mentors")
      .select("*")
      .eq("id", id)
      .single();
    roleData = data;
  }

  return (
    <ClientPageWrapper loadingText="Loading profile...">
      <ProfilePageClient
        profile={profile}
        roleData={roleData}
        currentUserId={currentUser.id}
      />
    </ClientPageWrapper>
  );
}
