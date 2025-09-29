import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { 
    workspaceId, 
    name, 
    goal, 
    description, 
    deadline, 
    collaborators, 
    suggestedTasks, 
    customTasks 
  } = await request.json();

  if (!workspaceId || !name) {
    return NextResponse.json({ error: "Workspace ID and project name are required" }, { status: 400 });
  }

  try {
    // Create the project
    const { data: project, error: projectError } = await supabase
      .from('workspace_projects')
      .insert({
        workspace_id: workspaceId,
        name: name,
        description: description || goal,
        status: 'active',
        created_by: user.id,
        due_date: deadline || null
      })
      .select()
      .single();

    if (projectError) {
      console.error('Error creating project:', projectError);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    // Note: Project members functionality will be added when workspace_project_members table is created
    // For now, we'll just create the project and tasks

    // Build task inserts and assign task_id during insert to avoid RLS update
    const baseSlug = String(project.name || 'task').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const projShort = String(project.id).slice(0, 6);
    const basePrefix = `${baseSlug}-${projShort}`;
    const initialCountRes = await supabase
      .from('workspace_tasks')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', project.id);
    const startIndex = (initialCountRes.count || 0) + 1;

    type IncomingTask = { title: string; description?: string; dueDate?: string | null; assigneeId?: string | null };
    const builtSuggested = (suggestedTasks || []).map((task: IncomingTask, i: number) => ({
      workspace_id: workspaceId,
      project_id: project.id,
      title: task.title,
      description: task.description,
      status: 'todo',
      priority: 'medium',
      created_by: user.id,
      due_date: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      assigned_to: task.assigneeId || null,
      task_id: `${basePrefix}-${startIndex + i}`
    }));

    const filteredCustom = (customTasks || []).filter((t: IncomingTask) => t.title && t.title.trim());
    const builtCustom = filteredCustom.map((task: IncomingTask, i: number) => ({
      workspace_id: workspaceId,
      project_id: project.id,
      title: task.title,
      description: task.description || '',
      status: 'todo',
      priority: 'medium',
      created_by: user.id,
      due_date: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      assigned_to: task.assigneeId || null,
      task_id: `${basePrefix}-${startIndex + (builtSuggested.length) + i}`
    }));

    const allInserts = [...builtSuggested, ...builtCustom];
    if (allInserts.length > 0) {
      const { error: tasksInsertError } = await supabase
        .from('workspace_tasks')
        .insert(allInserts);
      if (tasksInsertError) {
        console.error('Error creating tasks:', tasksInsertError);
      }
    }

    // Log to Trust Ledger
    const { error: ledgerError } = await supabase
      .from('trust_ledger_entries')
      .insert({
        workspace_id: workspaceId,
        user_id: user.id,
        action: 'project_created',
        description: `Created project "${name}"`,
        trust_points: 5,
        metadata: {
          project_id: project.id,
          project_name: name,
          collaborators_count: collaborators?.length || 0,
          tasks_created: (suggestedTasks?.length || 0) + (customTasks?.length || 0)
        }
      });

    if (ledgerError) {
      console.error('Error logging to trust ledger:', ledgerError);
    }

    // Task ids assigned at insert, no backfill needed

    return NextResponse.json({
      message: 'Project created successfully',
      projectId: project.id,
      project
    }, { status: 201 });

  } catch (error) {
    console.error('Error in project creation:', error as Error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
