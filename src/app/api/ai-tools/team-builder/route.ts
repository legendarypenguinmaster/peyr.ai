import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { projectId, roles } = await req.json();
    if (!projectId || !Array.isArray(roles)) {
      return NextResponse.json({ error: "projectId and roles required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: project, error } = await supabase
      .from("projects")
      .select("id,title,description,industry,stage,commitment,role_needed,required_skills")
      .eq("id", projectId)
      .single();
    if (error || !project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const prompt = `You are a senior startup advisor. Analyze the project and the current team roles, and suggest missing roles.
Project: ${JSON.stringify(project)}
Current roles: ${JSON.stringify(roles)}

Return JSON with fields:
{
  "summary": "short overview of strengths and gaps",
  "suggestions": ["Role 1 with reason", "Role 2 with reason", "Role 3 with reason"]
}
Return only JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Respond with valid JSON only. No markdown." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    let text = completion.choices[0]?.message?.content?.trim() || "{}";
    if (text.startsWith("```")) {
      text = text.replace(/^```json\s*/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    }
    let json: { summary: string; suggestions: string[] } = { summary: "", suggestions: [] };
    try { json = JSON.parse(text); } catch { return NextResponse.json({ error: "AI parsing failed" }, { status: 500 }); }

    return NextResponse.json(json);
  } catch (e) {
    console.error("team-builder error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


