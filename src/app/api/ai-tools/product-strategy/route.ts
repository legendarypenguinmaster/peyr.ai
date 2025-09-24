import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { inputs } = await req.json();
    if (!inputs) return NextResponse.json({ error: "inputs required" }, { status: 400 });

    const prompt = `You are a product strategy expert. Generate a comprehensive product strategy based on the following inputs:

Product Details:
- Title: ${inputs.title}
- Description: ${inputs.description}
- Target Users: ${inputs.targetUsers}
- Business Goals: ${inputs.businessGoals}
- Industry: ${inputs.industry}
- Stage: ${inputs.stage}
- Commitment: ${inputs.commitment}
- Role Needed: ${inputs.roleNeeded}
- Required Skills: ${inputs.requiredSkills.join(', ')}
- Budget: ${inputs.budget || 'Not specified'}
- Deadline: ${inputs.deadline || 'Not specified'}
- Keywords: ${inputs.keywords.join(', ')}

Please provide a comprehensive product strategy in the following JSON format:

{
  "strategy": {
    "mvpFeatures": [
      "Feature 1 description",
      "Feature 2 description",
      "Feature 3 description"
    ],
    "roadmap": [
      {
        "phase": "Phase 1 name",
        "duration": "X months",
        "features": ["Feature A", "Feature B"],
        "goals": ["Goal 1", "Goal 2"]
      },
      {
        "phase": "Phase 2 name", 
        "duration": "X months",
        "features": ["Feature C", "Feature D"],
        "goals": ["Goal 3", "Goal 4"]
      }
    ],
    "priorities": [
      "Priority 1",
      "Priority 2",
      "Priority 3"
    ],
    "goToMarket": {
      "channels": ["Channel 1", "Channel 2"],
      "pricing": "Pricing strategy description",
      "positioning": "Market positioning description",
      "launch": "Launch strategy description"
    },
    "recommendations": [
      "Recommendation 1",
      "Recommendation 2",
      "Recommendation 3"
    ]
  }
}

Make sure the strategy is realistic, actionable, and tailored to the specific industry and stage. Focus on practical next steps and clear priorities. Return only valid JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a product strategy expert. Respond with valid JSON only. No markdown formatting." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
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
    console.error("product-strategy error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
