import { NextRequest } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response("Missing OPENAI_API_KEY", { status: 500 });
    }
    const openai = new OpenAI({ apiKey });

    const system = `You are an expert startup pitch consultant. Return STRICT JSON only (no markdown, no prose) matching this TypeScript type:
{
  title: string,
  summary: string,
  market: { sizeNote: string, audience: string },
  businessModel: { model: string, revenueStreams: string[] },
  problem: string,
  solution: string,
  competitors: string[],
  goToMarket: string[],
  traction?: string[],
  teamNote?: string,
  financialsAndAsk: { fundingGoal: string, useOfFunds: string[], projectionsNote: string },
  slides: { title: string, bullets: string[] }[]
}
Fields must be concise and investor-ready. Use 5-8 slides.`;

    const user = `Inputs\nIdea: ${body.idea}\nIndustry: ${body.industry}\nFunding goal: ${body.funding}\nBusiness model: ${body.model}\nTarget market: ${body.market}\nProblem: ${body.problem}\nSolution: ${body.solution}\nCompetitors: ${body.competitors}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.6,
      max_tokens: 900,
    });

    const content = completion.choices?.[0]?.message?.content ?? "{}";
    // Ensure valid JSON (model should already return JSON)
    let json: unknown;
    try {
      json = JSON.parse(content);
    } catch {
      // Fallback minimal structure
      json = { title: "AI Pitch Deck", summary: content, slides: [] };
    }
    return new Response(JSON.stringify(json), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Pitch generator error", e);
    return new Response("Internal Server Error", { status: 500 });
  }
}


