import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { draggedTaskId, overTaskId, status } = await request.json();

    if (!draggedTaskId || !overTaskId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all tasks in the same status column
    const { data: tasks, error: fetchError } = await supabase
      .from("workspace_tasks")
      .select("id, task_order")
      .eq("workspace_id", id)
      .eq("status", status)
      .order("task_order", { ascending: true });

    if (fetchError) {
      console.error("Error fetching tasks:", fetchError);
      return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ error: "No tasks found" }, { status: 404 });
    }

    // Find the indices of the dragged and over tasks
    const draggedIndex = tasks.findIndex(t => t.id === draggedTaskId);
    const overIndex = tasks.findIndex(t => t.id === overTaskId);

    if (draggedIndex === -1 || overIndex === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Reorder the tasks array
    const reorderedTasks = [...tasks];
    const [draggedTask] = reorderedTasks.splice(draggedIndex, 1);
    reorderedTasks.splice(overIndex, 0, draggedTask);

    // Update task_order for all affected tasks individually
    for (let i = 0; i < reorderedTasks.length; i++) {
      const task = reorderedTasks[i];
      const { error: updateError } = await supabase
        .from("workspace_tasks")
        .update({ task_order: i + 1 })
        .eq("id", task.id);

      if (updateError) {
        console.error("Error updating task order:", updateError);
        return NextResponse.json({ error: "Failed to update task order" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in reorder tasks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
