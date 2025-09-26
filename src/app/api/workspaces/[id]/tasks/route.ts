import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: tasks, error } = await supabase
      .from("workspace_tasks")
      .select("*")
      .eq("workspace_id", id)
      .order("task_order", { ascending: true });

    if (error) {
      console.error("Error fetching tasks:", error);
      return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }

    // Fetch assignee profiles separately
    const tasksWithAssignees = await Promise.all(
      tasks.map(async (task) => {
        if (task.assignee_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, avatar_url")
            .eq("id", task.assignee_id)
            .single();
          
          return {
            ...task,
            assignee: profile
          };
        }
        return task;
      })
    );

    return NextResponse.json(tasksWithAssignees);
  } catch (error) {
    console.error("Tasks API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, status, due_date, priority, assignee_id } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Generate ticket number
    const { data: lastTask } = await supabase
      .from("workspace_tasks")
      .select("ticket_number")
      .eq("workspace_id", id)
      .order("created_at", { ascending: false })
      .limit(1);

    let ticketNumber = "TASK-001";
    if (lastTask && lastTask.length > 0) {
      const lastNumber = parseInt(lastTask[0].ticket_number.split('-')[1]);
      ticketNumber = `TASK-${String(lastNumber + 1).padStart(3, '0')}`;
    }

    // Get the next order number for the status
    const { data: lastOrderTask } = await supabase
      .from("workspace_tasks")
      .select("task_order")
      .eq("workspace_id", id)
      .eq("status", status || "todo")
      .order("task_order", { ascending: false })
      .limit(1);

    const nextOrder = lastOrderTask && lastOrderTask.length > 0 ? lastOrderTask[0].task_order + 1 : 1;

    // Create basic task data
    const taskData = {
      workspace_id: id,
      title,
      description: description || "",
      status: status || "todo",
      assignee_id: assignee_id || null,
      created_by: user.id,
      task_order: nextOrder
    };

    // Try to insert with new fields first, fallback to basic if columns don't exist
    let { data: task, error } = await supabase
      .from("workspace_tasks")
      .insert({
        ...taskData,
        due_date: due_date || null,
        priority: priority || "medium",
        ticket_number: ticketNumber,
      })
      .select("*")
      .single();

    // If error due to missing columns, try with basic fields only
    if (error && error.code === 'PGRST204') {
      console.log("New columns not available, creating basic task");
      const basicTaskData = {
        workspace_id: id,
        title,
        description: description || "",
        status: status || "todo",
        assignee_id: assignee_id || null,
        created_by: user.id
      };
      
      const result = await supabase
        .from("workspace_tasks")
        .insert(basicTaskData)
        .select("*")
        .single();
      
      task = result.data;
      error = result.error;
    }

    if (error) {
      console.error("Error creating task:", error);
      return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
    }

    // Fetch assignee profile if exists
    let taskWithAssignee = task;
    if (task.assignee_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", task.assignee_id)
        .single();
      
      taskWithAssignee = {
        ...task,
        assignee: profile
      };
    }

    return NextResponse.json(taskWithAssignee);
  } catch (error) {
    console.error("Create task API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
