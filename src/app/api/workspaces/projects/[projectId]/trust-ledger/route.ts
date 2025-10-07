import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

// Types for trust ledger domain
interface TrustEntry {
  id: string;
  user_id: string;
  action: string;
  description?: string | null;
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

    // Get trust ledger entries for this workspace
    const { data: trustEntries, error: trustError } = await supabase
      .from("trust_ledger_entries")
      .select("*")
      .eq("workspace_id", project.workspace_id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (trustError) {
      console.error("Error fetching trust ledger entries:", trustError);
      return NextResponse.json(
        { error: "Failed to fetch trust ledger" },
        { status: 500 }
      );
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

    // Generate AI-powered activity descriptions
    const activities = await generateActivityLog({
      trustEntries: trustEntries || [],
      tasks: tasks || [],
      documents: documents || [],
      memberMap,
      projectName: project.name,
    });

    // Calculate trust scores
    const trustScores = calculateTrustScores(trustEntries || [], memberMap);

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
    const totalPoints = entries.reduce(
      (sum, entry) => sum + (entry.trust_points || 0),
      0
    );

    // Simple scoring: base score + points earned
    const baseScore = 50;
    const currentScore = Math.min(100, baseScore + totalPoints);
    const previousScore = Math.max(0, currentScore - 5); // Mock previous score

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
