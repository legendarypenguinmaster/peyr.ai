import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

type MemberInput = { profiles: { full_name: string }; role: string };
type ProjectInput = {
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
};
type DocumentInput = {
  title: string;
  type: string;
  created_at: string;
  updated_at: string;
};
type TaskInput = {
  title: string;
  status: string;
  due_date: string;
  created_at: string;
  updated_at: string;
};

interface StructuredAnalysis {
  executiveSummary: string;
  achievements: string[];
  risks: string[];
  opportunities: string[];
  collaboration: string[];
  investorReadiness: string[];
  recommendedActions: string[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const {
      workspaceId,
      members,
      projects,
      documents,
      tasks,
      force,
    }: {
      workspaceId: string;
      members: MemberInput[];
      projects: ProjectInput[];
      documents: DocumentInput[];
      tasks: TaskInput[];
      force?: boolean;
    } = await request.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 }
      );
    }

    // Prepare data for AI analysis
    const workspaceData = {
      members: members.map((m: MemberInput) => ({
        name: m.profiles.full_name,
        role: m.role,
      })),
      projects: projects.map((p: ProjectInput) => ({
        name: p.name,
        status: p.status,
        created_at: p.created_at,
        updated_at: p.updated_at,
      })),
      documents: documents.map((d: DocumentInput) => ({
        title: d.title,
        type: d.type,
        created_at: d.created_at,
        updated_at: d.updated_at,
      })),
      tasks: tasks.map((t: TaskInput) => ({
        title: t.title,
        status: t.status,
        due_date: t.due_date,
        created_at: t.created_at,
        updated_at: t.updated_at,
      })),
    };

    // Calculate key metrics
    const completedTasks = tasks.filter(
      (t: { status: string }) => t.status === "completed"
    ).length;
    const totalTasks = tasks.length;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const overdueTasks = tasks.filter(
      (t: { status: string; due_date: string }) =>
        t.status !== "completed" && new Date(t.due_date) < new Date()
    ).length;

    const recentDocuments = documents.filter(
      (d: { updated_at: string }) =>
        new Date(d.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    const activeProjects = projects.filter(
      (p: { status: string }) => p.status === "active"
    ).length;
    const completedProjects = projects.filter(
      (p: { status: string }) => p.status === "completed"
    ).length;

    // Create comprehensive prompt for AI analysis
    const prompt = `You are an AI business analyst specializing in startup and workspace intelligence. Analyze the following workspace data and provide comprehensive insights across all key areas.

WORKSPACE DATA:
- Team Members: ${workspaceData.members.length} members (${workspaceData.members
      .map((m) => `${m.name} (${m.role})`)
      .join(", ")})
- Projects: ${
      projects.length
    } total (${activeProjects} active, ${completedProjects} completed)
- Documents: ${documents.length} total (${recentDocuments} updated this week)
- Tasks: ${totalTasks} total (${completedTasks} completed, ${overdueTasks} overdue)
- Task Completion Rate: ${completionRate}%

KEY METRICS:
- Task completion rate: ${completionRate}%
- Overdue tasks: ${overdueTasks}
- Recent document activity: ${recentDocuments} documents this week
- Active projects: ${activeProjects}
- Team size: ${members.length}

Please provide a comprehensive analysis with the following structure:

1. EXECUTIVE SUMMARY (2-3 sentences)
2. ACHIEVEMENTS & STRENGTHS (3-4 key points)
3. RISKS & CONCERNS (3-4 key points)
4. GROWTH OPPORTUNITIES (3-4 key points)
5. COLLABORATION INSIGHTS (2-3 key points)
6. INVESTOR READINESS ASSESSMENT (2-3 key points)
7. RECOMMENDED ACTIONS (3-4 priority actions)

Focus on:
- Execution capability and milestone delivery
- Team dynamics and collaboration patterns
- Documentation and transparency practices
- Risk management and investor confidence
- Strategic opportunities for growth
- Areas needing immediate attention

Provide actionable, specific insights that would be valuable for founders and investors. Be direct but constructive in your analysis.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert business analyst and startup advisor with deep experience in venture capital, team dynamics, and operational excellence. Provide clear, actionable insights that help founders make better decisions and build investor confidence.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const aiAnalysis = completion.choices[0]?.message?.content || "";

    // Parse the AI response into structured sections
    const sections = aiAnalysis.split(/\d+\.\s+([A-Z\s&]+)/);
    const structuredAnalysis: StructuredAnalysis = {
      executiveSummary: "",
      achievements: [],
      risks: [],
      opportunities: [],
      collaboration: [],
      investorReadiness: [],
      recommendedActions: [],
    };

    // Extract sections
    for (let i = 1; i < sections.length; i += 2) {
      const sectionTitle = sections[i]?.trim();
      const sectionContent = sections[i + 1]?.trim();

      if (sectionTitle && sectionContent) {
        switch (sectionTitle.toUpperCase()) {
          case "EXECUTIVE SUMMARY":
            structuredAnalysis.executiveSummary = sectionContent;
            break;
          case "ACHIEVEMENTS & STRENGTHS":
            structuredAnalysis.achievements = sectionContent
              .split("\n")
              .filter((line) => line.trim().startsWith("-"))
              .map((line) => line.replace(/^-\s*/, "").trim());
            break;
          case "RISKS & CONCERNS":
            structuredAnalysis.risks = sectionContent
              .split("\n")
              .filter((line) => line.trim().startsWith("-"))
              .map((line) => line.replace(/^-\s*/, "").trim());
            break;
          case "GROWTH OPPORTUNITIES":
            structuredAnalysis.opportunities = sectionContent
              .split("\n")
              .filter((line) => line.trim().startsWith("-"))
              .map((line) => line.replace(/^-\s*/, "").trim());
            break;
          case "COLLABORATION INSIGHTS":
            structuredAnalysis.collaboration = sectionContent
              .split("\n")
              .filter((line) => line.trim().startsWith("-"))
              .map((line) => line.replace(/^-\s*/, "").trim());
            break;
          case "INVESTOR READINESS ASSESSMENT":
            structuredAnalysis.investorReadiness = sectionContent
              .split("\n")
              .filter((line) => line.trim().startsWith("-"))
              .map((line) => line.replace(/^-\s*/, "").trim());
            break;
          case "RECOMMENDED ACTIONS":
            structuredAnalysis.recommendedActions = sectionContent
              .split("\n")
              .filter((line) => line.trim().startsWith("-"))
              .map((line) => line.replace(/^-\s*/, "").trim());
            break;
        }
      }
    }

    // Persist to database (upsert by workspace_id)
    // Read current record to avoid overwriting with empty fields when not forced
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("workspace_ai_insights")
      .select(
        "executive_summary, achievements, risks, opportunities, collaboration, investor_readiness, recommended_actions, raw_analysis, metrics"
      )
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    const upsertPayload = {
      workspace_id: workspaceId,
      executive_summary:
        structuredAnalysis.executiveSummary ||
        (!force ? existing?.executive_summary : undefined),
      achievements: structuredAnalysis.achievements?.length
        ? structuredAnalysis.achievements
        : !force
        ? existing?.achievements
        : undefined,
      risks: structuredAnalysis.risks?.length
        ? structuredAnalysis.risks
        : !force
        ? existing?.risks
        : undefined,
      opportunities: structuredAnalysis.opportunities?.length
        ? structuredAnalysis.opportunities
        : !force
        ? existing?.opportunities
        : undefined,
      collaboration: structuredAnalysis.collaboration?.length
        ? structuredAnalysis.collaboration
        : !force
        ? existing?.collaboration
        : undefined,
      investor_readiness: structuredAnalysis.investorReadiness?.length
        ? structuredAnalysis.investorReadiness
        : !force
        ? existing?.investor_readiness
        : undefined,
      recommended_actions: structuredAnalysis.recommendedActions?.length
        ? structuredAnalysis.recommendedActions
        : !force
        ? existing?.recommended_actions
        : undefined,
      raw_analysis: aiAnalysis || (!force ? existing?.raw_analysis : undefined),
      metrics: {
        completionRate,
        overdueTasks,
        recentDocuments,
        activeProjects,
        teamSize: members.length,
      },
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from("workspace_ai_insights")
      .upsert(upsertPayload, { onConflict: "workspace_id" });

    if (upsertError) {
      console.error("Failed to upsert AI insights:", upsertError);
    }

    return NextResponse.json({
      success: true,
      analysis: structuredAnalysis,
      rawAnalysis: aiAnalysis,
      metrics: upsertPayload.metrics,
    });
  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze workspace data" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("workspace_ai_insights")
      .select(
        "executive_summary, achievements, risks, opportunities, collaboration, investor_readiness, recommended_actions, raw_analysis, metrics, generated_at, updated_at"
      )
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch AI insights:", error);
      return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ exists: false }, { status: 404 });
    }

    return NextResponse.json({ exists: true, ...data }, { status: 200 });
  } catch (e) {
    console.error("GET AI insights error:", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
