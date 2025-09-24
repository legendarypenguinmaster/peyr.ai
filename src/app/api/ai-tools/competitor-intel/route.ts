import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { inputs } = await req.json();
    if (!inputs) return NextResponse.json({ error: "inputs required" }, { status: 400 });

    const prompt = `You are a competitive intelligence expert. Generate a comprehensive competitor analysis based on the following inputs:

Product Details:
- Title: ${inputs.title}
- Description: ${inputs.description}
- Target Customers: ${inputs.targetCustomers}
- Industry: ${inputs.industry}
- Business Model: ${inputs.businessModel}
- Keywords: ${inputs.keywords.join(', ')}

Please provide a comprehensive competitor intelligence report in the following JSON format:

{
  "intel": {
    "competitors": [
      {
        "name": "Competitor Name",
        "description": "Brief description of what they do",
        "businessModel": "SaaS/Marketplace/E-commerce/etc",
        "fundingStage": "Seed/Series A/Series B/Public/etc",
        "strengths": ["Strength 1", "Strength 2", "Strength 3"],
        "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
        "website": "https://example.com"
      }
    ],
    "featureComparison": [
      {
        "feature": "Feature Name",
        "competitors": {
          "Competitor 1": true,
          "Competitor 2": false,
          "Competitor 3": true
        }
      }
    ],
    "positioning": {
      "opportunities": [
        "Market opportunity 1",
        "Market opportunity 2",
        "Market opportunity 3"
      ],
      "differentiation": [
        "How to differentiate 1",
        "How to differentiate 2",
        "How to differentiate 3"
      ],
      "recommendations": [
        "Strategic recommendation 1",
        "Strategic recommendation 2",
        "Strategic recommendation 3"
      ]
    },
    "intelScore": {
      "score": 75,
      "level": "Moderate Competition",
      "explanation": "Brief explanation of the competitive landscape and opportunity level"
    },
    "marketInsights": [
      "Market insight 1",
      "Market insight 2",
      "Market insight 3",
      "Market insight 4"
    ]
  }
}

Requirements:
- Identify 3-5 realistic competitors (mix of direct and indirect)
- Include well-known companies in the space
- Provide realistic funding stages and business models
- Create a meaningful feature comparison matrix
- Give actionable positioning advice
- Score should reflect market saturation (0-100, where 100 = blue ocean opportunity)
- All insights should be specific and actionable

Return only valid JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a competitive intelligence expert. Respond with valid JSON only. No markdown formatting." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 3000,
    });

    let text = completion.choices[0]?.message?.content?.trim() || "{}";
    if (text.startsWith("```")) {
      text = text.replace(/^```json\s*/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    }
    
    let json: unknown = {};
    try { 
      json = JSON.parse(text); 
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return NextResponse.json({ error: "AI parsing failed" }, { status: 500 });
    }

    return NextResponse.json(json);
  } catch (e) {
    console.error("competitor-intel error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
