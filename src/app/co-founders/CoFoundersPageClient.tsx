"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Filter, Users, CheckCircle } from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import ConnectModal from "@/components/ConnectModal";
import CoFoundersRecommendedSection from "@/components/CoFoundersRecommendedSection";
import Image from "next/image";

interface Mentor {
  id: string;
  title?: string | null;
  bio?: string | null;
  expertise_domains: string[];
  industries: string[];
  years_experience: number | null;
  past_roles: string[];
  availability_hours: number | null;
  communication_channel: string | null;
  mentorship_style: string | null;
  is_paid: boolean | null;
  location?: string | null;
  timezone?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    name: string | null;
    email: string | null;
    avatar_url: string | null;
    role: string | null;
    id_verification: boolean;
  };
}

interface CoFoundersPageClientProps {
  mentors: Mentor[];
}

export default function CoFoundersPageClient({
  mentors,
}: CoFoundersPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [networkStats, setNetworkStats] = useState({
    sentRequests: 0,
    connections: 0,
    pending: 0,
    loading: true
  });
  const [connectionStatuses, setConnectionStatuses] = useState<Map<string, string>>(new Map());

  const fetchNetworkStats = useCallback(async () => {
    try {
      const supabase = createClient();
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Error getting user:', userError);
        setNetworkStats(prev => ({ ...prev, loading: false }));
        return;
      }

      // Fetch connections where user is the requester (sent requests)
      const { data: sentRequests, error: sentError } = await supabase
        .from('connections')
        .select('*')
        .eq('requester_id', user.id);

      // Fetch connections where user is the addressee (received requests)
      const { data: receivedRequests, error: receivedError } = await supabase
        .from('connections')
        .select('*')
        .eq('addressee_id', user.id);

      if (sentError || receivedError) {
        console.error('Error fetching connections:', { sentError, receivedError });
        setNetworkStats(prev => ({ ...prev, loading: false }));
        return;
      }

      // Calculate statistics
      const allConnections = [...(sentRequests || []), ...(receivedRequests || [])];
      const uniqueConnections = new Map();
      
      // Deduplicate connections (same two users should only count once)
      allConnections.forEach(conn => {
        const key = [conn.requester_id, conn.addressee_id].sort().join('-');
        if (!uniqueConnections.has(key)) {
          uniqueConnections.set(key, conn);
        }
      });

      const connections = Array.from(uniqueConnections.values());
      const acceptedConnections = connections.filter(conn => conn.status === 'accepted');
      const pendingConnections = connections.filter(conn => conn.status === 'pending');

      setNetworkStats({
        sentRequests: sentRequests?.length || 0,
        connections: acceptedConnections.length,
        pending: pendingConnections.length,
        loading: false
      });

    } catch (error) {
      console.error('Error fetching network stats:', error);
      setNetworkStats(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const fetchConnectionStatuses = useCallback(async () => {
    try {
      const supabase = createClient();
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Error getting user:', userError);
        return;
      }

      // Get all mentor IDs
      const mentorIds = mentors.map(mentor => mentor.id);
      
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
  }, [mentors]);

  // Fetch network statistics and connection statuses
  useEffect(() => {
    fetchNetworkStats();
    fetchConnectionStatuses();
  }, [mentors, fetchNetworkStats, fetchConnectionStatuses]);

  // Get all unique skills and industries for filter options
  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    mentors.forEach((mentor) => {
      mentor.expertise_domains?.forEach((skill) => skills.add(skill));
    });
    return Array.from(skills).sort();
  }, [mentors]);

  const allIndustries = useMemo(() => {
    const industries = new Set<string>();
    mentors.forEach((mentor) => {
      mentor.industries?.forEach((industry) => industries.add(industry));
    });
    return Array.from(industries).sort();
  }, [mentors]);

  // Filter mentors based on search and filters
  const filteredMentors = useMemo(() => {
    return mentors.filter((mentor) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        mentor.profiles.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        mentor.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.expertise_domains?.some((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        mentor.industries?.some((industry) =>
          industry.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Skills filter
      const matchesSkills =
        selectedSkills.length === 0 ||
        selectedSkills.every((skill) =>
          mentor.expertise_domains?.includes(skill)
        );

      // Industries filter
      const matchesIndustries =
        selectedIndustries.length === 0 ||
        selectedIndustries.every((industry) =>
          mentor.industries?.includes(industry)
        );

      return matchesSearch && matchesSkills && matchesIndustries;
    });
  }, [mentors, searchQuery, selectedSkills, selectedIndustries]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry]
    );
  };

  const clearFilters = () => {
    setSelectedSkills([]);
    setSelectedIndustries([]);
    setSearchQuery("");
  };

  const handleCardClick = (mentorId: string) => {
    window.open(`/profile/${mentorId}`, "_blank");
  };

  const handleConnect = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setIsConnectModalOpen(true);
  };

  const handleConnectSuccess = () => {
    setIsConnectModalOpen(false);
    setSelectedMentor(null);
    // Refresh network stats and connection statuses after successful connection
    fetchNetworkStats();
    fetchConnectionStatuses();
  };

  const getConnectionStatus = (mentorId: string) => {
    return connectionStatuses.get(mentorId) || 'none';
  };

  const getConnectionButton = (mentor: Mentor) => {
    const status = getConnectionStatus(mentor.id);
    
    switch (status) {
      case 'pending':
        return (
          <button
            disabled
            className="w-full bg-yellow-100 text-yellow-800 py-2 px-4 rounded-lg font-medium cursor-not-allowed"
          >
            Pending
          </button>
        );
      case 'accepted':
        return (
          <button
            disabled
            className="w-full bg-green-100 text-green-800 py-2 px-4 rounded-lg font-medium cursor-not-allowed"
          >
            Connected
          </button>
        );
      case 'declined':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleConnect(mentor);
            }}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Connect
          </button>
        );
      case 'blocked':
        return (
          <button
            disabled
            className="w-full bg-red-100 text-red-800 py-2 px-4 rounded-lg font-medium cursor-not-allowed"
          >
            Blocked
          </button>
        );
      default:
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleConnect(mentor);
            }}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Connect
          </button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Find Co-founders
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect with experienced mentors who can become your co-founders
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your Network
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sent Requests</span>
                  {networkStats.loading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                  ) : (
                  <span className="text-lg font-semibold text-blue-600">
                      {networkStats.sentRequests}
                  </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Connections</span>
                  {networkStats.loading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                  ) : (
                  <span className="text-lg font-semibold text-green-600">
                      {networkStats.connections}
                  </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                  {networkStats.loading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                  ) : (
                  <span className="text-lg font-semibold text-yellow-600">
                      {networkStats.pending}
                  </span>
                  )}
                </div>
              </div>
            </div>

            {/* Search and Filter Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Search & Filters
              </h3>

              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search co-founders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {(selectedSkills.length > 0 ||
                  selectedIndustries.length > 0) && (
                  <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    {selectedSkills.length + selectedIndustries.length}
                  </span>
                )}
              </button>

              {/* Filter Options */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  {/* Skills Filter */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Skills
                    </h4>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {allSkills.map((skill) => (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className={`px-2 py-1 rounded-full text-xs transition-colors ${
                            selectedSkills.includes(skill)
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Industries Filter */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Industries
                    </h4>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {allIndustries.map((industry) => (
                        <button
                          key={industry}
                          onClick={() => toggleIndustry(industry)}
                          className={`px-2 py-1 rounded-full text-xs transition-colors ${
                            selectedIndustries.includes(industry)
                              ? "bg-pink-100 text-pink-800 border border-pink-200"
                              : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                          }`}
                        >
                          {industry}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {(selectedSkills.length > 0 ||
                    selectedIndustries.length > 0) && (
                    <div className="pt-2 border-t border-gray-200">
                      <button
                        onClick={clearFilters}
                        className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* AI Recommended Section */}
            <CoFoundersRecommendedSection />

            {/* All Co-founders Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  All Co-founders
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredMentors.length} co-founders found
                </span>
              </div>

              {/* All Mentors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    onClick={() => handleCardClick(mentor.id)}
                    className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
                  >
                    {/* Avatar */}
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        {mentor.profiles.avatar_url ? (
                          <Image
                            src={mentor.profiles.avatar_url}
                            alt={mentor.profiles.name || "Mentor"}
                            width={80}
                            height={80}
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                            <Users className="w-10 h-10 text-white" />
                          </div>
                        )}
                        {mentor.profiles.id_verification && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Name */}
                    <div className="text-center mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {mentor.profiles.name || "Anonymous"}
                      </h3>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {mentor.title || "Professional"}
                      </p>
                    </div>

                    {/* Bio */}
                    <div className="mb-4 text-center">
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                        {mentor.bio || "No bio available yet."}
                      </p>
                    </div>

                    {/* Connect Button */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-600 mt-auto">
                        {getConnectionButton(mentor)}
                    </div>
                  </div>
                ))}
              </div>

              {/* No Results */}
              {filteredMentors.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No co-founders found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Try adjusting your search or filters to find more results.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Connect Modal */}
      <ConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        mentor={{
          id: selectedMentor?.profiles.id || "",
          name: selectedMentor?.profiles.name || "",
          avatar_url: selectedMentor?.profiles.avatar_url || null,
        }}
        onSuccess={handleConnectSuccess}
      />
    </div>
  );
}
