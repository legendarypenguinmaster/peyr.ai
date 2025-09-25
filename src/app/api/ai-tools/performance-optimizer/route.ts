import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { inputs } = await req.json();
    if (!inputs) return NextResponse.json({ error: "inputs required" }, { status: 400 });

    const prompt = `You are a startup KPI analyst. Analyze the following project basics, metrics, and goals. Produce JSON with kpis[], benchmarks[], suggestions[], performanceScore{score, explanation}, and optional weeklySummary.

Inputs:
${JSON.stringify(inputs, null, 2)}

Return JSON shape:
{
  "analysis": {
    "kpis": [{"name":"MRR","value":"$10,000","category":"Growth"}],
    "benchmarks": [{"metric":"Churn","yourValue":"12%","industryAverage":"5% (SaaS)","status":"behind"}],
    "suggestions": ["Run exit surveys to reduce churn", "Offer annual plans"],
    "performanceScore": {"score": 72, "explanation": "Good growth, high churn"},
    "weeklySummary": {"improved": ["MRR +8%"], "worsened": ["Churn +1%"], "nextSteps": ["Onboarding improvements"]}
  }
}

Guidelines:
- Be realistic and concise.
- Use industry norms for benchmarks when possible (e.g., SaaS churn ~5%).
- Ensure valid JSON, no markdown.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a KPI analyst. Respond with valid JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1600,
    });

    let text = completion.choices[0]?.message?.content?.trim() || "{}";
    if (text.startsWith("```")) {
      text = text.replace(/^```json\s*/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    }
    let json: unknown = {};
    try { json = JSON.parse(text); } catch { return NextResponse.json({ error: "AI parsing failed" }, { status: 500 }); }

    return NextResponse.json(json);
  } catch (e) {
    console.error("performance-optimizer error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


