import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { content, model } = await request.json();
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
    }

    const mdl = typeof model === 'string' ? model : 'gpt-4o-mini';

    const completion = await openai.chat.completions.create({
      model: mdl,
      messages: [
        { role: 'system', content: 'You convert rough notes into a clean, structured report with sections, bullets, and concise summaries.' },
        { role: 'user', content: `Rough notes:\n\n${content}\n\nReturn a structured, concise report using clear headings and bullet points.` },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const structured = completion.choices[0]?.message?.content || content;
    return NextResponse.json({ structured });
  } catch {
    return NextResponse.json({ error: 'Failed to structure notes' }, { status: 500 });
  }
}


