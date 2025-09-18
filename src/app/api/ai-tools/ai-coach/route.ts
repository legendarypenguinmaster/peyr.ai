import { NextRequest } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const { prompt, topic } = await req.json();
  if (!prompt || typeof prompt !== "string") {
    return new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY not configured" }), { status: 500 });
  }

  const openai = new OpenAI({ apiKey });
  const system = `You are an AI Startup Coach. Provide concise, actionable, structured responses using Markdown (headings, bold, italics, and lists). Topic focus: ${
    topic || "general"
  }. Keep answers practical and step-by-step.`;

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    temperature: 0.5,
    max_tokens: 700,
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices?.[0]?.delta?.content ?? "";
          if (delta) controller.enqueue(encoder.encode(delta));
        }
      } catch (e) {
        controller.error(e);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}


