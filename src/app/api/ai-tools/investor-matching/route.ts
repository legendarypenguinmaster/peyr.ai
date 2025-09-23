import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();
    if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

    const supabase = await createClient();

    const { data: project, error: pErr } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();
    if (pErr || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { data: investors, error: iErr } = await supabase
      .from("investors")
      .select(`*, profiles!investors_id_fkey ( id, name )`);
    
    if (iErr) {
      return NextResponse.json({ error: "Failed to fetch investors" }, { status: 500 });
    }

    if (!investors || investors.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    const prompt = `You are an expert investor-matching assistant. Given a startup project and a list of investors, rank the best matches.
Project:
Title: ${project.title}
Industry: ${project.industry}
Stage: ${project.stage}
Budget: ${project.budget ?? 'N/A'}
Description: ${project.description}
Required Skills: ${(project.required_skills || []).join(', ')}

Investors:
${investors.map((inv: { profiles?: { name?: string }; investor_type?: string; industries?: string[]; stage_focus?: string[]; min_check?: number; max_check?: number }, i: number) => `${i+1}. Name: ${inv.profiles?.name || 'Anonymous'}; Type: ${inv.investor_type || ''}; Industries: ${(inv.industries||[]).join(', ')}; Stage Focus: ${(inv.stage_focus||[]).join(', ')}; Check: ${inv.min_check ?? ''}-${inv.max_check ?? ''}`).join('\n')}

Return a pure JSON array (no code block) of objects with: index (number referencing investor position above), match_score (0-100 integer), explanation (short reason).`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Respond with valid JSON only, no markdown, no extra text." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1200,
    });

    let text = completion.choices[0]?.message?.content?.trim() || "[]";
    
    if (text.startsWith("```")) {
      text = text.replace(/^```json\s*/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    }
    
     let recs: { index: number; match_score: number; explanation: string }[] = [];
     try { 
       recs = JSON.parse(text); 
     } catch {
       recs = [];
     }

    const sorted = recs
      .filter((r) => typeof r.index === 'number')
      .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
      .slice(0, 8)
      .map((r) => {
        const inv = investors[r.index - 1];
        if (!inv) {
          return null;
        }
        return {
          id: inv.profiles?.id || inv.id,
          name: inv.profiles?.name || 'Anonymous',
          investor_type: inv.investor_type,
          industries: inv.industries || [],
          stage_focus: inv.stage_focus || [],
          min_check: inv.min_check,
          max_check: inv.max_check,
          match_score: Math.round(r.match_score || 0),
          explanation: r.explanation || '',
        };
      })
      .filter(Boolean);

    return NextResponse.json({ matches: sorted });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


