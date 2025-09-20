"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertCircle, Info, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ConnectModal from "./ConnectModal";
import Image from "next/image";

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

export default function CoFoundersRecommendedSection() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Recommendation | null>(null);
  const [isReasoningModalOpen, setIsReasoningModalOpen] = useState(false);
  const [selectedReasoning, setSelectedReasoning] = useState<{name: string, reasoning: string} | null>(null);
  const [connectionStatuses, setConnectionStatuses] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = refresh ? '/api/recommendations/co-founders?refresh=true' : '/api/recommendations/co-founders';
      const response = await fetch(url);
      
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

  const handleConnect = (recommendation: Recommendation) => {
    setSelectedMentor(recommendation);
    setIsConnectModalOpen(true);
  };

  const handleConnectSuccess = () => {
    setIsConnectModalOpen(false);
    setSelectedMentor(null);
    // Refresh connection statuses after successful connection
    fetchConnectionStatuses();
  };

  const handleShowReasoning = (recommendation: Recommendation) => {
    const mentorData = formatMentorData(recommendation);
    setSelectedReasoning({
      name: mentorData.name,
      reasoning: mentorData.match_reasoning
    });
    setIsReasoningModalOpen(true);
  };

  const handleCloseReasoning = () => {
    setIsReasoningModalOpen(false);
    setSelectedReasoning(null);
  };

  const fetchConnectionStatuses = useCallback(async () => {
    try {
      const supabase = createClient();
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Error getting user:', userError);
        return;
      }

      // Get all mentor IDs from recommendations
      const mentorIds = recommendations.map(rec => rec.recommended_mentor_id);
      
      if (mentorIds.length === 0) return;

      // Fetch all connections where current user is involved with any of these mentors
      const { data: connections, error: connectionsError } = await supabase
        .from('connections')
        .select('*')
        .or(`and(requester_id.eq.${user.id},addressee_id.in.(${mentorIds.join(',')})),and(addressee_id.eq.${user.id},requester_id.in.(${mentorIds.join(',')}))`);

      if (connectionsError) {
        console.error('Error fetching connection statuses:', connectionsError);
        return;
      }

      // Create a map of mentor ID to connection status
      const statusMap = new Map<string, string>();
      
      connections?.forEach(connection => {
        const mentorId = connection.requester_id === user.id ? connection.addressee_id : connection.requester_id;
        statusMap.set(mentorId, connection.status);
      });

      setConnectionStatuses(statusMap);

    } catch (error) {
      console.error('Error fetching connection statuses:', error);
    }
  }, [recommendations]);

  useEffect(() => {
    if (recommendations.length > 0) {
      fetchConnectionStatuses();
    }
  }, [recommendations, fetchConnectionStatuses]);

  const getConnectionStatus = (mentorId: string) => {
    return connectionStatuses.get(mentorId) || 'none';
  };

  const getConnectionButton = (recommendation: Recommendation) => {
    const status = getConnectionStatus(recommendation.recommended_mentor_id);
    
    switch (status) {
      case 'pending':
        return (
          <button
            disabled
            className="w-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 py-2 px-4 rounded-lg font-medium cursor-not-allowed"
          >
            Pending
          </button>
        );
      case 'accepted':
        return (
          <button
            disabled
            className="w-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 py-2 px-4 rounded-lg font-medium cursor-not-allowed"
          >
            Connected
          </button>
        );
      case 'declined':
        return (
          <button
            onClick={() => handleConnect(recommendation)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Connect
          </button>
        );
      case 'blocked':
        return (
          <button
            disabled
            className="w-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 py-2 px-4 rounded-lg font-medium cursor-not-allowed"
          >
            Blocked
          </button>
        );
      default:
        return (
          <button
            onClick={() => handleConnect(recommendation)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Connect
          </button>
        );
    }
  };

  const formatMentorData = (rec: Recommendation) => {
    const mentor = rec.mentor_details;
    const profile = rec.recommended_mentor;
    const matchPercentage = rec.match_percentage || Math.round(rec.match_score * 100);
    
    return {
      id: rec.recommended_mentor_id,
      name: profile.name,
      avatar_url: profile.avatar_url,
      title: mentor.past_roles?.join(", ") || "Experienced Professional",
      bio: mentor.bio || "Experienced professional looking to help startups grow.",
      expertise_domains: mentor.expertise_domains || [],
      industries: mentor.industries || [],
      years_experience: mentor.years_experience,
      is_paid: mentor.is_paid,
      match_percentage: matchPercentage,
      match_reasoning: rec.match_reasoning,
    };
  };

  if (loading && recommendations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            AI Recommended for You
          </h2>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Finding matches...</span>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Finding your perfect co-founder matches...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This may take a few moments</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            AI Recommended for You
          </h2>
        </div>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Unable to load recommendations</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => fetchRecommendations()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            AI Recommended for You
          </h2>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No recommendations found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Complete your profile to get personalized co-founder recommendations.</p>
          <button
            onClick={() => fetchRecommendations(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate Recommendations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            AI Recommended for You
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isCached ? "AI-powered matches (cached)" : "Fresh AI-powered matches"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {loading && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Refreshing...</span>
            </div>
          )}
          <button
            onClick={() => fetchRecommendations(true)}
            disabled={loading}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh recommendations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Recommended Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((recommendation) => {
          const mentorData = formatMentorData(recommendation);
          
          return (
            <div
              key={recommendation.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-6 hover:shadow-md transition-shadow flex flex-col h-full"
            >
              {/* Match Percentage Badge */}
              <div className="flex justify-between items-start mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700">
                  {mentorData.match_percentage}% Match
                </span>
                {mentorData.years_experience && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                    {mentorData.years_experience}+ years exp
                  </span>
                )}
              </div>

              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  {mentorData.avatar_url ? (
                    <Image
                      src={mentorData.avatar_url}
                      alt={mentorData.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Name */}
              <div className="text-center mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                  {mentorData.name}
                </h3>
              </div>

              {/* Title */}
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {mentorData.title}
                </p>
              </div>

              {/* Bio */}
              <div className="mb-4 text-center flex-1">
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                  {mentorData.bio}
                </p>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-4 justify-center">
                {mentorData.expertise_domains.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Match Reasoning Button */}
              <div className="mb-4">
                <button
                  onClick={() => handleShowReasoning(recommendation)}
                  className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors w-full justify-center"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Why this match?</span>
                  <Info className="w-3 h-3" />
                </button>
              </div>

              {/* Connect Button */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-600 mt-auto">
                {getConnectionButton(recommendation)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Connect Modal */}
      <ConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        mentor={{
          id: selectedMentor?.recommended_mentor_id || "",
          name: selectedMentor?.recommended_mentor.name || "",
          avatar_url: selectedMentor?.recommended_mentor.avatar_url || null,
        }}
        onSuccess={handleConnectSuccess}
      />

      {/* Match Reasoning Modal */}
      {isReasoningModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    AI Match Analysis
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Why {selectedReasoning?.name} is recommended for you
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseReasoning}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
                      Detailed Match Analysis
                    </h3>
                    <div className="prose prose-blue max-w-none">
                      <p className="text-blue-800 dark:text-blue-300 leading-relaxed whitespace-pre-wrap">
                        {selectedReasoning?.reasoning}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCloseReasoning}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
