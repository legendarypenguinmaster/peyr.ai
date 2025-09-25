import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { inputs, partner } = await req.json();
    if (!inputs || !partner) return NextResponse.json({ error: "inputs and partner required" }, { status: 400 });

    const prompt = `Write a short, polite, and specific outreach email from a founder to a potential partner. The email should be personalized, highlight mutual benefit, and request a brief intro call. Include a strong subject line.

Project Title: ${inputs.projectTitle}
Project Description: ${inputs.projectDescription}
Industry: ${inputs.industry}
Target Market: ${inputs.targetMarket}
Goals: ${(inputs.goals || []).join(', ')}

Partner Name: ${partner.name}
Partner Type: ${partner.type}
Partner Description: ${partner.description}
Proposed Synergies: ${(partner.synergies || []).join(', ')}

Return plain text only.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a startup partnerships assistant. Return plain text only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 800,
    });

    const email = completion.choices[0]?.message?.content?.trim() || "";
    return NextResponse.json({ email });
  } catch (e) {
    console.error("outreach error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


