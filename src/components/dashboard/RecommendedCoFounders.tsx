"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import CoFounderCard from "./CoFounderCard";

interface Recommendation {
  id: string;
  founder_id: string;
  recommended_mentor_id: string;
  match_score: number;
  match_percentage: number;
  match_reasoning: string;
  created_at: string;
  updated_at: string;
  recommended_mentor: {
    name: string;
    avatar_url: string | null;
  };
  mentor_details: {
    bio: string | null;
    expertise_domains: string[];
    industries: string[];
    years_experience: number | null;
    past_roles: string[];
    availability_hours: number | null;
    communication_channel: string | null;
    mentorship_style: string | null;
    is_paid: boolean;
  };
}

interface ApiResponse {
  recommendations: Recommendation[];
  cached: boolean;
}

export default function RecommendedCoFounders() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/recommendations/co-founders');
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data: ApiResponse = await response.json();
      setRecommendations(data.recommendations);
      setIsCached(data.cached);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCoFounderData = (rec: Recommendation) => {
    const mentor = rec.mentor_details;
    const profile = rec.recommended_mentor;
    const matchPercentage = rec.match_percentage || Math.round(rec.match_score * 100);
    
    return {
      name: profile.name,
      role: mentor.past_roles?.join(", ") || "Experienced Professional",
      lookingFor: "Co-founder/Advisor",
      location: "Remote", // We don't have location data for mentors
      description: mentor.bio || "Experienced professional looking to help startups grow.",
      skills: mentor.expertise_domains?.slice(0, 4) || [],
      rating: `${matchPercentage}% Match`,
      isOnline: true,
      avatar: profile.avatar_url || undefined,
      matchReasoning: rec.match_reasoning,
      matchScore: rec.match_score,
      matchPercentage: matchPercentage,
      yearsExperience: mentor.years_experience,
      isPaid: mentor.is_paid,
      industries: mentor.industries,
      communicationChannel: mentor.communication_channel,
      mentorshipStyle: mentor.mentorship_style,
      mentorId: rec.recommended_mentor_id,
    };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recommended Co-Founders
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isCached ? "AI-powered matches (cached)" : "AI-powered matches"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {loading && (
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Finding matches...</span>
              </div>
            )}
            <button
              onClick={fetchRecommendations}
              disabled={loading}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh recommendations"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => router.push('/co-founders')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium bg-white dark:bg-gray-800 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading && recommendations.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Finding your perfect co-founder matches...</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">This may take a few moments</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Unable to load recommendations</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchRecommendations}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No recommendations found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Complete your profile to get personalized co-founder recommendations.</p>
            <button
              onClick={fetchRecommendations}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {recommendations.map((recommendation) => (
              <CoFounderCard 
                key={recommendation.id} 
                {...formatCoFounderData(recommendation)} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
