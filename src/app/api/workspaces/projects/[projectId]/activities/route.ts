import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = 'nodejs';

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
    const { data: tasks, error: tasksError, count: tasksCount } = await supabase
      .from('workspace_tasks')
      .select('id, title, created_at, created_by', { count: 'exact' })
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (tasksError) {
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }

    // Fetch recent file uploads for this project from meta table
    const pathPrefix = `${project.workspace_id}/${projectId}/`;
    const { data: filesMeta } = await supabase
      .from('project_files_meta')
      .select('path, uploader_id, created_at')
      .like('path', `${pathPrefix}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Fetch recent notes created for this project
    const { data: notesMeta } = await supabase
      .from('workspace_project_notes')
      .select('id, title, created_at, created_by')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Hydrate actor names for both tasks and files
    const creatorIds = Array.from(new Set([
      ...((tasks || []).map(t => t.created_by).filter(Boolean) as string[]),
      ...((filesMeta || []).map(f => f.uploader_id).filter(Boolean) as string[]),
      ...((notesMeta || []).map(n => n.created_by).filter(Boolean) as string[]),
    ]));
    const { data: creators } = creatorIds.length
      ? await supabase.from('profiles').select('id, name').in('id', creatorIds)
      : { data: [] as { id: string; name: string | null }[] } as const;
    const nameById: Record<string, string | null> = {};
    for (const c of (creators || [])) nameById[c.id] = c.name;

    const taskActivities = (tasks || []).map(t => ({
      id: `task-${t.id}`,
      type: 'task_created',
      actor_name: t.created_by ? (nameById[t.created_by] || 'Someone') : 'Someone',
      created_at: t.created_at,
      description: `Task created: ${t.title}`,
    }));

    const fileActivities = (filesMeta || []).map(f => ({
      id: `file-${f.path}`,
      type: 'file_uploaded',
      actor_name: f.uploader_id ? (nameById[f.uploader_id] || 'Someone') : 'Someone',
      created_at: f.created_at,
      description: `File uploaded: ${f.path.split('/').pop()}`,
    }));

    const noteActivities = (notesMeta || []).map(n => ({
      id: `note-${n.id}`,
      type: 'note_created',
      actor_name: n.created_by ? (nameById[n.created_by] || 'Someone') : 'Someone',
      created_at: n.created_at,
      description: `Note created: ${n.title}`,
    }));

    const activities = [...taskActivities, ...fileActivities, ...noteActivities]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);

    // Get total count for pagination
    const { count: filesCount } = await supabase
      .from('project_files_meta')
      .select('*', { count: 'exact', head: true })
      .like('path', `${pathPrefix}%`);

    const { count: notesCount } = await supabase
      .from('workspace_project_notes')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    const total = (tasksCount || 0) + (filesCount || 0) + (notesCount || 0);

    return NextResponse.json({
      activities,
      total,
      page,
      limit,
      totalPages: Math.ceil((total) / limit)
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


