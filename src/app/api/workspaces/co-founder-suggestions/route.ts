import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceDescription, requiredSkills, preferredIndustries } = body;

    // Get user's profile to understand their background
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('name, role')
      .eq('id', user.id)
      .single();

    // Get user's founder profile if they're a founder
    const { data: founderProfile } = await supabase
      .from('founders')
      .select('skills, industries, bio, location')
      .eq('id', user.id)
      .single();

    // Get potential co-founders from the founders table
    const { data: potentialCoFounders, error: coFoundersError } = await supabase
      .from('founders')
      .select(`
        id,
        bio,
        skills,
        industries,
        location,
        commitment_level,
        profiles (
          name,
          email,
          avatar_url
        )
      `)
      .neq('id', user.id) // Exclude the current user
      .limit(20);

    if (coFoundersError) {
      console.error('Error fetching potential co-founders:', coFoundersError);
      return NextResponse.json({ error: 'Failed to fetch potential co-founders' }, { status: 500 });
    }

    if (!potentialCoFounders || potentialCoFounders.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    // Prepare data for GPT-4o analysis
    const userContext = {
      name: userProfile?.name || 'User',
      role: userProfile?.role,
      skills: founderProfile?.skills || [],
      industries: founderProfile?.industries || [],
      bio: founderProfile?.bio || '',
      location: founderProfile?.location || ''
    };

    const coFoundersData = potentialCoFounders.map(cf => {
      const profile = Array.isArray(cf.profiles) ? cf.profiles[0] : cf.profiles;
      return {
        id: cf.id,
        name: profile?.name || 'Unknown',
        email: profile?.email || '',
        avatar_url: profile?.avatar_url || '',
        bio: cf.bio || '',
        skills: cf.skills || [],
        industries: cf.industries || [],
        location: cf.location || '',
        commitment_level: cf.commitment_level || ''
      };
    });

    // Create GPT-4o prompt for co-founder matching
    const prompt = `You are an AI assistant helping a founder find the best co-founder matches for their startup.

USER CONTEXT:
- Name: ${userContext.name}
- Role: ${userContext.role}
- Skills: ${userContext.skills.join(', ')}
- Industries: ${userContext.industries.join(', ')}
- Bio: ${userContext.bio}
- Location: ${userContext.location}

WORKSPACE REQUIREMENTS:
- Description: ${workspaceDescription || 'Not specified'}
- Required Skills: ${requiredSkills || 'Not specified'}
- Preferred Industries: ${preferredIndustries || 'Not specified'}

AVAILABLE CO-FOUNDERS:
${coFoundersData.map(cf => `
ID: ${cf.id}
Name: ${cf.name}
Bio: ${cf.bio}
Skills: ${cf.skills.join(', ')}
Industries: ${cf.industries.join(', ')}
Location: ${cf.location}
Commitment Level: ${cf.commitment_level}
`).join('\n')}

Please analyze and recommend the top 3-5 co-founders who would be the best matches for this startup. Consider:
1. Skill complementarity (not overlap)
2. Industry experience alignment
3. Commitment level compatibility
4. Geographic considerations
5. Overall fit for the described workspace

Return your response as a JSON array with this exact structure:
[
  {
    "cofounder_id": "string",
    "match_score": number (0-100),
    "reasoning": "string explaining why this is a good match",
    "complementary_skills": ["skill1", "skill2"],
    "potential_concerns": "string with any potential issues or considerations"
  }
]

IMPORTANT: Return ONLY the JSON array, no additional text or formatting.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert startup advisor specializing in co-founder matching and team building. Provide precise, actionable recommendations based on the data provided."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    });

    const gptResponse = completion.choices[0]?.message?.content;
    
    if (!gptResponse) {
      throw new Error('No response from GPT-4o');
    }

    // Parse GPT response
    let suggestions;
    try {
      suggestions = JSON.parse(gptResponse);
    } catch (parseError) {
      console.error('Error parsing GPT response:', parseError);
      console.error('GPT Response:', gptResponse);
      throw new Error('Failed to parse AI suggestions');
    }

    // Enhance suggestions with full co-founder data
    type Suggestion = {
      cofounder_id: string;
      match_score?: number;
      reasoning?: string;
      complementary_skills?: string[];
      potential_concerns?: string;
      [key: string]: unknown;
    };
    const enhancedSuggestions = (suggestions as Suggestion[]).map((suggestion) => {
      const coFounder = coFoundersData.find(cf => cf.id === suggestion.cofounder_id);
      return {
        ...suggestion,
        cofounder_details: coFounder
      };
    }).filter(suggestion => suggestion.cofounder_details); // Remove any suggestions without matching co-founder data

    return NextResponse.json({ 
      suggestions: enhancedSuggestions,
      total_analyzed: coFoundersData.length
    });

  } catch (error) {
    console.error('Error in co-founder suggestions:', error);
    return NextResponse.json({ error: 'Failed to generate co-founder suggestions' }, { status: 500 });
  }
}
