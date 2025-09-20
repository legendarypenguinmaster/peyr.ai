import { NextRequest } from "next/server";
import OpenAI from "openai";

function generateRiskScores(assessmentData: Record<string, unknown>) {
  // Simple scoring algorithm based on assessment data
  let failureRisk = 0;
  let successProbability = 0;
  let marketRisk = 0;
  let teamRisk = 0;
  let financialRisk = 0;
  let executionRisk = 0;

  // Market Risk scoring
  const marketSizeScores = {
    "Niche Market (under $1B)": 40,
    "Medium Market ($1B-$10B)": 20,
    "Large Market($10B-$100B)": 10,
    "Massive Market(over $100B)": 5,
  };
  marketRisk = marketSizeScores[assessmentData.targetMarketSize as keyof typeof marketSizeScores] || 30;

  const competitionScores = {
    "No Direct Competitors": 5,
    "Few Competitors": 15,
    "Moderate Competition": 30,
    "High Competition": 50,
    "Saturated Market": 70,
  };
  marketRisk += competitionScores[assessmentData.competitionLevel as keyof typeof competitionScores] || 25;

  // Team Risk scoring
  const teamSizeScores = {
    "Solo Founder": 60,
    "2-3 People": 30,
    "4-6 People": 15,
    "7-10 People": 10,
    "10+ People": 5,
  };
  teamRisk = teamSizeScores[assessmentData.teamSize as keyof typeof teamSizeScores] || 30;

  // Financial Risk scoring
  const fundingScores = {
    "Bootstrapped": 50,
    "Pre-seed": 40,
    "Seed": 25,
    "Series A": 15,
    "Series B+": 5,
  };
  financialRisk = fundingScores[assessmentData.fundingStatus as keyof typeof fundingScores] || 30;

  // Execution Risk scoring
  const stageScores = {
    "Idea Stage": 70,
    "MVP Development": 50,
    "Prototype": 40,
    "Beta Testing": 25,
    "Launched": 15,
    "Growth Stage": 5,
  };
  executionRisk = stageScores[assessmentData.currentStage as keyof typeof stageScores] || 40;

  // Calculate overall failure risk (average of all risks)
  failureRisk = Math.round((marketRisk + teamRisk + financialRisk + executionRisk) / 4);
  
  // Calculate success probability (inverse of failure risk with some adjustment)
  successProbability = Math.max(0, Math.min(100, 100 - failureRisk + Math.random() * 20 - 10));

  return {
    failureRisk: Math.min(100, failureRisk),
    successProbability: Math.max(0, Math.min(100, successProbability)),
    marketRisk: Math.min(100, marketRisk),
    teamRisk: Math.min(100, teamRisk),
    financialRisk: Math.min(100, financialRisk),
    executionRisk: Math.min(100, executionRisk),
  };
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const assessmentData = await request.json();
    const {
      startupIdea,
      industry,
      currentStage,
      teamSize,
      fundingStatus,
      targetMarketSize,
      competitionLevel,
      businessModel,
      currentTraction,
    } = assessmentData;

    if (!startupIdea || !industry) {
      return new Response("Startup idea and industry are required", { status: 400 });
    }

    const system = `You are an expert startup risk analyst and business consultant. Your task is to provide a comprehensive risk assessment and success probability analysis for startups.

Guidelines:
1. Provide a detailed analysis of startup risks and success probability
2. Include specific risk factors and mitigation strategies
3. Give a success probability score (0-100%)
4. Be objective and data-driven in your analysis
5. Consider market conditions, competition, team, funding, and business model
6. Provide actionable recommendations

Format your response with proper markdown:
- Use **BOLD** for section headers (## for main sections, ### for subsections)
- Use *ITALIC* for emphasis on important points
- Use bullet points (-) for lists
- Include specific percentages and metrics where relevant
- Structure the analysis logically with clear sections
- Use proper markdown formatting for readability

Return a comprehensive analysis that covers:
1. **Success Probability Score** - Overall assessment with percentage
2. **Key Risk Factors** - Top risks identified
3. **Market Analysis** - Market size, trends, and opportunities
4. **Competitive Assessment** - Competition analysis and positioning
5. **Team & Execution Risks** - Team-related risks and capabilities
6. **Financial & Funding Risks** - Funding and financial considerations
7. **Recommendations & Next Steps** - Actionable advice for improvement`;

    const user = `Analyze the following startup for risk assessment and success probability:

**Startup Information:**
- Startup Idea: ${startupIdea}
- Industry: ${industry}
- Current Stage: ${currentStage}
- Team Size: ${teamSize}
- Funding Status: ${fundingStatus}
- Target Market Size: ${targetMarketSize}
- Competition Level: ${competitionLevel}
- Business Model: ${businessModel}
- Current Traction: ${currentTraction || "Not specified"}

Please provide a comprehensive risk assessment including success probability scoring, key risk factors, market analysis, competitive assessment, team and execution risks, financial risks, and actionable recommendations.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const analysis = completion.choices?.[0]?.message?.content ?? "Analysis failed. Please try again.";

    // Generate risk scores based on the assessment data
    const riskScores = generateRiskScores(assessmentData);

    return new Response(JSON.stringify({
      analysis,
      riskScores,
    }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Risk assessment error:", error);
    return new Response("Failed to analyze startup risks", { status: 500 });
  }
}

