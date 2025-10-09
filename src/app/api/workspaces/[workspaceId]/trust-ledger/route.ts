import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    await requireAuth();
    const { workspaceId } = await params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "5");
    const offset = (page - 1) * pageSize;
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check membership in workspace
    const { data: workspaceMember, error: memberError } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (memberError || !workspaceMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Load entries for workspace with pagination
    const {
      data: trustEntries,
      error: trustError,
      count,
    } = await supabase
      .from("trust_ledger_entries")
      .select("*", { count: "exact" })
      .eq("workspace_id", workspaceId)
      .order("action_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (trustError) {
      return NextResponse.json(
        { error: "Failed to fetch trust ledger" },
        { status: 500 }
      );
    }

    // Member name map
    const memberMap: Map<string, string> = new Map();
    if (trustEntries && trustEntries.length > 0) {
      const uniqueUserIds = Array.from(
        new Set(trustEntries.map((e) => e.user_id))
      );
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", uniqueUserIds);
      profiles?.forEach((p) => {
        memberMap.set(
          p.id,
          (p as { name?: string; email: string }).name || p.email || "Unknown"
        );
      });
    }

    // Convert to activity format with AI-generated titles
    const activities = await Promise.all(
      (trustEntries || []).map(async (entry) => {
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

        // Generate AI title
        const aiTitle = await generateAITitle(
          entry,
          mappedType,
          meta,
          memberMap.get(entry.user_id) || "Unknown"
        );

        return {
          id: `trust_${entry.id}`,
          type: mappedType,
          actor: memberMap.get(entry.user_id) || "Unknown",
          action: aiTitle,
          description: formatDescription(entry.description, mappedType, meta),
          timestamp: entry.action_date || entry.created_at,
          verified: true,
          trustPoints: entry.trust_points || 0,
          metadata: entry.metadata || {},
        };
      })
    );

    const trustScores = calculateTrustScores(trustEntries || [], memberMap);
    const totalPages = Math.ceil((count || 0) / pageSize);

    // Generate AI insights and categories based on actual data
    const insights = await generateAIInsights(trustEntries || [], memberMap);
    const categories = generateTrustCategories(trustEntries || [], memberMap);

    return NextResponse.json({
      activities,
      trustScores,
      insights,
      categories,
      workspace: { id: workspaceId },
      pagination: {
        page,
        pageSize,
        totalPages,
        totalItems: count || 0,
      },
    });
  } catch (error) {
    console.error("Error in workspace trust ledger API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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

  const userEntries = new Map<string, TrustEntry[]>();
  trustEntries.forEach((entry) => {
    if (!userEntries.has(entry.user_id)) userEntries.set(entry.user_id, []);
    userEntries.get(entry.user_id)!.push(entry);
  });

  userEntries.forEach((entries, userId) => {
    const userName = memberMap.get(userId) || "Unknown";
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
      return ts <= endOfToday ? sum + (entry.trust_points || 0) : sum;
    }, 0);

    const previousTotal = entries.reduce((sum, entry) => {
      const ts = new Date(entry.action_date || entry.created_at).getTime();
      return ts <= endOfYesterday ? sum + (entry.trust_points || 0) : sum;
    }, 0);

    // Apply base score of 50 and cap between 0-100
    const baseScore = 50;
    const currentScore = Math.min(100, Math.max(0, baseScore + currentTotal));
    const previousScore = Math.min(100, Math.max(0, baseScore + previousTotal));

    scores[userName] = {
      score: currentScore,
      previousScore: previousScore,
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

// Removed unused formatAction function

async function generateAITitle(
  entry: TrustEntry,
  type: "task" | "document" | "milestone" | "general" | "trust_entry",
  meta: {
    task_title?: string;
    document_title?: string;
    document_type?: string;
    status?: string;
  },
  actorName: string
): Promise<string> {
  try {
    const prompt = `Generate a concise, natural title for a trust ledger activity. 

Activity Details:
- Actor: ${actorName}
- Action: ${entry.action}
- Type: ${type}
- Description: ${entry.description || "No description"}
- Task Title: ${meta.task_title || "N/A"}
- Document Title: ${meta.document_title || "N/A"}
- Document Type: ${meta.document_type || "N/A"}
- Status: ${meta.status || "N/A"}

Generate a title in this format: "${actorName} [action] - [description]"

Examples:
- "${actorName} completed task - Design homepage"
- "${actorName} uploaded document - Series A pitch deck"
- "${actorName} started task - User authentication system"

Response (just the title, no quotes or formatting):`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 50,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return (
      data.choices[0]?.message?.content?.trim() ||
      `${actorName} ${entry.action.replace(/_/g, " ")} - ${
        entry.description || "activity"
      }`
    );
  } catch (error) {
    console.error("Error generating AI title:", error);
    return `${actorName} ${entry.action.replace(/_/g, " ")} - ${
      entry.description || "activity"
    }`;
  }
}

function formatDescription(
  original: string | null | undefined,
  type: "task" | "document" | "milestone" | "general" | "trust_entry",
  meta: { task_title?: string; document_title?: string; document_type?: string }
) {
  if (original) return original;
  if (type === "task")
    return meta.task_title ? `Task: ${meta.task_title}` : "Task activity";
  if (type === "document") {
    const kind = meta.document_type || "Document";
    return meta.document_title
      ? `${kind}: ${meta.document_title}`
      : `${kind} activity`;
  }
  return "Trust activity";
}

async function generateAIInsights(
  trustEntries: TrustEntry[],
  memberMap: Map<string, string>
): Promise<
  Array<{
    id: string;
    type: "positive" | "warning" | "suggestion";
    title: string;
    description: string;
    category: string;
    priority: "low" | "medium" | "high";
  }>
> {
  try {
    if (trustEntries.length === 0) {
      return [
        {
          id: "1",
          type: "suggestion" as const,
          title: "No Activities Yet",
          description:
            "Start completing tasks and uploading documents to build your trust ledger.",
          category: "General",
          priority: "medium" as const,
        },
      ];
    }

    // Analyze the data
    const taskEntries = trustEntries.filter((e) => e.metadata?.type === "task");
    const documentEntries = trustEntries.filter(
      (e) => e.metadata?.type === "document"
    );
    const positiveEntries = trustEntries.filter(
      (e) => (e.trust_points || 0) > 0
    );
    const negativeEntries = trustEntries.filter(
      (e) => (e.trust_points || 0) < 0
    );

    const userStats = new Map<
      string,
      { tasks: number; documents: number; points: number }
    >();
    trustEntries.forEach((entry) => {
      const userId = entry.user_id;
      if (!userStats.has(userId)) {
        userStats.set(userId, { tasks: 0, documents: 0, points: 0 });
      }
      const stats = userStats.get(userId)!;
      if (entry.metadata?.type === "task") stats.tasks++;
      if (entry.metadata?.type === "document") stats.documents++;
      stats.points += entry.trust_points || 0;
    });

    const prompt = `Analyze this trust ledger data and generate EXACTLY 5 actionable insights. You must return exactly 5 insights, no more, no less.

Trust Ledger Data:
- Total Activities: ${trustEntries.length}
- Task Activities: ${taskEntries.length}
- Document Activities: ${documentEntries.length}
- Positive Trust Points: ${positiveEntries.length}
- Negative Trust Points: ${negativeEntries.length}

User Statistics:
${Array.from(userStats.entries())
  .map(
    ([userId, stats]) =>
      `- ${memberMap.get(userId) || "Unknown"}: ${stats.tasks} tasks, ${
        stats.documents
      } docs, ${stats.points} points`
  )
  .join("\n")}

Recent Activities (last 10):
${trustEntries
  .slice(0, 10)
  .map(
    (entry) =>
      `- ${memberMap.get(entry.user_id) || "Unknown"}: ${entry.action} (${
        entry.trust_points || 0
      } points)`
  )
  .join("\n")}

Generate EXACTLY 5 insights in this JSON format:
[
  {
    "id": "1",
    "type": "positive",
    "title": "Insight Title",
    "description": "Detailed description with **bold** and *italic* formatting",
    "category": "Execution",
    "priority": "medium"
  },
  {
    "id": "2",
    "type": "warning",
    "title": "Another Insight",
    "description": "Another detailed description",
    "category": "Collaboration",
    "priority": "high"
  },
  {
    "id": "3",
    "type": "suggestion",
    "title": "Third Insight",
    "description": "Third detailed description",
    "category": "Transparency",
    "priority": "low"
  },
  {
    "id": "4",
    "type": "positive",
    "title": "Fourth Insight",
    "description": "Fourth detailed description",
    "category": "General",
    "priority": "medium"
  },
  {
    "id": "5",
    "type": "suggestion",
    "title": "Fifth Insight",
    "description": "Fifth detailed description",
    "category": "Execution",
    "priority": "low"
  }
]

Focus on:
1. Performance patterns and trends
2. Collaboration balance
3. Areas for improvement
4. Positive achievements
5. Actionable recommendations

IMPORTANT: 
- Return exactly 5 insights
- Use different types (positive, warning, suggestion) and categories (Execution, Collaboration, Transparency, General)
- Return ONLY valid JSON, no markdown code blocks, no explanations, no extra text
- Start with [ and end with ]

Response (JSON only, no markdown):`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();

    if (content) {
      try {
        // Clean the content to remove markdown code blocks and extra formatting
        let cleanedContent = content.trim();

        // Remove markdown code blocks
        if (cleanedContent.startsWith("```json")) {
          cleanedContent = cleanedContent
            .replace(/^```json\s*/, "")
            .replace(/\s*```$/, "");
        } else if (cleanedContent.startsWith("```")) {
          cleanedContent = cleanedContent
            .replace(/^```\s*/, "")
            .replace(/\s*```$/, "");
        }

        // Remove any leading/trailing whitespace and newlines
        cleanedContent = cleanedContent.trim();

        console.log(
          "Cleaned AI response:",
          cleanedContent.substring(0, 200) + "..."
        );

        const insights = JSON.parse(cleanedContent);
        if (Array.isArray(insights) && insights.length >= 3) {
          return insights;
        } else {
          console.log("AI returned insufficient insights, using fallback");
        }
      } catch (parseError) {
        console.error("Error parsing AI insights JSON:", parseError);
        console.error("Raw content:", content.substring(0, 500));
      }
    }

    // Fallback insights - provide more variety
    const fallbackInsights: Array<{
      id: string;
      type: "positive" | "warning" | "suggestion";
      title: string;
      description: string;
      category: string;
      priority: "low" | "medium" | "high";
    }> = [
      {
        id: "1",
        type: "positive" as const,
        title: "Active Team",
        description: `Team has completed **${trustEntries.length} activities** with ${positiveEntries.length} positive contributions.`,
        category: "Collaboration",
        priority: "medium" as const,
      },
      {
        id: "2",
        type: "suggestion" as const,
        title: "Balance Activities",
        description: `Consider balancing task completion (${taskEntries.length}) with document sharing (${documentEntries.length}) for better transparency.`,
        category: "Transparency",
        priority: "low" as const,
      },
    ];

    // Add more insights based on data patterns
    if (negativeEntries.length > 0) {
      fallbackInsights.push({
        id: "3",
        type: "warning" as const,
        title: "Negative Activities Detected",
        description: `**${negativeEntries.length} activities** resulted in negative trust points. Review these items to improve team performance.`,
        category: "Execution",
        priority: "high" as const,
      });
    }

    if (taskEntries.length > documentEntries.length * 2) {
      fallbackInsights.push({
        id: "4",
        type: "suggestion" as const,
        title: "Increase Documentation",
        description: `Team is **task-heavy** (${taskEntries.length} tasks vs ${documentEntries.length} documents). Consider sharing more documentation for better transparency.`,
        category: "Transparency",
        priority: "medium" as const,
      });
    }

    // Add user contribution insights
    const topContributor = Array.from(userStats.entries()).reduce(
      (max, [userId, stats]) =>
        stats.points > max.points ? { userId, ...stats } : max,
      { userId: "", tasks: 0, documents: 0, points: 0 }
    );

    if (topContributor.userId && topContributor.points > 0) {
      fallbackInsights.push({
        id: "5",
        type: "positive" as const,
        title: "Top Contributor",
        description: `**${
          memberMap.get(topContributor.userId) || "Unknown"
        }** leads with ${topContributor.points} trust points from ${
          topContributor.tasks
        } tasks and ${topContributor.documents} documents.`,
        category: "Collaboration",
        priority: "low" as const,
      });
    }

    return fallbackInsights;
  } catch (error) {
    console.error("Error generating AI insights:", error);
    return [
      {
        id: "1",
        type: "suggestion" as const,
        title: "Trust Ledger Active",
        description: `Your team has **${trustEntries.length} activities** recorded. Keep up the good work!`,
        category: "General",
        priority: "medium" as const,
      },
    ];
  }
}

function generateTrustCategories(
  trustEntries: TrustEntry[],
  _memberMap: Map<string, string>
): Array<{
  id: string;
  name: string;
  score: number;
  maxScore: number;
  description: string;
  icon: string;
  activities: number;
  trend: "up" | "down" | "stable";
}> {
  // Calculate category metrics
  const taskEntries = trustEntries.filter((e) => e.metadata?.type === "task");
  const documentEntries = trustEntries.filter(
    (e) => e.metadata?.type === "document"
  );
  const _positiveEntries = trustEntries.filter(
    (e) => (e.trust_points || 0) > 0
  );
  const _negativeEntries = trustEntries.filter(
    (e) => (e.trust_points || 0) < 0
  );

  // Calculate execution score (task completion rate)
  const completedTasks = taskEntries.filter(
    (e) => e.metadata?.status === "completed"
  ).length;
  const executionScore =
    taskEntries.length > 0
      ? Math.round((completedTasks / taskEntries.length) * 100)
      : 0;

  // Calculate collaboration score (user participation balance)
  const userCount = new Set(trustEntries.map((e) => e.user_id)).size;
  const avgActivitiesPerUser =
    userCount > 0 ? trustEntries.length / userCount : 0;
  const collaborationScore = Math.min(
    100,
    Math.round(avgActivitiesPerUser * 10)
  );

  // Calculate transparency score (document sharing)
  const transparencyScore =
    documentEntries.length > 0 ? Math.min(100, documentEntries.length * 20) : 0;

  // Calculate overall trust score
  const totalPoints = trustEntries.reduce(
    (sum, e) => sum + (e.trust_points || 0),
    0
  );
  const trustScore = Math.max(0, Math.min(100, 50 + totalPoints));

  return [
    {
      id: "execution",
      name: "Execution",
      score: executionScore,
      maxScore: 100,
      description: "Task completion, deadline adherence, and delivery quality",
      icon: "🎯",
      activities: taskEntries.length,
      trend: completedTasks > taskEntries.length / 2 ? "up" : "stable",
    },
    {
      id: "collaboration",
      name: "Collaboration",
      score: collaborationScore,
      maxScore: 100,
      description: "Team coordination, communication, and contribution balance",
      icon: "🤝",
      activities: userCount,
      trend: userCount > 1 ? "up" : "stable",
    },
    {
      id: "transparency",
      name: "Transparency",
      score: transparencyScore,
      maxScore: 100,
      description: "Document sharing, updates, and information accessibility",
      icon: "📄",
      activities: documentEntries.length,
      trend: documentEntries.length > 0 ? "up" : "stable",
    },
    {
      id: "trust",
      name: "Trust Score",
      score: trustScore,
      maxScore: 100,
      description: "Overall trustworthiness based on all activities",
      icon: "🛡️",
      activities: trustEntries.length,
      trend: totalPoints > 0 ? "up" : totalPoints < 0 ? "down" : "stable",
    },
  ];
}
