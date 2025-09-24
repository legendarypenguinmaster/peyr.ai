import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface MarketValidation {
  marketSize: {
    tam: string;
    sam: string;
    som: string;
    tamValue: number;
    samValue: number;
    somValue: number;
  };
  competitors: Array<{
    name: string;
    strengths: string[];
    weaknesses: string[];
    differentiation: string;
  }>;
  customerSegments: Array<{
    segment: string;
    painPoints: string[];
    solution: string;
  }>;
  trends: string[];
  risks: string[];
  validationScore: number;
  explanation: string;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function isMarketValidation(value: unknown): value is MarketValidation {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const ms = v.marketSize as Record<string, unknown> | undefined;
  if (!ms) return false;
  const hasMarketSize = typeof ms.tam === "string" && typeof ms.sam === "string" && typeof ms.som === "string"
    && typeof ms.tamValue === "number" && typeof ms.samValue === "number" && typeof ms.somValue === "number";
  const competitors = v.competitors as unknown;
  const hasCompetitors = Array.isArray(competitors);
  const customerSegments = v.customerSegments as unknown;
  const hasSegments = Array.isArray(customerSegments);
  const trends = v.trends as unknown;
  const risks = v.risks as unknown;
  const score = v.validationScore as unknown;
  const explanation = v.explanation as unknown;
  return hasMarketSize && hasCompetitors && hasSegments && isStringArray(trends) && isStringArray(risks)
    && typeof score === "number" && typeof explanation === "string";
}

export async function POST(request: NextRequest) {
  try {
    const { projectId, description, keywords } = await request.json();
    if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

    const supabase = await createClient();

    const { data: project, error: pErr } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();
    
    if (pErr || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projectDescription = description || project.description;
    const projectKeywords = keywords || project.keywords || [];

    const prompt = `You are an expert market analyst and startup consultant. Analyze the following startup project and provide a comprehensive market validation report.

Project Details:
Title: ${project.title}
Industry: ${project.industry}
Stage: ${project.stage}
Description: ${projectDescription}
Keywords: ${projectKeywords.join(", ")}

Please provide a detailed market validation analysis in the following JSON format:

{
  "marketSize": {
    "tam": "Total Addressable Market description (e.g., '$50B global market')",
    "sam": "Serviceable Available Market description (e.g., '$5B addressable segment')",
    "som": "Serviceable Obtainable Market description (e.g., '$50M realistic target')",
    "tamValue": 50000000000,
    "samValue": 5000000000,
    "somValue": 50000000
  },
  "competitors": [
    {
      "name": "Competitor Name",
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1", "weakness2"],
      "differentiation": "How this project differentiates"
    }
  ],
  "customerSegments": [
    {
      "segment": "Primary customer segment",
      "painPoints": ["pain point 1", "pain point 2"],
      "solution": "How this project solves their problems"
    }
  ],
  "trends": [
    "Relevant market trend 1",
    "Relevant market trend 2",
    "Relevant market trend 3"
  ],
  "risks": [
    "Key risk 1",
    "Key risk 2",
    "Key risk 3"
  ],
  "validationScore": 75,
  "explanation": "Detailed explanation of the validation score and market potential"
}

Guidelines:
- Provide realistic market size estimates based on the industry and project scope
- Identify 3-5 real competitors in the space
- Suggest 2-3 primary customer segments with specific pain points
- Include current market trends relevant to the industry
- Identify key risks (regulatory, competitive, adoption, etc.)
- Calculate validation score (0-100) based on market size, competition, problem relevance, and growth potential
- Provide a clear explanation of the score

Return only valid JSON, no markdown formatting.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert market analyst and startup consultant. Always respond with valid JSON only - no markdown code blocks, no additional text, just the JSON object."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    let text = completion.choices[0]?.message?.content?.trim() || "{}";
    
    if (text.startsWith("```")) {
      text = text.replace(/^```json\s*/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    }
    
    let parsed: unknown = {};
    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    // Validate required fields
    if (!isMarketValidation(parsed)) {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    return NextResponse.json({ validation: parsed });
  } catch (e) {
    console.error("Market validation error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
