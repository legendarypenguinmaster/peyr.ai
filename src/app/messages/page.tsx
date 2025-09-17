import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MessagesPageClient from "./MessagesPageClient";
import ClientPageWrapper from "@/components/ui/ClientPageWrapper";

export default async function MessagesPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/sign-in");
  }

  // Fetch user's connections (both accepted and pending)
  const { data: connectionsData, error: connectionsError } = await supabase
    .from("connections")
    .select("*")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .in("status", ["accepted", "pending"])
    .order("updated_at", { ascending: false });

  if (connectionsError) {
    console.error("Error fetching connections:", connectionsError);
  }

  // Fetch profiles for all connection participants
  let connections = [];
  if (connectionsData && connectionsData.length > 0) {
    const userIds = new Set<string>();
    connectionsData.forEach((conn) => {
      userIds.add(conn.requester_id);
      userIds.add(conn.addressee_id);
    });

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, name, avatar_url, id_verification")
      .in("id", Array.from(userIds));

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    // Combine connections with profile data
    connections = connectionsData.map((conn) => ({
      ...conn,
      requester: profiles?.find((p) => p.id === conn.requester_id),
      addressee: profiles?.find((p) => p.id === conn.addressee_id),
    }));
  }

  return (
    <ClientPageWrapper loadingText="Loading messages...">
      <MessagesPageClient initialConnections={connections} currentUser={user} />
    </ClientPageWrapper>
  );
}
