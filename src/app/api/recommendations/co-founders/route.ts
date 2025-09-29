import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not set. GPT recommendations will not work.');
}

interface FounderData {
  id: string;
  name: string | null;
  location: string | null;
  timezone: string | null;
  skills: string[] | null;
  industries: string[] | null;
  cofounder_preference: string | null;
  commitment_level: string | null;
  availability_hours: number | null;
  communication_style: string | null;
  bio: string | null;
}

interface CoFounderData {
  id: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  timezone: string | null;
  skills: string[] | null;
  industries: string[] | null;
  cofounder_preference: string | null;
  commitment_level: string | null;
  availability_hours: number | null;
  communication_style: string | null;
  linkedin_url: string | null;
  github_url: string | null;
}

interface Recommendation {
  cofounder_id: string;
  match_score: number;
  match_percentage: number;
  reasoning: string;
}

interface DatabaseRecommendation {
  id: string;
  founder_id: string;
  recommended_cofounder_id: string;
  match_score: number;
  match_percentage: number;
  match_reasoning: string;
  created_at: string;
  updated_at: string;
}

interface ProfileData {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

interface CoFounderDetails {
  id: string;
  bio: string | null;
  location: string | null;
  timezone: string | null;
  skills: string[] | null;
  industries: string[] | null;
  cofounder_preference: string | null;
  commitment_level: string | null;
  availability_hours: number | null;
  communication_style: string | null;
  linkedin_url: string | null;
  github_url: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if this is a refresh request
    const url = new URL(request.url);
    const refresh = url.searchParams.get('refresh') === 'true';

