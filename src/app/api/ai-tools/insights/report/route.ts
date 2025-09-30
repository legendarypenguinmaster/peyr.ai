import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { workspaceId, projectId, model } = await request.json();
    const supabase = await createClient();
    const { data: project } = await supabase.from('workspace_projects').select('id, name, description, workspace_id, created_at').eq('id', projectId).maybeSingle();
    const { data: tasks } = await supabase.from('workspace_tasks').select('title, status, due_date, assigned_to').eq('project_id', projectId).limit(200);

    const mdl = typeof model === 'string' ? model : 'gpt-4o';
    const prompt = `Create an investor-friendly progress report (Markdown) for the following project. Include sections: Overview, Progress, Bottlenecks, Next Steps.

PROJECT:\n${JSON.stringify(project)}\n\nTASKS:\n${JSON.stringify(tasks?.slice(0,50))}`;

    const completion = await openai.chat.completions.create({
      model: mdl,
      messages: [
        { role: 'system', content: 'You produce concise investor-ready reports.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 1200,
    });

    const md = completion.choices[0]?.message?.content || '# Report\nN/A';
    // Validate inputs
    if (!workspaceId || !projectId) {
      return NextResponse.json({ error: 'workspaceId and projectId are required' }, { status: 400 });
    }
    // Store under {workspaceId}/{projectId}/reports/... to satisfy RLS path policy
    const fileName = `${workspaceId}/${projectId}/reports/investor-report-${Date.now()}.md`;
    const { error: upErr } = await supabase.storage.from('project_files').upload(fileName, new Blob([md], { type: 'text/markdown' }), {
      cacheControl: '3600', upsert: false
    });
    if (upErr) return NextResponse.json({ error: 'Failed to store report' }, { status: 500 });
    // Prefer public URL if bucket is public; otherwise create a signed url
    const { data: pub } = supabase.storage.from('project_files').getPublicUrl(fileName);
    let url = pub?.publicUrl || null;
    if (!url) {
      const { data: signed } = await supabase.storage.from('project_files').createSignedUrl(fileName, 60 * 60);
      url = signed?.signedUrl || null;
    }
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}


