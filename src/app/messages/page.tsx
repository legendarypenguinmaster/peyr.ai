import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import MessagesPageClient from "./MessagesPageClient";

export default async function MessagesPage() {
  const user = await requireAuth();

  const supabase = await createClient();

  // Fetch user's connections (both accepted and pending)
  const { data: connections, error: connectionsError } = await supabase
    .from("connections")
    .select("*")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .in("status", ["accepted", "pending"])
    .order("updated_at", { ascending: false });

  if (connectionsError) {
    console.error("Error fetching connections:", connectionsError);
  }

  // Fetch profile data for all users in connections
  let connectionsWithProfiles = [];
  if (connections && connections.length > 0) {
    const userIds = new Set<string>();
    connections.forEach((conn) => {
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

    // Join connections with profiles
    connectionsWithProfiles = connections.map((conn) => ({
      ...conn,
      requester: profiles?.find((p) => p.id === conn.requester_id) || {
        id: conn.requester_id,
        name: null,
        avatar_url: null,
        id_verification: false,
      },
      addressee: profiles?.find((p) => p.id === conn.addressee_id) || {
        id: conn.addressee_id,
        name: null,
        avatar_url: null,
        id_verification: false,
      },
    }));
  }

  // Fetch unread message counts for each connection
  const connectionIds = connections?.map((c) => c.id) || [];
  let unreadCounts: Record<string, number> = {};

  if (connectionIds.length > 0) {
    const { data: unreadData, error: unreadError } = await supabase
      .from("messages")
      .select("connection_id")
      .in("connection_id", connectionIds)
      .eq("receiver_id", user.id)
      .eq("is_read", false);

    if (!unreadError && unreadData) {
      unreadCounts = unreadData.reduce((acc, msg) => {
        acc[msg.connection_id] = (acc[msg.connection_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    }
  }

  return (
    <MessagesPageClient
      initialConnections={connectionsWithProfiles}
      unreadCounts={unreadCounts}
      currentUserId={user.id}
    />
  );
}
