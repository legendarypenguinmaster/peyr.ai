import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Load mentor profile and mentors row
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, name, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "mentor") {
      return NextResponse.json({ projects: [] });
    }

    const { data: mentor } = await supabase
      .from("mentors")
      .select("*")
      .eq("id", user.id)
      .single();

    // First check cached recommendations
    const { data: cached } = await supabase
      .from("mentor_project_recommendations")
      .select("project_id, match_score, reason, projects:project_id (id,title,description,industry,stage,commitment,role_needed,required_skills,status,budget,deadline,keywords,author_id,created_at)")
      .eq("mentor_id", user.id)
      .order("match_score", { ascending: false })
      .limit(3);

    if (cached && cached.length > 0) {
      type CachedRow = { project_id: string; match_score: number; reason: string | null; projects: ProjectRow };
      type ProjectRow = { id: string; title: string; description: string; industry: string; stage: string; commitment: string; role_needed?: string | null; required_skills?: string[] | null; status: string; budget?: number | null; deadline?: string | null; keywords?: string[] | null; author_id: string; created_at: string };
      const mapped = (cached as unknown as CachedRow[]).map((c) => ({ ...(c.projects || {}), matchingScore: c.match_score, reason: c.reason || undefined }));
      return NextResponse.json({ projects: mapped, cached: true });
    }

    // Pull recent projects if no cache
    const { data: projects, error: pErr } = await supabase
      .from("projects")
      .select("id,title,description,industry,stage,commitment,role_needed,required_skills,status,budget,deadline,keywords,author_id,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

    if (!projects || projects.length === 0) return NextResponse.json({ projects: [] });

    const mentorJson = JSON.stringify(mentor || {});
    const projectsJson = JSON.stringify(projects);

    const prompt = `You are matching a mentor to startup projects.
Mentor profile:
${mentorJson}

Projects list (array):
${projectsJson}

Return top 3 best-matching projects as a pure JSON array, no markdown. Each item must include:
{
  "project_id": string,
  "match_score": number, // 0-100
  "reason": string // one sentence starting with "This project is ..." explaining why it matches based on mentor industries/skills/experience
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Respond with valid JSON only. No markdown." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 800,
    });

    let text = completion.choices[0]?.message?.content?.trim() || "[]";
    if (text.startsWith("```")) {
      text = text.replace(/^```json\s*/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    }
    let recs: { project_id: string; match_score: number; reason: string }[] = [];
    try { recs = JSON.parse(text); } catch { recs = []; }

    // Map back to project records
    const byId = new Map(projects.map((p) => [p.id, p] as const));
    const ranked = recs
      .filter(r => byId.has(r.project_id))
      .sort((a,b) => (b.match_score||0) - (a.match_score||0))
      .slice(0,3)
      .map(r => {
        const reason = (r.reason || "").trim();
        const normalizedReason = reason.toLowerCase().startsWith("this project is") ? reason : `This project is ${reason.replace(/^it\s+is\s+/i,"")}`;
        return { ...byId.get(r.project_id)!, matchingScore: Math.round(r.match_score || 0), reason: normalizedReason };
      });

    // Cache the results
    if (ranked.length > 0) {
      const rows = ranked.map(r => ({ mentor_id: user.id, project_id: r.id, match_score: r.matchingScore || 0, reason: r.reason || null }));
      await supabase.from("mentor_project_recommendations").upsert(rows);
    }

    return NextResponse.json({ projects: ranked, cached: false });
  } catch (e) {
    console.error("recommended-projects error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