    // Check if user has existing recommendations (less than 24 hours old)
    const { data: existingRecommendations, error: existingError } = await supabase
      .from('co_founder_recommendations')
      .select('*')
      .eq('founder_id', user.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('match_score', { ascending: false })
      .limit(2);

    if (existingError) {
      console.error('Error fetching existing recommendations:', existingError);
      // If table doesn't exist, continue with generating new recommendations
      if (existingError.code === 'PGRST116') {
        console.log('Recommendations table does not exist yet, will create recommendations');
      }
    }

    // If we have recent recommendations and it's not a refresh request, return them
    if (existingRecommendations && existingRecommendations.length > 0 && !refresh) {
      // Enrich cached recommendations with complete co-founder data
      const enrichedCachedRecommendations = await enrichRecommendationsWithCoFounderData(existingRecommendations.slice(0, 2), supabase);
      
      return NextResponse.json({
        recommendations: enrichedCachedRecommendations,
        cached: true
      });
    }

    // If it's a refresh request, delete existing recommendations first
    if (refresh) {
      const { error: deleteError } = await supabase
        .from('co_founder_recommendations')
        .delete()
        .eq('founder_id', user.id);

      if (deleteError) {
        console.error('Error deleting existing recommendations:', deleteError);
        // Continue anyway, we can still generate new recommendations
      }
    }

    // Get founder data
    const { data: founderData, error: founderError } = await supabase
      .from('founders')
      .select('*')
      .eq('id', user.id)
      .single();

    if (founderError) {
      console.error('Error fetching founder data:', founderError);
      return NextResponse.json({ error: 'Failed to fetch founder profile' }, { status: 500 });
    }

    if (!founderData) {
      return NextResponse.json({ error: 'Founder profile not found. Please complete your profile setup.' }, { status: 404 });
    }

    // Get founder profile name
    const { data: founderProfile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    // Get all founders data (excluding current user)
    const { data: foundersData, error: foundersError } = await supabase
      .from('founders')
      .select('*')
      .neq('id', user.id); // Exclude the current user

    if (foundersError) {
      console.error('Error fetching founders:', foundersError);
      return NextResponse.json({ error: 'Failed to fetch founders' }, { status: 500 });
    }

    if (!foundersData || foundersData.length === 0) {
      return NextResponse.json({ 
        recommendations: [],
        cached: false,
        message: 'No other founders available for matching'
      });
    }

    // Get founder profile names
    const founderIds = foundersData.map(founder => founder.id);
    const { data: founderProfiles } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', founderIds);

    // Prepare data for GPT-4o
    const founderProfileData: FounderData = {
      id: founderData.id,
      name: founderProfile?.name || null,
      location: founderData.location,
      timezone: founderData.timezone,
      skills: founderData.skills,
      industries: founderData.industries,
      cofounder_preference: founderData.cofounder_preference,
      commitment_level: founderData.commitment_level,
      availability_hours: founderData.availability_hours,
      communication_style: founderData.communication_style,
      bio: founderData.bio,
    };

    const cofoundersProfiles: CoFounderData[] = foundersData.map(founder => {
      const profile = founderProfiles?.find(p => p.id === founder.id);
      return {
        id: founder.id,
        name: profile?.name || null,
        bio: founder.bio,
        location: founder.location,
        timezone: founder.timezone,
        skills: founder.skills,
        industries: founder.industries,
        cofounder_preference: founder.cofounder_preference,
        commitment_level: founder.commitment_level,
        availability_hours: founder.availability_hours,
        communication_style: founder.communication_style,
        linkedin_url: founder.linkedin_url,
        github_url: founder.github_url,
      };
    });

    // Call GPT-4o for recommendations
    console.log('Founder profile data:', JSON.stringify(founderProfileData, null, 2));
    console.log('Available co-founders count:', cofoundersProfiles.length);
    console.log('Sample co-founder data:', JSON.stringify(cofoundersProfiles.slice(0, 2), null, 2));
    
    const recommendations = await getGPTRecommendations(founderProfileData, cofoundersProfiles);
    
    if (!recommendations || recommendations.length === 0) {
      return NextResponse.json({ 
        recommendations: [],
        cached: false,
        message: 'Unable to generate recommendations at this time'
      });
    }

    // Store recommendations in database
    const recommendationsToInsert = recommendations.map(rec => ({
      founder_id: user.id,
      recommended_cofounder_id: rec.cofounder_id,
      match_score: rec.match_score,
      match_percentage: rec.match_percentage,
      match_reasoning: rec.reasoning,
    }));

    const { error: insertError } = await supabase
      .from('co_founder_recommendations')
      .insert(recommendationsToInsert);

    if (insertError) {
      console.error('Error storing recommendations:', insertError);
      // Continue anyway, we can still return the recommendations
    }

    // Fetch the stored recommendations with full data
    const { data: storedRecommendations, error: fetchError } = await supabase
      .from('co_founder_recommendations')
      .select('*')
      .eq('founder_id', user.id)
      .in('recommended_cofounder_id', recommendations.map(r => r.cofounder_id))
      .order('match_score', { ascending: false })
      .limit(2); // Limit to 2 recommendations as requested

    if (fetchError) {
      console.error('Error fetching stored recommendations:', fetchError);
    }

    // Enrich recommendations with complete co-founder data
    const enrichedRecommendations = await enrichRecommendationsWithCoFounderData(storedRecommendations || [], supabase);

    return NextResponse.json({
      recommendations: enrichedRecommendations,
      cached: false
    });

  } catch (error) {
    console.error('Error in co-founders recommendations API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getGPTRecommendations(
  founder: FounderData,
  cofounders: CoFounderData[]
): Promise<Recommendation[]> {
  const prompt = `
You are an AI assistant that matches startup founders with potential co-founders based on compatibility.

FOUNDER PROFILE:
- Name: ${founder.name || 'Not provided'}
- Location: ${founder.location || 'Not provided'}
- Timezone: ${founder.timezone || 'Not provided'}
- Skills: ${founder.skills?.join(', ') || 'Not provided'}
- Industries: ${founder.industries?.join(', ') || 'Not provided'}
- Co-founder Preference: ${founder.cofounder_preference || 'Not provided'}
- Commitment Level: ${founder.commitment_level || 'Not provided'}
- Availability Hours: ${founder.availability_hours || 'Not provided'}
- Communication Style: ${founder.communication_style || 'Not provided'}
- Bio: ${founder.bio || 'Not provided'}

AVAILABLE CO-FOUNDERS (${cofounders.length} total):
${cofounders.map((cofounder, index) => `
${index + 1}. ID: ${cofounder.id}
   Name: ${cofounder.name || 'Not provided'}
   Bio: ${cofounder.bio || 'Not provided'}
   Location: ${cofounder.location || 'Not provided'}
   Timezone: ${cofounder.timezone || 'Not provided'}
   Skills: ${cofounder.skills?.join(', ') || 'Not provided'}
   Industries: ${cofounder.industries?.join(', ') || 'Not provided'}
   Co-founder Preference: ${cofounder.cofounder_preference || 'Not provided'}
   Commitment Level: ${cofounder.commitment_level || 'Not provided'}
   Availability Hours: ${cofounder.availability_hours || 'Not provided'}
   Communication Style: ${cofounder.communication_style || 'Not provided'}
   LinkedIn: ${cofounder.linkedin_url || 'Not provided'}
   GitHub: ${cofounder.github_url || 'Not provided'}
`).join('\n')}

TASK:
Analyze the founder's profile and match them with the top 2 most compatible co-founders from the list above. Consider:
1. Skill complementarity (founder's skills vs co-founder's skills)
2. Industry alignment
3. Communication style compatibility
4. Availability alignment
5. Commitment level alignment
6. Geographic/timezone compatibility
7. Co-founder preference alignment
8. Complementary expertise areas

You MUST return exactly 2 recommendations in the following JSON format. Do not return an empty array. If there are fewer than 2 co-founders available, still return the available ones with appropriate match scores.

Return your response as a JSON array with this exact format (NO markdown code blocks, no additional text, just pure JSON):
[
  {
    "cofounder_id": "actual-cofounder-id-from-list-above",
    "match_score": 0.95,
    "match_percentage": 95,
    "reasoning": "Detailed explanation of why this is a good match, including specific skills, experience, and compatibility factors."
  },
  {
    "cofounder_id": "actual-cofounder-id-from-list-above",
    "match_score": 0.85,
    "match_percentage": 85,
    "reasoning": "Detailed explanation of why this is a good match, including specific skills, experience, and compatibility factors."
  }
]

CRITICAL: 
- Return ONLY the JSON array above
- Use actual cofounder_id values from the list above
- Match scores should be between 0.0 and 1.0
- Match percentages should be between 0 and 100
- Do NOT return an empty array []
- Do NOT include any markdown formatting or code blocks
`;

  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return [];
    }

    if (!cofounders || cofounders.length === 0) {
      console.log('No co-founders available for matching');
      return [];
    }

    console.log(`Processing ${cofounders.length} co-founders for matching with founder ${founder.id}`);
    
    // Check if founder has enough data for meaningful matching
    const hasMinimalData = founder.bio || (founder.skills && founder.skills.length > 0) || (founder.industries && founder.industries.length > 0);
    if (!hasMinimalData) {
      console.log('Founder has insufficient data for meaningful matching, using fallback');
      return cofounders.slice(0, 2).map((cofounder, index) => ({
        cofounder_id: cofounder.id,
        match_score: 0.7 - (index * 0.1),
        match_percentage: Math.round((0.7 - (index * 0.1)) * 100),
        reasoning: `Basic recommendation - please complete your profile for better matching. This co-founder has skills in ${cofounder.skills?.join(', ') || 'various areas'}.`
      }));
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert startup advisor who specializes in matching founders with compatible co-founders. You must respond with ONLY valid JSON - no markdown formatting, no code blocks, no additional text. Just the raw JSON array."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from GPT-4o');
    }

    console.log('GPT-4o raw response:', response);
    console.log('Response length:', response.length);
    console.log('Response type:', typeof response);

    // Extract JSON from markdown code blocks if present
    let jsonResponse = response.trim();
    
    // Remove markdown code blocks if present
    if (jsonResponse.startsWith('```json')) {
      jsonResponse = jsonResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonResponse.startsWith('```')) {
      jsonResponse = jsonResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Parse the JSON response
    let recommendations;
    try {
      recommendations = JSON.parse(jsonResponse);
    } catch (parseError) {
      console.error('Failed to parse GPT response as JSON:', parseError);
      console.error('Raw response:', response);
      console.error('Cleaned response:', jsonResponse);
      throw new Error('Invalid JSON response from GPT-4o');
    }
    
    // Validate the response format
    if (!Array.isArray(recommendations)) {
      console.error('GPT response is not an array:', recommendations);
      throw new Error('Invalid response format from GPT-4o - expected array');
    }

    // Validate each recommendation has required fields
    const validRecommendations = recommendations.filter(rec => {
      return rec && 
             typeof rec.cofounder_id === 'string' && 
             typeof rec.match_score === 'number' && 
             typeof rec.match_percentage === 'number' &&
             typeof rec.reasoning === 'string' &&
             rec.match_score >= 0 && rec.match_score <= 1 &&
             rec.match_percentage >= 0 && rec.match_percentage <= 100;
    });

    if (validRecommendations.length === 0) {
      console.error('No valid recommendations found in GPT response:', recommendations);
      throw new Error('No valid recommendations returned from GPT-4o');
    }

    return validRecommendations.slice(0, 2); // Ensure we only return top 2

  } catch (error) {
    console.error('Error calling GPT-4o:', error);
    
    // Fallback: return some basic recommendations if GPT fails
    // This ensures the user still gets some results even if GPT is down
    if (cofounders.length > 0) {
      console.log('Using fallback recommendations due to GPT error');
      const fallbackCount = Math.min(2, cofounders.length);
      return cofounders.slice(0, fallbackCount).map((cofounder, index) => {
        const matchScore = 0.8 - (index * 0.1); // Decreasing scores
        return {
          cofounder_id: cofounder.id,
          match_score: matchScore,
          match_percentage: Math.round(matchScore * 100),
          reasoning: `Fallback recommendation based on availability and basic compatibility. This co-founder has relevant skills in ${cofounder.skills?.join(', ') || 'various domains'} and is located in ${cofounder.location || 'unknown location'}.`
        };
      });
    }
    
    return [];
  }
}

async function enrichRecommendationsWithCoFounderData(recommendations: DatabaseRecommendation[], supabase: Awaited<ReturnType<typeof createClient>>) {
  if (!recommendations || recommendations.length === 0) {
    return [];
  }

  const cofounderIds = recommendations.map(rec => rec.recommended_cofounder_id);
  
  // Fetch co-founder profiles
  const { data: cofounderProfiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .in('id', cofounderIds);

  // Fetch co-founder details
  const { data: cofounderDetails, error: detailsError } = await supabase
    .from('founders')
    .select('*')
    .in('id', cofounderIds);

  if (profileError || detailsError) {
    console.error('Error fetching co-founder data:', { profileError, detailsError });
    return recommendations; // Return original data if enrichment fails
  }

  // Enrich recommendations with complete data
  return recommendations.map((rec: DatabaseRecommendation) => {
    const profile = cofounderProfiles?.find((p: ProfileData) => p.id === rec.recommended_cofounder_id);
    const details = cofounderDetails?.find((d: CoFounderDetails) => d.id === rec.recommended_cofounder_id);
    
    return {
      ...rec,
      recommended_cofounder: {
        name: profile?.name || 'Anonymous Co-Founder',
        avatar_url: profile?.avatar_url || null
      },
      cofounder_details: {
        bio: details?.bio || null,
        location: details?.location || null,
        timezone: details?.timezone || null,
        skills: details?.skills || [],
        industries: details?.industries || [],
        cofounder_preference: details?.cofounder_preference || null,
        commitment_level: details?.commitment_level || null,
        availability_hours: details?.availability_hours || null,
        communication_style: details?.communication_style || null,
        linkedin_url: details?.linkedin_url || null,
        github_url: details?.github_url || null
      }
    };
  });
}
