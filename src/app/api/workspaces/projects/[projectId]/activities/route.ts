import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;

    // Ensure user is a member of the workspace for this project
    const { data: project, error: projectError } = await supabase
      .from('workspace_projects')
      .select('id, name, workspace_id')
      .eq('id', projectId)
      .single();
    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { data: membership } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', project.workspace_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch recent task creations for this project
    const { data: tasks, error: tasksError } = await supabase
      .from('workspace_tasks')
      .select('id, title, created_at, created_by')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (tasksError) {
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }

    // Hydrate creator names
    const creatorIds = Array.from(new Set((tasks || []).map(t => t.created_by).filter(Boolean))) as string[];
    const { data: creators } = creatorIds.length
      ? await supabase.from('profiles').select('id, name').in('id', creatorIds)
      : { data: [] as { id: string; name: string | null }[] } as const;
    const nameById: Record<string, string | null> = {};
    for (const c of (creators || [])) nameById[c.id] = c.name;

    const activities = (tasks || []).map(t => ({
      id: `task-${t.id}`,
      type: 'task_created',
      actor_name: t.created_by ? (nameById[t.created_by] || 'Someone') : 'Someone',
      created_at: t.created_at,
      description: `Task created: ${t.title}`,
    }));

    // Get total count for pagination
    const { count } = await supabase
      .from('workspace_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    return NextResponse.json({
      activities,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil(((count || 0)) / limit)
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


