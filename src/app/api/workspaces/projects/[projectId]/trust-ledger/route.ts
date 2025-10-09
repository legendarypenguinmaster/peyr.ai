import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

// Types for trust ledger domain
interface TrustEntry {
  id: string;
  workspace_id: string;
  project_id?: string | null;
  user_id: string;
  action: string;
  description?: string | null;
  action_date?: string | null;
  created_at: string;
  trust_points?: number | null;
  metadata?: Record<string, unknown> | null;
}

interface TaskEntry {
  id: string;
  title: string;
  status:
    | "todo"
    | "in_progress"
    | "review"
    | "completed"
    | "cancelled"
    | string;
  priority?: string | null;
  description?: string | null;
  assigned_to?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at?: string | null;
}

interface DocumentEntry {
  id: string;
  title: string;
  type: string;
  status?: string | null;
  created_by: string;
  content?: string | null;
  created_at: string;
  updated_at?: string | null;
}

type ActivityType =
  | "task"
  | "document"
  | "milestone"
  | "general"
  | "trust_entry";

interface Activity {
  id: string;
  type: ActivityType;
  actor: string;
  action: string;
  description?: string;
  timestamp: string;
  verified: boolean;
  trustPoints?: number;
  metadata?: Record<string, unknown>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    await requireAuth();
    const { projectId } = await params;
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get project details to find workspace_id
    const { data: project, error: projectError } = await supabase
      .from("workspace_projects")
      .select("workspace_id, name")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if user is a member of this workspace
    const { data: workspaceMember, error: memberError } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", project.workspace_id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (memberError || !workspaceMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if trust ledger entries already exist for this project
    const force = request.nextUrl.searchParams.get("force") === "1";
    const { data: existingEntries, error: existingError } = await supabase
      .from("trust_ledger_entries")
      .select("*")
      .eq("project_id", projectId)
      .order("action_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(50);

    if (existingError) {
      console.error(
        "Error checking existing trust ledger entries:",
        existingError
      );
      return NextResponse.json(
        { error: "Failed to check trust ledger" },
        { status: 500 }
      );
    }

    let trustEntries = existingEntries;

    // If no entries exist for this project, generate them from workspace activities
    if (force || !trustEntries || trustEntries.length === 0) {
      if (force && trustEntries && trustEntries.length > 0) {
        // Clear existing entries before regenerating
        const { error: delError } = await supabase
          .from("trust_ledger_entries")
          .delete()
          .eq("project_id", projectId);
        if (delError) {
          console.error(
            "Error clearing existing trust ledger entries:",
            delError
          );
          return NextResponse.json(
            { error: "Failed to reset trust ledger" },
            { status: 500 }
          );
        }
      }
      console.log(
        "No existing trust ledger entries found, generating new ones..."
      );

      // Get workspace activities to generate trust ledger entries
      const { data: workspaceTasks } = await supabase
        .from("workspace_tasks")
        .select("*")
        .eq("workspace_id", project.workspace_id)
        .order("updated_at", { ascending: false })
        .limit(100);

      const { data: workspaceDocuments } = await supabase
        .from("workspace_documents")
        .select("*")
        .eq("workspace_id", project.workspace_id)
        .order("updated_at", { ascending: false })
        .limit(100);

      // Generate trust ledger entries from activities
      const newEntries = await generateTrustLedgerEntries({
        projectId,
        workspaceId: project.workspace_id,
        tasks: workspaceTasks || [],
        documents: workspaceDocuments || [],
      });

      if (newEntries.length > 0) {
        // Store generated entries in database
        const { data: storedEntries, error: storeError } = await supabase
          .from("trust_ledger_entries")
          .insert(newEntries)
          .select();

        if (storeError) {
          console.error("Error storing trust ledger entries:", storeError);
          return NextResponse.json(
            { error: "Failed to store trust ledger entries" },
            { status: 500 }
          );
        }

        trustEntries = storedEntries;
      }
    }

    // Get recent tasks for this project
    const { data: tasks } = await supabase
      .from("workspace_tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("updated_at", { ascending: false })
      .limit(20);

    // Get recent documents for this workspace
    const { data: documents } = await supabase
      .from("workspace_documents")
      .select("*")
      .eq("workspace_id", project.workspace_id)
      .order("updated_at", { ascending: false })
      .limit(20);

    // Get all unique user IDs from activities
    const allUserIds = new Set<string>();

    // Add workspace members
    const { data: members } = await supabase
      .from("workspace_members")
      .select("user_id")
      .eq("workspace_id", project.workspace_id)
      .eq("status", "active");

    if (members) {
      members.forEach((member) => allUserIds.add(member.user_id));
    }

    // Add users from trust entries
    if (trustEntries) {
      trustEntries.forEach((entry) => allUserIds.add(entry.user_id));
    }

    // Add users from tasks
    if (tasks) {
      tasks.forEach((task) => {
        if (task.assigned_to) allUserIds.add(task.assigned_to);
        if (task.created_by) allUserIds.add(task.created_by);
      });
    }

    // Add users from documents
    if (documents) {
      documents.forEach((doc) => {
        if (doc.created_by) allUserIds.add(doc.created_by);
      });
    }

    // Get profiles for all unique user IDs
    const memberMap: Map<string, string> = new Map();
    if (allUserIds.size > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", Array.from(allUserIds));

      if (profiles) {
        profiles.forEach((profile) => {
          memberMap.set(profile.id, profile.name || profile.email || "Unknown");
        });
      }

      // Add fallback for missing profiles
      Array.from(allUserIds).forEach((userId) => {
        if (!memberMap.has(userId)) {
          memberMap.set(userId, `User ${userId.substring(0, 8)}`);
        }
      });
    }

    let activities;
    let trustScores;

    // If we have existing trust ledger entries, use them directly without AI generation
    if (trustEntries && trustEntries.length > 0) {
      console.log(
        "Using existing trust ledger entries, skipping AI generation"
      );

      // Convert trust entries to activity format
      activities = trustEntries.map((entry) => {
        const meta = (entry.metadata || {}) as {
          type?: string;
          task_title?: string;
          document_title?: string;
          document_type?: string;
          status?: string;
        };
        const mappedType =
          meta?.type === "task"
            ? ("task" as const)
            : meta?.type === "document"
            ? ("document" as const)
            : ("trust_entry" as const);
        const readableAction = getReadableAction(
          entry.action,
          mappedType,
          meta
        );
        const readableDescription = getReadableDescription(
          entry.description,
          mappedType,
          meta
        );
        return {
          id: `trust_${entry.id}`,
          type: mappedType,
          actor: memberMap.get(entry.user_id) || "Unknown",
          action: readableAction,
          description: readableDescription,
          timestamp: entry.action_date || entry.created_at,
          verified: true,
          trustPoints: entry.trust_points || 0,
          metadata: entry.metadata || {},
        };
      });

      // Calculate trust scores from existing entries
      trustScores = calculateTrustScores(trustEntries, memberMap);
    } else {
      // Generate AI-powered activity descriptions for new entries
      activities = await generateActivityLog({
        trustEntries: trustEntries || [],
        tasks: tasks || [],
        documents: documents || [],
        memberMap,
        projectName: project.name,
      });

      // Calculate trust scores
      trustScores = calculateTrustScores(trustEntries || [], memberMap);
    }

    return NextResponse.json({
      activities,
      trustScores,
      project: {
        id: projectId,
        name: project.name,
        workspace_id: project.workspace_id,
      },
    });
  } catch (error) {
    console.error("Error in trust ledger API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function generateActivityLog({
  trustEntries,
  tasks,
  documents,
  memberMap,
  projectName,
}: {
  trustEntries: TrustEntry[];
  tasks: TaskEntry[];
  documents: DocumentEntry[];
  memberMap: Map<string, string>;
  projectName: string;
}): Promise<Activity[]> {
  const activities: Activity[] = [];

  // Process trust ledger entries
  trustEntries.forEach((entry) => {
    const actorName = memberMap.get(entry.user_id) || "Unknown";
    activities.push({
      id: `trust_${entry.id}`,
      type: "trust_entry",
      actor: actorName,
      action: entry.action,
      description: entry.description ?? undefined,
      timestamp: entry.created_at,
      verified: true,
      trustPoints: entry.trust_points ?? undefined,
      metadata: entry.metadata ?? undefined,
    });
  });

  // Process task activities with AI-generated descriptions
  for (const task of tasks) {
    const userId = task.assigned_to || task.created_by;
    const actorName = memberMap.get(userId ?? "") || "Unknown";
    const statusText = getTaskStatusText(task.status);

    // Generate AI description for task
    const aiDescription = await generateAITaskDescription(
      task,
      actorName,
      projectName
    );

    activities.push({
      id: `task_${task.id}`,
      type: "task",
      actor: actorName,
      action: `${statusText} task: ${task.title}`,
      description: aiDescription,
      timestamp: task.updated_at || task.created_at,
      verified: task.status === "completed",
      trustPoints: task.status === "completed" ? 2 : 0,
      metadata: {
        taskId: task.id,
        status: task.status,
        priority: task.priority,
      },
    });
  }

  // Process document activities with AI-generated descriptions
  for (const doc of documents) {
    const actorName = memberMap.get(doc.created_by) || "Unknown";

    // Generate AI description for document
    const aiDescription = await generateAIDocumentDescription(
      doc,
      actorName,
      projectName
    );

    activities.push({
      id: `doc_${doc.id}`,
      type: "document",
      actor: actorName,
      action: `uploaded ${doc.type}: ${doc.title}`,
      description: aiDescription,
      timestamp: doc.updated_at || doc.created_at,
      verified: doc.status === "approved",
      trustPoints: doc.status === "approved" ? 3 : 1,
      metadata: {
        documentId: doc.id,
        type: doc.type,
        status: doc.status,
      },
    });
  }

  // Sort by timestamp and return most recent
  return activities
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 30);
}

async function generateAITaskDescription(
  task: TaskEntry,
  actorName: string,
  projectName: string
): Promise<string> {
  try {
    const prompt = `Generate a concise, professional description for a task activity in a startup project. 

Task Details:
- Title: ${task.title}
- Status: ${task.status}
- Priority: ${task.priority}
- Actor: ${actorName}
- Project: ${projectName}
- Description: ${task.description || "No description provided"}

Generate a 1-2 sentence description that:
1. Explains what was accomplished or attempted
2. Highlights the significance to the project
3. Uses professional, investor-friendly language
4. Is specific and actionable

Examples:
- "Successfully completed the user authentication system, establishing secure login functionality for the platform."
- "Initiated market research phase, gathering competitive intelligence to inform product positioning strategy."

Response (just the description, no quotes or formatting):`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    type OpenAIChatResponse = {
      choices: Array<{
        message?: { content?: string };
      }>;
    };
    const data: OpenAIChatResponse = await response.json();
    return (
      data.choices[0]?.message?.content?.trim() ||
      `Task ${task.status.toLowerCase()}: ${task.title}`
    );
  } catch (error) {
    console.error("Error generating AI task description:", error);
    return `Task ${task.status.toLowerCase()}: ${task.title}`;
  }
}

async function generateAIDocumentDescription(
  doc: DocumentEntry,
  actorName: string,
  projectName: string
): Promise<string> {
  try {
    const prompt = `Generate a concise, professional description for a document upload activity in a startup project.

Document Details:
- Title: ${doc.title}
- Type: ${doc.type}
- Status: ${doc.status}
- Actor: ${actorName}
- Project: ${projectName}
- Content Preview: ${
      doc.content
        ? doc.content.substring(0, 200) + "..."
        : "No content preview available"
    }

Generate a 1-2 sentence description that:
1. Explains the document's purpose and value
2. Highlights its significance to the project
3. Uses professional, investor-friendly language
4. Is specific and actionable

Examples:
- "Uploaded comprehensive market analysis document, providing data-driven insights for strategic decision making."
- "Shared legal framework documentation, establishing clear operational guidelines for the partnership."

Response (just the description, no quotes or formatting):`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    type OpenAIChatResponse = {
      choices: Array<{
        message?: { content?: string };
      }>;
    };
    const data: OpenAIChatResponse = await response.json();
    return (
      data.choices[0]?.message?.content?.trim() ||
      `Document uploaded: ${doc.title}`
    );
  } catch (error) {
    console.error("Error generating AI document description:", error);
    return `Document uploaded: ${doc.title}`;
  }
}

function getTaskStatusText(status: string): string {
  switch (status) {
    case "todo":
      return "Created";
    case "in_progress":
      return "Started";
    case "review":
      return "Submitted for review";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return "Updated";
  }
}

function calculateTrustScores(
  trustEntries: TrustEntry[],
  memberMap: Map<string, string>
) {
  const scores: Record<
    string,
    { score: number; previousScore: number; trend: string }
  > = {};

  // Group entries by user and calculate scores
  const userEntries = new Map<string, TrustEntry[]>();
  trustEntries.forEach((entry) => {
    if (!userEntries.has(entry.user_id)) {
      userEntries.set(entry.user_id, []);
    }
    userEntries.get(entry.user_id)!.push(entry);
  });

  userEntries.forEach((entries, userId) => {
    const userName = memberMap.get(userId) || "Unknown";
    // Cumulative totals: from start to today, and from start to yesterday
    const now = new Date();
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    ).getTime();
    const endOfYesterday = new Date(endOfToday - 24 * 60 * 60 * 1000).getTime();

    const currentTotal = entries.reduce((sum, entry) => {
      const ts = new Date(entry.action_date || entry.created_at).getTime();
      if (ts <= endOfToday) {
        return sum + (entry.trust_points || 0);
      }
      return sum;
    }, 0);

    const previousTotal = entries.reduce((sum, entry) => {
      const ts = new Date(entry.action_date || entry.created_at).getTime();
      if (ts <= endOfYesterday) {
        return sum + (entry.trust_points || 0);
      }
      return sum;
    }, 0);

    const currentScore = currentTotal;
    const previousScore = previousTotal;

    scores[userName] = {
      score: currentScore,
      previousScore,
      trend:
        currentScore > previousScore
          ? "up"
          : currentScore < previousScore
          ? "down"
          : "stable",
    };
  });

