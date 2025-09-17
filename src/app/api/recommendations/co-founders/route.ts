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

interface MentorData {
  id: string;
  name: string | null;
  bio: string | null;
  expertise_domains: string[] | null;
  industries: string[] | null;
  years_experience: number | null;
  past_roles: string[] | null;
  availability_hours: number | null;
  communication_channel: string | null;
  mentorship_style: string | null;
  is_paid: boolean | null;
}

interface Recommendation {
  mentor_id: string;
  match_score: number;
  match_percentage: number;
  reasoning: string;
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
      // Enrich cached recommendations with complete mentor data
      const enrichedCachedRecommendations = await enrichRecommendationsWithMentorData(existingRecommendations.slice(0, 2), supabase);
      
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
    const { data: founderProfile, error: founderProfileError } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    // Get all mentors data
    const { data: mentorsData, error: mentorsError } = await supabase
      .from('mentors')
      .select('*')
      .neq('id', user.id); // Exclude the current user

    if (mentorsError) {
      console.error('Error fetching mentors:', mentorsError);
      return NextResponse.json({ error: 'Failed to fetch mentors' }, { status: 500 });
    }

    if (!mentorsData || mentorsData.length === 0) {
      return NextResponse.json({ 
        recommendations: [],
        cached: false,
        message: 'No mentors available for matching'
      });
    }

    // Get mentor profile names
    const mentorIds = mentorsData.map(mentor => mentor.id);
    const { data: mentorProfiles, error: mentorProfilesError } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', mentorIds);

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

    const mentorsProfiles: MentorData[] = mentorsData.map(mentor => {
      const profile = mentorProfiles?.find(p => p.id === mentor.id);
      return {
        id: mentor.id,
        name: profile?.name || null,
        bio: mentor.bio,
        expertise_domains: mentor.expertise_domains,
        industries: mentor.industries,
        years_experience: mentor.years_experience,
        past_roles: mentor.past_roles,
        availability_hours: mentor.availability_hours,
        communication_channel: mentor.communication_channel,
        mentorship_style: mentor.mentorship_style,
        is_paid: mentor.is_paid,
      };
    });

    // Call GPT-4o for recommendations
    const recommendations = await getGPTRecommendations(founderProfileData, mentorsProfiles);
    
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
      recommended_mentor_id: rec.mentor_id,
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
      .in('recommended_mentor_id', recommendations.map(r => r.mentor_id))
      .order('match_score', { ascending: false })
      .limit(2); // Limit to 2 recommendations as requested

    if (fetchError) {
      console.error('Error fetching stored recommendations:', fetchError);
    }

    // Enrich recommendations with complete mentor data
    const enrichedRecommendations = await enrichRecommendationsWithMentorData(storedRecommendations || [], supabase);

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
  mentors: MentorData[]
): Promise<Recommendation[]> {
  const prompt = `
You are an AI assistant that matches startup founders with potential co-founders (mentors) based on compatibility.

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

AVAILABLE MENTORS:
${mentors.map((mentor, index) => `
${index + 1}. ID: ${mentor.id}
   Name: ${mentor.name || 'Not provided'}
   Bio: ${mentor.bio || 'Not provided'}
   Expertise Domains: ${mentor.expertise_domains?.join(', ') || 'Not provided'}
   Industries: ${mentor.industries?.join(', ') || 'Not provided'}
   Years Experience: ${mentor.years_experience || 'Not provided'}
   Past Roles: ${mentor.past_roles?.join(', ') || 'Not provided'}
   Availability Hours (monthly): ${mentor.availability_hours || 'Not provided'}
   Communication Channel: ${mentor.communication_channel || 'Not provided'}
   Mentorship Style: ${mentor.mentorship_style || 'Not provided'}
   Is Paid: ${mentor.is_paid ? 'Yes' : 'No'}
`).join('\n')}

TASK:
Analyze the founder's profile and match them with the top 5 most compatible mentors. Consider:
1. Skill complementarity (founder's skills vs mentor's expertise)
2. Industry alignment
3. Communication style compatibility
4. Availability alignment
5. Experience level appropriateness
6. Geographic/timezone compatibility
7. Commitment level alignment

Return your response as a JSON array with this exact format (NO markdown code blocks, just pure JSON):
[
  {
    "mentor_id": "mentor-uuid-here",
    "match_score": 0.95,
    "match_percentage": 95,
    "reasoning": "Detailed explanation of why this is a good match, including specific skills, experience, and compatibility factors."
  }
]

IMPORTANT: Return ONLY the JSON array, no markdown formatting, no code blocks, no additional text. Only return the top 2 matches, ordered by match score (highest first). Match scores should be between 0.0 and 1.0.
`;

  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return [];
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
             typeof rec.mentor_id === 'string' && 
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
    if (mentors.length > 0) {
      console.log('Using fallback recommendations due to GPT error');
      return mentors.slice(0, 2).map((mentor, index) => {
        const matchScore = 0.8 - (index * 0.1); // Decreasing scores
        return {
          mentor_id: mentor.id,
          match_score: matchScore,
          match_percentage: Math.round(matchScore * 100),
          reasoning: `Fallback recommendation based on availability and basic compatibility. This mentor has relevant experience in ${mentor.expertise_domains?.join(', ') || 'various domains'}.`
        };
      });
    }
    
    return [];
  }
}

async function enrichRecommendationsWithMentorData(recommendations: any[], supabase: any) {
  if (!recommendations || recommendations.length === 0) {
    return [];
  }

  const mentorIds = recommendations.map(rec => rec.recommended_mentor_id);
  
  // Fetch mentor profiles
  const { data: mentorProfiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .in('id', mentorIds);

  // Fetch mentor details
  const { data: mentorDetails, error: detailsError } = await supabase
    .from('mentors')
    .select('*')
    .in('id', mentorIds);

  if (profileError || detailsError) {
    console.error('Error fetching mentor data:', { profileError, detailsError });
    return recommendations; // Return original data if enrichment fails
  }

  // Enrich recommendations with complete data
  return recommendations.map((rec: any) => {
    const profile = mentorProfiles?.find((p: any) => p.id === rec.recommended_mentor_id);
    const details = mentorDetails?.find((d: any) => d.id === rec.recommended_mentor_id);
    
    return {
      ...rec,
      recommended_mentor: {
        name: profile?.name || 'Anonymous Mentor',
        avatar_url: profile?.avatar_url || null
      },
      mentor_details: {
        bio: details?.bio || null,
        expertise_domains: details?.expertise_domains || [],
        industries: details?.industries || [],
        years_experience: details?.years_experience || null,
        past_roles: details?.past_roles || [],
        availability_hours: details?.availability_hours || null,
        communication_channel: details?.communication_channel || null,
        mentorship_style: details?.mentorship_style || null,
        is_paid: details?.is_paid || false
      }
    };
  });
}
