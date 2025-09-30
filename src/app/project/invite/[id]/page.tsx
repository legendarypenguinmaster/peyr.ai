"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PublicHeader from "@/components/layout/PublicHeader";
import { ArrowLeft, User, MapPin, Briefcase, Send, Check, Clock } from "lucide-react";
import Image from "next/image";

interface Project {
  id: string;
  title: string;
  description: string;
  industry: string;
  stage: string;
  commitment: string;
  roleNeeded: string;
  requiredSkills: string[];
  status: string;
  budget?: number;
  deadline?: string;
  keywords: string[];
  createdAt: string;
  author: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
}

interface CoFounder {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  role?: string;
  skills?: string[];
  industries?: string[];
  commitment_level?: string;
  availability_hours?: number;
  match_score: number;
  match_reason: string;
}

export default function ProjectInvitePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [coFounders, setCoFounders] = useState<CoFounder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);
  const [invited, setInvited] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch project details
        const projectResponse = await fetch(`/api/projects/${projectId}`);
        if (projectResponse.ok) {
          const projectData = await projectResponse.json();
          setProject(projectData.project);
        }

        // Fetch co-founder recommendations
        setLoadingRecommendations(true);
        const recommendationsResponse = await fetch(`/api/ai/recommend-cofounders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ projectId }),
        });

        if (recommendationsResponse.ok) {
          const recommendationsData = await recommendationsResponse.json();
          setCoFounders(recommendationsData.coFounders);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        setLoadingRecommendations(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const handleInvite = async (coFounderId: string) => {
    setInviting(coFounderId);
    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          coFounderId,
          message: `Hi! I'd like to invite you to join my project "${project?.title}". I think your skills and experience would be a great fit for our team.`
        }),
      });

      if (response.ok) {
        setInvited(prev => new Set([...prev, coFounderId]));
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
    } finally {
      setInviting(null);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 80) return "text-blue-600 dark:text-blue-400";
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getMatchScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-100 dark:bg-green-900/30";
    if (score >= 80) return "bg-blue-100 dark:bg-blue-900/30";
    if (score >= 70) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-gray-100 dark:bg-gray-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PublicHeader />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PublicHeader />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Project Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The project you&apos;re looking for doesn&apos;t exist.
            </p>
            <button
              onClick={() => router.push('/projects')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicHeader />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/projects')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Projects
          </button>
          
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h1 className="text-3xl font-bold mb-4">Find Your Co-Founder</h1>
            <p className="text-xl text-blue-100 mb-6">
              {loadingRecommendations 
                ? "AI is finding the best mentors/co-founders for your project..." 
                : `AI has found ${coFounders.length} potential mentors/co-founders for your project`
              }
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm">
                {project.title}
              </span>
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm">
                {project.industry}
              </span>
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm">
                Looking for: {project.roleNeeded}
              </span>
            </div>
          </div>
        </div>

        {/* Loading Recommendations */}
        {loadingRecommendations && (
          <div className="text-center py-16">
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 border-r-blue-600 dark:border-r-blue-400"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 animate-pulse"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              AI Finding Matching Co-Founders
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Our AI is analyzing your project requirements and matching you with the best mentors and co-founders based on skills, experience, and industry fit...
            </p>
            
            {/* Animated progress dots */}
            <div className="flex justify-center space-x-2 mb-6">
              <div className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>

            {/* Loading steps */}
            <div className="max-w-sm mx-auto">
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Analyzing project requirements</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <span>Matching skills and experience</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <span>Calculating compatibility scores</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Co-Founders Grid */}
        {!loadingRecommendations && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coFounders.map((coFounder) => (
            <div key={coFounder.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  {coFounder.avatar_url ? (
                    <Image
                      src={coFounder.avatar_url}
                      alt={coFounder.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4 ${coFounder.avatar_url ? 'hidden' : 'flex'}`}
                  >
                    <span className="text-white font-bold text-lg">
                      {coFounder.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {coFounder.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {coFounder.role || 'Entrepreneur & Mentor'}
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreBg(coFounder.match_score)} ${getMatchScoreColor(coFounder.match_score)}`}>
                  {coFounder.match_score}% match
                </div>
              </div>

              {/* Bio */}
              {coFounder.bio && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {coFounder.bio}
                </p>
              )}

              {/* Location and Experience */}
              <div className="space-y-2 mb-3">
                {coFounder.location && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    {coFounder.location}
                  </div>
                )}
                {coFounder.availability_hours && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                    <Briefcase className="w-4 h-4 mr-2" />
                    {coFounder.availability_hours}h/week Available
                  </div>
                )}
                {coFounder.commitment_level && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    {coFounder.commitment_level} Commitment
                  </div>
                )}
              </div>

              {/* Skills */}
              {coFounder.skills && coFounder.skills.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {coFounder.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-md text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {coFounder.skills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md text-xs">
                        +{coFounder.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Match Reason */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Why they&apos;re a good match</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {coFounder.match_reason}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {invited.has(coFounder.id) ? (
                  <button
                    disabled
                    className="w-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 py-3 px-4 rounded-lg font-medium flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Invitation Sent
                  </button>
                ) : (
                  <button
                    onClick={() => handleInvite(coFounder.id)}
                    disabled={inviting === coFounder.id}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {inviting === coFounder.id ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Invitation
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Empty State */}
        {!loadingRecommendations && coFounders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Mentors/Co-Founders Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn&apos;t find any matching mentors/co-founders for your project at the moment.
            </p>
            <button
              onClick={() => router.push('/projects')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Back to Projects
            </button>
          </div>
        )}

        {/* Summary */}
        {!loadingRecommendations && coFounders.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Invitation Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {coFounders.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Potential Mentors/Co-Founders
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {invited.size}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Invitations Sent
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(coFounders.reduce((acc, cf) => acc + cf.match_score, 0) / coFounders.length)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Average Match Score
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
