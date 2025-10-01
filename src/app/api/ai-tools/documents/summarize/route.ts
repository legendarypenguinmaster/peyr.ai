import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name || 'document';
    const fileType = file.type || 'application/octet-stream';
    const fileSize = file.size;

    // Best-effort text extraction
    const lowerType = fileType.toLowerCase();
    let extractedText: string | null = null;
    const textLikeTypes = [
      'text/plain',
      'text/markdown',
      'text/csv',
      'application/json',
      'application/xml',
      'application/javascript',
    ];

    try {
      if (textLikeTypes.includes(lowerType)) {
        extractedText = await file.text();
      } else if (lowerType === 'application/pdf' || lowerType === 'application/msword' || lowerType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Naive attempt: try reading text; if binary/noisy, fallback to metadata-only summary
        const raw = await file.text();
        const cleaned = raw.replace(/\x00/g, ' ').replace(/\s+/g, ' ').trim();
        extractedText = cleaned.length > 0 ? cleaned : null;
      }
    } catch {
      extractedText = null;
    }

    // Truncate to keep prompt concise
    const MAX_CHARS = 8000;
    if (extractedText && extractedText.length > MAX_CHARS) {
      extractedText = extractedText.slice(0, MAX_CHARS);
    }

    const systemPrompt = 'You are an assistant that writes concise, professional 2-4 sentence summaries of documents.';
    const userPrompt = extractedText
      ? `Summarize the following document content in 2-4 sentences, focusing on purpose, key topics, and intended use. Avoid fluff.\n\nFile name: ${fileName}\nFile type: ${fileType}\nFile size: ${(fileSize / 1024).toFixed(1)} KB\n\nContent:\n${extractedText}`
      : `Create a brief, professional 2-3 sentence description for this document based only on file metadata.\n\nFile name: ${fileName}\nFile type: ${fileType}\nFile size: ${(fileSize / 1024).toFixed(1)} KB`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 160,
    });

    const summary = completion.choices[0]?.message?.content?.trim() || `Document: ${fileName}`;

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating document summary:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
