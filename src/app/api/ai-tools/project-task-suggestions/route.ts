import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectName, goal, projectType, workspaceId, projectDescription, collaborators, deadline, workspaceName, workspaceDescription, currentDate } = await request.json();

  if (!projectName) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }

  try {
    // Fetch workspace context if available
    type WorkspaceRecord = { id: string; name: string; purpose: string; description: string | null; ai_features: unknown } | null;
    type MemberRecord = { user_id: string; role: string; profiles?: { id: string; name: string | null; email: string | null } | null };
    let workspaceContext: { workspace: WorkspaceRecord; members: MemberRecord[] | null } | null = null;
    if (workspaceId) {
      const { data: ws } = await supabase
        .from('workspaces')
        .select('id, name, purpose, description, ai_features')
        .eq('id', workspaceId)
        .single();

      const { data: members } = await supabase
        .from('workspace_members')
        .select('user_id, role, profiles(id, name, email)')
        .eq('workspace_id', workspaceId);

      workspaceContext = { workspace: ws as WorkspaceRecord, members: (members as unknown as MemberRecord[]) || [] };
    }

    // Fetch collaborator details from profiles + founders to guide assignment
    type CollaboratorProfile = { id: string; name: string | null; email: string | null; founders?: { skills?: string[] | null; industries?: string[] | null; commitment_level?: string | null }[] | null };
    let collaboratorsContext: CollaboratorProfile[] = [];
    if (Array.isArray(collaborators) && collaborators.length > 0) {
      const { data: collabProfiles } = await supabase
        .from('profiles')
        .select('id, name, email, founders(skills, industries, commitment_level)')
        .in('id', collaborators);
      collaboratorsContext = collabProfiles || [];
    }

    const prompt = `You are an AI project management assistant. Generate 5-8 initial tasks tailored to the user's workspace and project context.

PROJECT CONTEXT
- Project Name: ${projectName}
- Goal: ${goal || 'Not specified'}
- Project Type: ${projectType}
- Project Description: ${projectDescription || 'Not provided'}
- Current Date (YYYY-MM-DD): ${(currentDate || new Date().toISOString().slice(0,10))}
- Overall Deadline (YYYY-MM-DD): ${deadline || 'None'}
- Workspace Name: ${workspaceName || 'N/A'}
- Workspace Description: ${workspaceDescription || 'N/A'}
- Collaborators (with skills): ${JSON.stringify(collaboratorsContext)}

WORKSPACE CONTEXT (JSON)
${workspaceContext ? JSON.stringify(workspaceContext) : 'null'}

Guidelines:
- Use the workspace purpose (e.g., personal vs shared) to balance individual vs collaborative tasks
- If there are collaborators, include assignment-friendly tasks and kickoff/coordination steps
- Respect the project goal and type; propose practical, sequential tasks
- Prefer 5-8 tasks; for each task, return:
  - task_order: integer ordering starting at 1 in recommended sequence
  - task_id: slugified from project name like "+${projectName}+"-<task_order>
  - title: short imperative label
  - description: clear actionable details
  - status: one of ['todo','in_progress','review','completed'] (default 'todo')
  - priority: one of ['low','medium','high','urgent'] (default 'medium')
  - assigneeId: one of the collaborator ids (choose best fit from skills; include me if relevant); empty if none
  - dueDate: YYYY-MM-DD (distribute between current date and deadline; if no deadline, 2–6 weeks out based on complexity)

Return JSON: { "suggestions": [{ "task_order": number, "task_id": string, "title": string, "description": string, "status": string, "priority": string, "assigneeId": string, "dueDate": string }] }`;

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const rawResponse = chatCompletion.choices[0].message.content;
    const parsedResponse: { suggestions?: unknown; tasks?: unknown } = rawResponse ? JSON.parse(rawResponse) : { suggestions: [] };

    // Ensure we have the suggestions array
    const suggestions = (parsedResponse.suggestions as unknown[] | undefined) || (parsedResponse.tasks as unknown[] | undefined) || [];

    // Basic validation/cleanup of dueDate and assigneeId
    const validIds = new Set(Array.isArray(collaborators) ? collaborators : []);
    type AISuggestion = {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      task_order?: number;
      dueDate?: string;
      assigneeId?: string;
    };
    const cleaned = suggestions.map((s) => {
      const sug = s as AISuggestion;
      return {
        title: sug.title || 'Untitled',
        description: sug.description || '',
        status: ['todo','in_progress','review','completed'].includes(String(sug.status)) ? String(sug.status) : 'todo',
        priority: ['low','medium','high','urgent'].includes(String(sug.priority)) ? String(sug.priority) : 'medium',
        taskOrder: Number.isInteger(sug.task_order) ? sug.task_order : undefined,
        dueDate: typeof sug.dueDate === 'string' ? sug.dueDate : (deadline || null),
        assigneeId: (sug.assigneeId && validIds.has(sug.assigneeId)) ? sug.assigneeId : ''
      };
    });

    return NextResponse.json({ suggestions: cleaned }, { status: 200 });

  } catch (error) {
    const err = error as Error;
    console.error("Error generating task suggestions:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
