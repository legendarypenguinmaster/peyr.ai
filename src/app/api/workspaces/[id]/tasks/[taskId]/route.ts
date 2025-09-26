import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { id, taskId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    type TaskStatus = "todo" | "in_progress" | "review" | "done";
    type TaskPriority = "low" | "medium" | "high" | "urgent";
    type UpdatePayload = {
      updated_at: string;
      status?: TaskStatus;
      title?: string;
      description?: string;
      priority?: TaskPriority;
      due_date?: string | null;
      assignee_id?: string | null;
    };

    const update: UpdatePayload = { updated_at: new Date().toISOString() };

    // Allow partial updates
    if (body.status) {
      const allowed = new Set(["todo", "in_progress", "review", "done"]);
      if (!allowed.has(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      update.status = body.status;
    }
    if (typeof body.title === "string") update.title = body.title;
    if (typeof body.description === "string") update.description = body.description;
    if (typeof body.priority === "string") update.priority = body.priority;
    if (body.due_date !== undefined) update.due_date = body.due_date; // string or null
    if (body.assignee_id !== undefined) update.assignee_id = body.assignee_id; // uuid or null

    if (Object.keys(update).length === 1) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { data: task, error } = await supabase
      .from("workspace_tasks")
      .update(update)
      .eq("id", taskId)
      .eq("workspace_id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating task:", error);
      return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Update task API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
