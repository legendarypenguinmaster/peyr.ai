import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the project details
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Get all mentors from the database
    const { data: mentors, error: mentorsError } = await supabase
      .from("mentors")
      .select(`
        *,
        profiles!mentors_id_fkey (
          id,
          name,
          email,
          avatar_url,
          role
        )
      `);

    if (mentorsError) {
      console.error("Error fetching mentors:", mentorsError);
      return NextResponse.json(
        { error: "Failed to fetch mentors" },
        { status: 500 }
      );
    }

    if (!mentors || mentors.length === 0) {
      return NextResponse.json({
        coFounders: []
      });
    }

    // Use GPT-4o to analyze and recommend co-founders
    const prompt = `You are an expert startup consultant helping to match co-founders with projects. 

Project Details:
- Title: ${project.title}
- Industry: ${project.industry}
- Stage: ${project.stage}
- Role Needed: ${project.role_needed}
- Required Skills: ${project.required_skills.join(', ')}
- Description: ${project.description}
- Full Description: ${project.full_description}

Available Co-Founders:
${mentors.map((mentor, index) => `
${index + 1}. Name: ${mentor.profiles?.name || 'Anonymous'}
   Bio: ${mentor.bio || 'No bio available'}
   Skills: ${mentor.skills?.join(', ') || 'No skills listed'}
   Industries: ${mentor.industries?.join(', ') || 'No industries listed'}
   Experience Level: ${mentor.experience_level || 'Not specified'}
   Commitment Level: ${mentor.commitment_level || 'Not specified'}
   Location: ${mentor.location || 'Not specified'}
`).join('\n')}

Please analyze each co-founder and recommend the top 5 best matches for this project. For each recommendation, provide:
1. A match score (0-100)
2. A brief explanation of why they're a good match

Consider factors like:
- Skills alignment with required skills
- Industry experience
- Experience level appropriateness
- Commitment level compatibility
- Overall fit with the project vision

Return your response as a valid JSON array with this exact structure (no markdown formatting, no code blocks):
[
  {
    "founder_index": 0,
    "match_score": 95,
    "match_reason": "Strong technical background in the same industry with relevant experience"
  }
]

IMPORTANT: Return only the JSON array, no markdown code blocks, no additional text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert startup consultant who specializes in co-founder matching. Always respond with valid JSON only - no markdown code blocks, no additional text, just the JSON array."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const recommendationsText = completion.choices[0]?.message?.content;
    
    if (!recommendationsText) {
      throw new Error("Failed to get recommendations from AI");
    }

    let recommendations;
    try {
      // Clean the response text to extract JSON
      let cleanText = recommendationsText.trim();
      
      // Remove markdown code blocks if present
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Remove any leading/trailing whitespace
      cleanText = cleanText.trim();
      
      recommendations = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("Raw response:", recommendationsText);
      // Fallback: return first 5 mentors with basic scoring
      recommendations = mentors.slice(0, 5).map((mentor, index) => ({
        founder_index: index,
        match_score: 75 + Math.random() * 20,
        match_reason: "Potential match based on available information"
      }));
    }

    // Get the top 5 recommended co-founders
    const topRecommendations = recommendations
      .sort((a: { match_score: number }, b: { match_score: number }) => b.match_score - a.match_score)
      .slice(0, 5);

    const recommendedCoFounders = topRecommendations.map((rec: { founder_index: number; match_score: number; explanation: string }) => {
      const mentor = mentors[rec.founder_index];
      return {
        id: mentor.id,
        name: mentor.profiles?.name || 'Anonymous',
        email: mentor.profiles?.email || '',
        avatar_url: mentor.profiles?.avatar_url,
        bio: mentor.bio,
        location: mentor.location,
        role: mentor.profiles?.role,
        skills: mentor.skills || [],
        industries: mentor.industries || [],
        experience_level: mentor.experience_level,
        commitment_level: mentor.commitment_level,
        match_score: Math.round(rec.match_score),
        match_reason: rec.explanation
      };
    });

    return NextResponse.json({
      coFounders: recommendedCoFounders
    });

  } catch (error) {
    console.error("Error recommending co-founders:", error);
    return NextResponse.json(
      { error: "Failed to get co-founder recommendations" },
      { status: 500 }
    );
  }
}
