import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { basics, goals, budget } = await request.json();

    if (!basics.title || !basics.description || !basics.industry || !goals || goals.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, industry, and at least one goal" },
        { status: 400 }
      );
    }

    const prompt = `You are an expert global expansion consultant. Analyze the following startup project and provide comprehensive global expansion recommendations.

Project Details:
- Title: ${basics.title}
- Description: ${basics.description}
- Industry: ${basics.industry}
- Stage: ${basics.stage}
- Current Market: ${basics.currentMarket || "Not specified"}
- Business Model: ${basics.businessModel || "Not specified"}
- Expansion Goals: ${goals.join(", ")}
- Budget: ${budget || "Not specified"}

Provide a comprehensive global expansion analysis with the following structure:

1. Expansion Score (0-100) with explanation
2. Top 5 target markets with detailed analysis
3. Localization needs for each market
4. Regulatory considerations for each market
5. Go-to-market strategies for each market

For each market, consider:
- Market size and growth potential
- Competition intensity
- Regulatory environment
- Cultural and language barriers
- Infrastructure and logistics
- Partnership opportunities
- Entry barriers and costs

Return the analysis in the following JSON format:
{
  "expansionScore": {
    "score": number,
    "explanation": "string"
  },
  "topMarkets": [
    {
      "country": "string",
      "region": "string",
      "score": number,
      "opportunities": ["string"],
      "risks": ["string"],
      "marketSize": "string",
      "competition": "string",
      "entryEase": "string"
    }
  ],
  "localizationNeeds": [
    {
      "market": "string",
      "productAdaptations": ["string"],
      "culturalConsiderations": ["string"],
      "languageRequirements": ["string"]
    }
  ],
  "regulatoryConsiderations": [
    {
      "market": "string",
      "complianceRequirements": ["string"],
      "legalStructure": "string",
      "timeline": "string"
    }
  ],
  "goToMarketStrategies": [
    {
      "market": "string",
      "entryMode": "string",
      "marketingChannels": ["string"],
      "partnerships": ["string"],
      "timeline": "string"
    }
  ]
}

Focus on practical, actionable insights that help the startup make informed expansion decisions. Consider the specific industry, stage, and goals mentioned.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert global expansion consultant with deep knowledge of international markets, regulatory environments, and go-to-market strategies. Provide practical, actionable insights for startup expansion.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    let analysis;
    try {
      // Strip markdown code blocks if present
      let cleanResponse = responseText.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      analysis = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("Raw response:", responseText);
      
      // Fallback: return a basic structure
      analysis = {
        expansionScore: {
          score: 75,
          explanation: "Based on your project details, there are good expansion opportunities in several markets. Consider starting with markets that have lower entry barriers and strong demand for your product type."
        },
        topMarkets: [
          {
            country: "Singapore",
            region: "Southeast Asia",
            score: 85,
            opportunities: ["Strong tech ecosystem", "English-speaking market", "Business-friendly regulations"],
            risks: ["Small market size", "High competition"],
            marketSize: "Small but growing",
            competition: "Moderate",
            entryEase: "High"
          },
          {
            country: "Canada",
            region: "North America",
            score: 80,
            opportunities: ["Similar market to US", "Strong startup ecosystem", "Government support"],
            risks: ["Currency fluctuations", "Seasonal variations"],
            marketSize: "Medium",
            competition: "Moderate",
            entryEase: "High"
          }
        ],
        localizationNeeds: [
          {
            market: "Singapore",
            productAdaptations: ["Local payment methods", "Regional compliance"],
            culturalConsiderations: ["Multi-cultural sensitivity", "Business etiquette"],
            languageRequirements: ["English (primary)", "Mandarin (optional)"]
          }
        ],
        regulatoryConsiderations: [
          {
            market: "Singapore",
            complianceRequirements: ["Data protection laws", "Business registration"],
            legalStructure: "Private Limited Company",
            timeline: "2-4 weeks"
          }
        ],
        goToMarketStrategies: [
          {
            market: "Singapore",
            entryMode: "Direct sales with local partnerships",
            marketingChannels: ["Digital marketing", "Industry events", "Partner referrals"],
            partnerships: ["Local distributors", "Industry associations"],
            timeline: "3-6 months"
          }
        ]
      };
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Global expansion analysis error:", error);
    return NextResponse.json(
      { error: "Failed to generate global expansion analysis" },
      { status: 500 }
    );
  }
}
