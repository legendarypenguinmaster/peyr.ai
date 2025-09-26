import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { taskId, newStatus, overTaskId } = await request.json();

    if (!taskId || !newStatus || !overTaskId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all tasks in the destination column
    const { data: tasksInColumn, error: fetchError } = await supabase
      .from("workspace_tasks")
      .select("id, task_order")
      .eq("workspace_id", id)
      .eq("status", newStatus)
      .order("task_order", { ascending: true });

    if (fetchError) {
      console.error("Error fetching tasks:", fetchError);
      return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }

    if (!tasksInColumn || tasksInColumn.length === 0) {
      return NextResponse.json({ error: "No tasks found in destination column" }, { status: 404 });
    }

    // Find the index of the task we're dropping over
    const overIndex = tasksInColumn.findIndex(t => t.id === overTaskId);
    if (overIndex === -1) {
      return NextResponse.json({ error: "Over task not found" }, { status: 404 });
    }

    // First, update the moved task's status
    const { error: statusUpdateError } = await supabase
      .from("workspace_tasks")
      .update({ status: newStatus })
      .eq("id", taskId);

    if (statusUpdateError) {
      console.error("Error updating task status:", statusUpdateError);
      return NextResponse.json({ error: "Failed to update task status" }, { status: 500 });
    }

    // Create new array with the moved task inserted at the correct position
    const reorderedTasks = [...tasksInColumn];
    // Remove the moved task if it was already in this column (shouldn't happen but just in case)
    const existingIndex = reorderedTasks.findIndex(t => t.id === taskId);
    if (existingIndex !== -1) {
      reorderedTasks.splice(existingIndex, 1);
    }
    // Insert at the over position
    reorderedTasks.splice(overIndex, 0, { id: taskId, task_order: 0 }); // temp order

    // Update task_order for all tasks in the column
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
    console.error("Error in move task with position:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
