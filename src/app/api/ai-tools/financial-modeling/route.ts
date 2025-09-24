import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { inputs } = await req.json();
    if (!inputs) return NextResponse.json({ error: "inputs required" }, { status: 400 });

    const prompt = `You are a startup CFO. Build a compact 3-5 year financial model from inputs. 
Inputs: ${JSON.stringify(inputs)}
Return JSON with:
{
  "model": {
    "summary": {"burnRate": number, "runwayMonths": number, "ltv": number, "cac": number, "grossMargin": number},
    "yearly": [{"year": number, "revenue": number, "costs": number, "ebitda": number}],
    "notes": [string]
  }
}
Numbers should be realistic for an early-stage startup. Return only JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Respond with valid JSON only. No markdown." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    let text = completion.choices[0]?.message?.content?.trim() || "{}";
    if (text.startsWith("```")) {
      text = text.replace(/^```json\s*/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    }
    let json: unknown = {};
    try { json = JSON.parse(text); } catch { return NextResponse.json({ error: "AI parsing failed" }, { status: 500 }); }

    return NextResponse.json(json);
  } catch (e) {
    console.error("financial-modeling error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