  return scores;
}

async function generateTrustLedgerEntries({
  projectId,
  workspaceId,
  tasks,
  documents,
}: {
  projectId: string;
  workspaceId: string;
  tasks: TaskEntry[];
  documents: DocumentEntry[];
}): Promise<Omit<TrustEntry, "id" | "created_at">[]> {
  const entries: Omit<TrustEntry, "id" | "created_at">[] = [];

  // Generate entries from tasks
  for (const task of tasks) {
    const userId = task.assigned_to || task.created_by;
    if (!userId) continue;

    const trustPoints = getTaskTrustPoints(task.status);
    const action = getTaskAction(task.status);

    entries.push({
      workspace_id: workspaceId,
      project_id: projectId,
      user_id: userId,
      action,
      description: `Task: ${task.title}`,
      trust_points: trustPoints,
      action_date: task.updated_at || task.created_at,
      metadata: {
        type: "task",
        task_id: task.id,
        task_title: task.title,
        status: task.status,
        priority: task.priority,
      },
    });
  }

  // Generate entries from documents
  for (const doc of documents) {
    const trustPoints = getDocumentTrustPoints(doc.status);
    const action = getDocumentAction(doc.status);

    entries.push({
      workspace_id: workspaceId,
      project_id: projectId,
      user_id: doc.created_by,
      action,
      description: `Document: ${doc.title}`,
      trust_points: trustPoints,
      action_date: doc.updated_at || doc.created_at,
      metadata: {
        type: "document",
        document_id: doc.id,
        document_type: doc.type,
        document_title: doc.title,
        status: doc.status,
      },
    });
  }

  return entries;
}

