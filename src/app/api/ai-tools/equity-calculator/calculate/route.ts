import { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { founders } = body;

    if (!founders || !Array.isArray(founders) || founders.length === 0) {
      return new Response(JSON.stringify({ error: "No founder data provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const system = `You are an expert startup equity consultant. Return STRICT JSON only (no markdown, no prose) matching this TypeScript type:
{
  founders: {
    name: string,
    primary: string,
    capitalContribution: number,
    experienceLevel: string,
    timeCommitment: number,
    salaryForegone: number,
    riskLevel: string,
    networkValue: string,
    equityPercentage: number,
    reasoning: string
  }[],
  analysis: string,
  totalEquity: number
}
Calculate fair equity distribution based on:
1. Capital contributions (weight: 30%)
2. Time commitment (weight: 25%)
3. Experience level (weight: 20%)
4. Risk level (weight: 15%)
5. Network value (weight: 10%)

Ensure total equity equals 100%. Provide detailed reasoning for each founder's percentage.`;

    const user = `Founder Data:
${founders.map((f: Record<string, unknown>, i: number) => `
Founder ${i + 1}:
- Name: ${f.name}
- Role: ${f.primary}
- Capital Contribution: $${f.capitalContribution}
- Experience: ${f.experienceLevel}
- Time Commitment: ${f.timeCommitment}%
- Salary Foregone: ${f.salaryForegone}%
- Risk Level: ${f.riskLevel}
- Network Value: ${f.networkValue}
`).join('\n')}

Calculate fair equity distribution for these founders.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.3,
    });

    const content = completion.choices?.[0]?.message?.content ?? "{}";
    
    // Ensure valid JSON
    let json: unknown;
    try {
      json = JSON.parse(content);
    } catch {
      // Fallback structure
      json = {
        founders: founders.map((f: Record<string, unknown>) => ({
          ...f,
          equityPercentage: Math.round(100 / founders.length),
          reasoning: "Equal distribution fallback"
        })),
        analysis: "Unable to generate detailed analysis. Using equal distribution.",
        totalEquity: 100
      };
    }

    return new Response(JSON.stringify(json), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Equity calculation error:", error);
    return new Response(JSON.stringify({ error: "Failed to calculate equity distribution" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
