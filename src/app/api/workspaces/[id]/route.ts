import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface MemberItem {
  role: string;
  joined_at: string;
  user_id: string;
}

interface ProfileItem {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: workspace, error } = await supabase
      .from("workspaces")
      .select(`
        *,
        workspace_members!inner(user_id, role)
      `)
      .eq("id", id)
      .eq("workspace_members.user_id", user.id)
      .single();

    if (error || !workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Get all members of the workspace
    const { data: members, error: membersError } = await supabase
      .from("workspace_members")
      .select(`
        role,
        joined_at,
        user_id
      `)
      .eq("workspace_id", id);

    // Get member profiles separately
    let memberProfiles: Array<MemberItem & { profiles: ProfileItem }> = [];
    if (members && members.length > 0) {
      const userIds = members.map((m: MemberItem) => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", userIds);
      
      memberProfiles = members.map((member: MemberItem) => ({
        ...member,
        profiles: (profiles as ProfileItem[] | null | undefined)?.find((p) => p.id === member.user_id) || { id: member.user_id, name: "Unknown", avatar_url: null }
      }));
    }

    if (membersError) {
      console.error("Error fetching members:", membersError);
    }

    // Get workspace stats
    const [tasksResult, diagramsResult, documentsResult, meetingsResult] = await Promise.all([
      supabase.from("workspace_tasks").select("id").eq("workspace_id", id),
      supabase.from("workspace_diagrams").select("id").eq("workspace_id", id),
      supabase.from("workspace_documents").select("id").eq("workspace_id", id),
      supabase.from("workspace_meetings").select("id").eq("workspace_id", id)
    ]);

    const workspaceData = {
      ...workspace,
      members: memberProfiles || [],
      stats: {
        tasks: tasksResult.data?.length || 0,
        diagrams: diagramsResult.data?.length || 0,
        documents: documentsResult.data?.length || 0,
        meetings: meetingsResult.data?.length || 0
      }
    };

    return NextResponse.json(workspaceData);
  } catch (error) {
    console.error("Workspace detail API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