function getTaskTrustPoints(status: string): number {
  switch (status) {
    case "completed":
      return 3;
    case "in_progress":
      return 1;
    case "review":
      return 2;
    case "cancelled":
      return -1;
    default:
      return 0;
  }
}

function getTaskAction(status: string): string {
  switch (status) {
    case "completed":
      return "completed_task";
    case "in_progress":
      return "started_task";
    case "review":
      return "submitted_task_for_review";
    case "cancelled":
      return "cancelled_task";
    default:
      return "updated_task";
  }
}

function getDocumentTrustPoints(status?: string | null): number {
  switch (status) {
    case "approved":
      return 2;
    case "pending":
      return 1;
    case "rejected":
      return -1;
    default:
      return 1;
  }
}

function getDocumentAction(status?: string | null): string {
  switch (status) {
    case "approved":
      return "document_approved";
    case "pending":
      return "document_uploaded";
    case "rejected":
      return "document_rejected";
    default:
      return "document_uploaded";
  }
}

function getReadableAction(
  action: string,
  type: "task" | "document" | "milestone" | "general" | "trust_entry",
  meta: { task_title?: string; document_title?: string; document_type?: string }
): string {
  if (type === "task") {
    const title = meta.task_title ? `: ${meta.task_title}` : "";
    switch (action) {
      case "completed_task":
        return `completed task${title}`;
      case "started_task":
        return `started task${title}`;
      case "submitted_task_for_review":
        return `submitted task for review${title}`;
      case "cancelled_task":
        return `cancelled task${title}`;
      default:
        return `updated task${title}`;
    }
  }
  if (type === "document") {
    const title = meta.document_title ? `: ${meta.document_title}` : "";
    switch (action) {
      case "document_approved":
        return `approved document${title}`;
      case "document_uploaded":
        return `uploaded ${meta.document_type || "document"}${title}`;
      case "document_rejected":
        return `rejected document${title}`;
      default:
        return `updated document${title}`;
    }
  }
  return action.replace(/_/g, " ");
}

function getReadableDescription(
  original: string | null | undefined,
  type: "task" | "document" | "milestone" | "general" | "trust_entry",
  meta: { task_title?: string; document_title?: string; document_type?: string }
): string {
  if (original) return original;
  if (type === "task") {
    return meta.task_title ? `Task: ${meta.task_title}` : "Task activity";
  }
  if (type === "document") {
    const kind = meta.document_type || "Document";
    return meta.document_title
      ? `${kind}: ${meta.document_title}`
      : `${kind} activity`;
  }
  return "Trust activity";
}
