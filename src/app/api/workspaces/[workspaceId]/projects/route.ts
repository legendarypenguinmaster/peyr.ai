import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = await params;

    // Ensure user is a member of the workspace
    const { data: membership } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch projects for this workspace
    const { data: projects, error: projectsError } = await supabase
      .from('workspace_projects')
      .select('id, name, description, created_at, due_date, status')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('workspace_projects')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId);

    return NextResponse.json({
      projects: projects || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('Error fetching workspace projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
