import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ActivityType = "workspace_created" | "project_created" | "invitation_sent" | "invitation_accepted";

interface ActivityItem {
  id: string;
  type: ActivityType;
  actor_id: string | null;
  actor_name: string | null;
  workspace_id: string | null;
  workspace_name: string | null;
  project_id?: string | null;
  project_name?: string | null;
  invited_user_id?: string | null;
  invited_user_name?: string | null;
  created_at: string;
  description: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');
    const offset = (page - 1) * limit;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // All workspaces the user belongs to
    const { data: memberships } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .eq('status', 'active');

    const workspaceIds = (memberships || []).map(m => m.workspace_id);

    // Fetch workspaces map for names
    const { data: workspacesData } = workspaceIds.length > 0
      ? await supabase
          .from('workspaces')
          .select('id, name')
          .in('id', workspaceIds)
      : { data: [] as { id: string; name: string }[] } as const;
    const workspaceNameById: Record<string, string> = {};
    for (const w of (workspacesData || [])) workspaceNameById[w.id] = w.name;

    // Profiles map helper
    async function getProfiles(ids: string[]): Promise<Record<string, { name: string | null }>> {
      if (ids.length === 0) return {};
      const { data } = await supabase.from('profiles').select('id, name').in('id', Array.from(new Set(ids)));
      const map: Record<string, { name: string | null }> = {};
      for (const p of (data || [])) map[p.id] = { name: p.name };
      return map;
    }

    // 1) Workspace creations (only those created by the user)
    const { data: createdWorkspaces } = await supabase
      .from('workspaces')
      .select('id, name, creator_id, created_at')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    // 2) Project creations within user's workspaces
    const { data: createdProjects } = workspaceIds.length > 0
      ? await supabase
          .from('workspace_projects')
          .select('id, name, created_by, workspace_id, created_at')
          .in('workspace_id', workspaceIds)
          .order('created_at', { ascending: false })
          .limit(limit)
      : { data: [] as { id: string; name: string; created_by: string | null; workspace_id: string; created_at: string }[] } as const;

    // 3) Invitations sent and accepted involving the user or in user's workspaces
    const { data: invitations } = workspaceIds.length > 0
      ? await supabase
          .from('workspace_invitations')
          .select('id, workspace_id, invited_user_id, invited_by, status, created_at, updated_at')
          .or(`invited_by.eq.${user.id},invited_user_id.eq.${user.id}`)
          .order('updated_at', { ascending: false })
          .limit(limit)
      : { data: [] as { id: string; workspace_id: string; invited_user_id: string | null; invited_by: string | null; status: string; created_at: string; updated_at: string | null }[] } as const;

    // Collect profile ids to hydrate names
    const profileIds = new Set<string>();
    for (const w of (createdWorkspaces || [])) if (w.creator_id) profileIds.add(w.creator_id);
    for (const p of (createdProjects || [])) if (p.created_by) profileIds.add(p.created_by);
    for (const inv of (invitations || [])) {
      if (inv.invited_by) profileIds.add(inv.invited_by);
      if (inv.invited_user_id) profileIds.add(inv.invited_user_id);
    }
    const profilesMap = await getProfiles(Array.from(profileIds));

    const activities: ActivityItem[] = [];

    for (const w of (createdWorkspaces || [])) {
      activities.push({
        id: `ws-${w.id}`,
        type: 'workspace_created',
        actor_id: w.creator_id || null,
        actor_name: w.creator_id ? (profilesMap[w.creator_id]?.name || 'Someone') : null,
        workspace_id: w.id,
        workspace_name: w.name,
        created_at: w.created_at,
        description: `${w.name} workspace created`,
      });
    }

    for (const p of (createdProjects || [])) {
      activities.push({
        id: `prj-${p.id}`,
        type: 'project_created',
        actor_id: p.created_by || null,
        actor_name: p.created_by ? (profilesMap[p.created_by]?.name || 'Someone') : null,
        workspace_id: p.workspace_id,
        workspace_name: p.workspace_id ? workspaceNameById[p.workspace_id] || null : null,
        project_id: p.id,
        project_name: p.name,
        created_at: p.created_at,
        description: `${p.name} project created`,
      });
    }

    for (const inv of (invitations || [])) {
      const isAccepted = inv.status === 'accepted';
      activities.push({
        id: `inv-${inv.id}`,
        type: isAccepted ? 'invitation_accepted' : 'invitation_sent',
        actor_id: inv.invited_by || null,
        actor_name: inv.invited_by ? (profilesMap[inv.invited_by]?.name || 'Someone') : null,
        workspace_id: inv.workspace_id,
        workspace_name: inv.workspace_id ? workspaceNameById[inv.workspace_id] || null : null,
        invited_user_id: inv.invited_user_id || null,
        invited_user_name: inv.invited_user_id ? (profilesMap[inv.invited_user_id]?.name || 'User') : null,
        created_at: isAccepted ? (inv.updated_at ?? inv.created_at) : inv.created_at,
        description: isAccepted ? `Invitation accepted` : `Invitation sent`,
      });
    }

    // Sort newest first
    activities.sort((a, b) => (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    
    // Apply pagination
    const paginatedActivities = activities.slice(offset, offset + limit);
    const total = activities.length;

    return NextResponse.json({ 
      activities: paginatedActivities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


