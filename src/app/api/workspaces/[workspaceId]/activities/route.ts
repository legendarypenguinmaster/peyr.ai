import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ActivityType = "project_created" | "invitation_sent" | "invitation_accepted";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');
    const offset = (page - 1) * limit;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = await params;

    // Ensure requester is a member
    const { data: membership } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
    if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Get recent project creations in this workspace
    const { data: createdProjects } = await supabase
      .from('workspace_projects')
      .select('id, name, created_by, workspace_id, created_at')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Invitations in this workspace (sent or accepted)
    const { data: invitations } = await supabase
      .from('workspace_invitations')
      .select('id, workspace_id, invited_user_id, invited_by, status, created_at, updated_at')
      .eq('workspace_id', workspaceId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    // Collect profile ids for names
    const profileIds = new Set<string>();
    for (const p of (createdProjects || [])) if (p.created_by) profileIds.add(p.created_by);
    for (const inv of (invitations || [])) {
      if (inv.invited_by) profileIds.add(inv.invited_by);
      if (inv.invited_user_id) profileIds.add(inv.invited_user_id);
    }
    const profiles: Record<string, { name: string | null }> = {};
    if (profileIds.size) {
      const { data: profs } = await supabase.from('profiles').select('id, name').in('id', Array.from(profileIds));
      for (const p of (profs || [])) profiles[p.id] = { name: p.name };
    }

    const activities: Array<{
      id: string;
      type: ActivityType;
      actor_name: string | null;
      invited_user_name?: string | null;
      project_name?: string | null;
      created_at: string;
      description: string;
    }> = [];

    for (const p of (createdProjects || [])) {
      activities.push({
        id: `prj-${p.id}`,
        type: 'project_created',
        actor_name: p.created_by ? (profiles[p.created_by]?.name || 'Someone') : 'Someone',
        project_name: p.name,
        created_at: p.created_at,
        description: `created project ${p.name}`,
      });
    }

    for (const inv of (invitations || [])) {
      const isAccepted = inv.status === 'accepted';
      activities.push({
        id: `inv-${inv.id}`,
        type: isAccepted ? 'invitation_accepted' : 'invitation_sent',
        actor_name: inv.invited_by ? (profiles[inv.invited_by]?.name || 'Someone') : 'Someone',
        invited_user_name: inv.invited_user_id ? (profiles[inv.invited_user_id]?.name || 'A user') : 'A user',
        created_at: isAccepted ? (inv.updated_at ?? inv.created_at) : inv.created_at,
        description: isAccepted ? `accepted an invite` : `sent an invite`,
      });
    }

    activities.sort((a, b) => (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    const total = activities.length;
    const paginated = activities.slice(offset, offset + limit);

    return NextResponse.json({ activities: paginated, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


