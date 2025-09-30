import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceId, projectId, title, description, status, priority, assignedTo, dueDate } = await request.json();
  if (!workspaceId || !title) return NextResponse.json({ error: "workspaceId and title are required" }, { status: 400 });

  const safeStatus = (status && ['todo','in_progress','review','completed','cancelled'].includes(status)) ? status : 'todo';
  const safePriority = (priority && ['low','medium','high','urgent'].includes(priority)) ? priority : 'medium';

  try {
    const baseSlug = String(title || 'task').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload = [{
      workspace_id: workspaceId,
      project_id: projectId || null,
      title,
      description: description || null,
      status: safeStatus,
      priority: safePriority,
      assigned_to: assignedTo || null,
      created_by: user.id,
      due_date: dueDate || null,
      task_id: baseSlug,
    }];

    const { data: task, error } = await supabase
      .from('workspace_tasks')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;

    // Backfill task_id for the created task (best-effort)
    if (task) {
      // fetch project name
      let baseSlug = 'task';
      if (task.project_id) {
        const { data: proj } = await supabase
          .from('workspace_projects')
          .select('name')
          .eq('id', task.project_id)
          .single();
        if (proj?.name) baseSlug = String(proj.name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }

      // compute index within project by created_at order
      const { data: siblings } = await supabase
        .from('workspace_tasks')
        .select('id, created_at')
        .eq('project_id', task.project_id)
        .order('created_at', { ascending: true });
      const idx = Math.max(1, (siblings || []).findIndex(t => t.id === task.id) + 1);
      const taskKey = `${baseSlug}-${idx}`;
      await supabase.from('workspace_tasks').update({ task_id: taskKey }).eq('id', task.id);
      (task as { task_id?: string }).task_id = taskKey;
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (e) {
    console.error('Error creating task:', e as Error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { taskId, taskKey } = body;
  if (!taskId && !taskKey) return NextResponse.json({ error: "taskId or taskKey is required" }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (body.status) {
    const allowed = ['todo','in_progress','review','completed','cancelled'];
    if (!allowed.includes(body.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    update.status = body.status;
  }
  if (body.title !== undefined) update.title = body.title;
  if (body.description !== undefined) update.description = body.description;
  if (body.priority) {
    const allowedP = ['low','medium','high','urgent'];
    if (!allowedP.includes(body.priority)) return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
    update.priority = body.priority;
  }
  if (body.assignedTo !== undefined) update.assigned_to = body.assignedTo || null;
  if (body.dueDate !== undefined) update.due_date = body.dueDate || null;

  try {
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    let query = supabase
      .from('workspace_tasks')
      .update(update);

    if (taskId) {
      query = query.eq('id', taskId);
    } else if (taskKey) {
      query = query.eq('task_id', taskKey);
    }

    const { data, error } = await query.select('id, status').maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    return NextResponse.json({ task: data }, { status: 200 });
  } catch (e) {
    console.error('Error updating task status:', e as Error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId, taskKey } = await request.json();
  if (!taskId && !taskKey) return NextResponse.json({ error: "taskId or taskKey is required" }, { status: 400 });

  try {
    const query = supabase.from('workspace_tasks').delete();
    if (taskId) query.eq('id', taskId);
    else if (taskKey) query.eq('task_id', taskKey);
    const { error } = await query;
    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error('Error deleting task:', e as Error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}


