import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { inputs } = await req.json();
    if (!inputs) return NextResponse.json({ error: "inputs required" }, { status: 400 });

    const prompt = `You are a partnerships strategist. Based on the project and goals, identify and score potential partners.

Inputs:
${JSON.stringify(inputs, null, 2)}

Return JSON in the format:
{
  "report": {
    "partners": [
      {
        "name": "Stripe",
        "type": "Tech",
        "description": "Payments infrastructure for the internet",
        "relevance": "Handles payments at scale relevant for ${inputs.industry}",
        "synergies": ["Checkout integration", "Billing", "Subscriptions"],
        "risks": ["Vendor lock-in"],
        "score": 82,
        "explanation": "High fit for monetization and checkout",
        "website": "https://stripe.com"
      }
    ],
    "summary": [
      "Strong tech integration opportunities",
      "Consider distribution partnerships in ${inputs.targetMarket}"
    ]
  }
}

Rules:
- Include a mix of Tech, Distribution, Research, and Corporate partners.
- Only realistic, known organizations.
- Provide clear, concise relevance, synergies, risks, and a score (0-100).
- Tailor suggestions to goals: ${(inputs.goals || []).join(', ')}.
- Respond with valid JSON only.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a partnerships strategist. Respond with valid JSON only. No markdown." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 2000,
    });

    let text = completion.choices[0]?.message?.content?.trim() || "{}";
    if (text.startsWith("```")) {
      text = text.replace(/^```json\s*/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    }
    let json: unknown = {};
    try { json = JSON.parse(text); } catch { return NextResponse.json({ error: "AI parsing failed" }, { status: 500 }); }

    return NextResponse.json(json);
  } catch (e) {
    console.error("partnership-discovery error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


