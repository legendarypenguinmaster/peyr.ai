import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { workspaceId, projectId, model } = await request.json();
    if (!workspaceId || !projectId) {
      return NextResponse.json({ error: 'workspaceId and projectId are required' }, { status: 400 });
    }

    const supabase = await createClient();
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const { data: project } = await supabase
      .from('workspace_projects')
      .select('id, name, description, workspace_id, created_at')
      .eq('id', projectId)
      .maybeSingle();

    const { data: tasks } = await supabase
      .from('workspace_tasks')
      .select('title, status, due_date, assigned_to')
      .eq('project_id', projectId)
      .limit(200);

    const mdl = typeof model === 'string' ? model : 'gpt-4o';
    const prompt = `Create an investor-friendly progress report in plain text (no markdown). Use headings in ALL CAPS, short lines. Sections: OVERVIEW, PROGRESS, BOTTLENECKS, NEXT STEPS.\n\nPROJECT:\n${JSON.stringify(project)}\n\nTASKS:\n${JSON.stringify((tasks || []).slice(0,50))}`;

    const completion = await openai.chat.completions.create({
      model: mdl,
      messages: [
        { role: 'system', content: 'You produce concise investor-ready reports in plain text only. No markdown.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 1200,
    });

    const text = completion.choices[0]?.message?.content || 'INVESTOR REPORT\nN/A';

    // Dynamically import jsPDF for Node
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    
    // Set better font and styling
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    const margin = 60;
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
    const pageHeight = doc.internal.pageSize.getHeight();
    const lineHeight = 18;
    const paragraphSpacing = 8;
    
    // Split text into lines with better formatting
    const lines = doc.splitTextToSize(text, pageWidth);
    let y = margin;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if we need a new page
      if (y > pageHeight - margin - 20) {
        doc.addPage();
        y = margin;
      }
      
      // Handle headings (lines in ALL CAPS)
      if (line === line.toUpperCase() && line.length > 3 && line.length < 50) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(line, margin, y);
        y += lineHeight + 4;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
      } else {
        doc.text(line, margin, y);
        y += lineHeight;
      }
      
      // Add paragraph spacing
      if (i < lines.length - 1 && lines[i + 1] && lines[i + 1].trim() === '') {
        y += paragraphSpacing;
      }
    }

    const arrayBuffer = doc.output('arraybuffer') as ArrayBuffer;
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `investor-report-${projectId}.pdf`;
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}


