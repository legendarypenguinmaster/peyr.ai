import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { projectId, progressPct, overdueCount, model } = await request.json();
    const supabase = await createClient();

    // fetch light context
    const { data: project } = await supabase.from('workspace_projects').select('id, name, description, workspace_id').eq('id', projectId).maybeSingle();
    const { data: tasks } = await supabase.from('workspace_tasks').select('status, assigned_to, due_date').eq('project_id', projectId).limit(200);

    const mdl = typeof model === 'string' ? model : 'gpt-4o';
    const prompt = `You are a virtual COO. Given the project context and metrics, produce:
- A one-line progress forecast.
- 2-4 concise bottleneck alerts if any.
- 3 concise strategy recommendations.
Return JSON object with keys: forecast (string), bottlenecks (string[]), recommendations (string[]).

CONTEXT:
Project: ${project?.name || 'N/A'}
Description: ${project?.description || 'N/A'}
ProgressPct: ${progressPct}
OverdueCount: ${overdueCount}
Tasks sample: ${(tasks || []).slice(0,20).map(t => JSON.stringify({s:t.status,a:!!t.assigned_to,d:t.due_date})).join(', ')}
`;

    const completion = await openai.chat.completions.create({
      model: mdl,
      messages: [
        { role: 'system', content: 'You produce short, executive, actionable guidance in JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 800,
    });

    let text = completion.choices[0]?.message?.content || '';
    // try parse
    try {
      if (text.startsWith('```')) text = text.replace(/^```(json)?\n?/,'').replace(/```$/,'');
      const parsed = JSON.parse(text);
      return NextResponse.json({
        forecast: parsed.forecast || '',
        bottlenecks: parsed.bottlenecks || [],
        recommendations: parsed.recommendations || [],
      });
    } catch {
      return NextResponse.json({
        forecast: `You're ${progressPct}% on track, ${overdueCount} overdue.`,
        bottlenecks: overdueCount ? [`${overdueCount} overdue tasks detected.`] : [],
        recommendations: ['Review workload distribution','Plan pitch deck after MVP','Clarify upcoming milestones'],
      });
    }
  } catch {
    return NextResponse.json({ error: 'Failed to get insights' }, { status: 500 });
  }
}


