"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Filter, Users, CheckCircle } from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
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
  const [connectionMessage, setConnectionMessage] = useState("");
  const [isSendingRequest, setIsSendingRequest] = useState(false);

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

  const handleSendConnection = async () => {
    if (!selectedMentor || !connectionMessage.trim()) return;

    setIsSendingRequest(true);
    const supabase = createClient();

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Error getting user:", userError);
        return;
      }

      // Create connection request
      const { error } = await supabase.from("connections").insert({
        requester_id: user.id,
        addressee_id: selectedMentor.profiles.id,
        message: connectionMessage.trim(),
        status: "pending",
      });

      if (error) {
        console.error("Error sending connection request:", error);
        alert("Failed to send connection request. Please try again.");
      } else {
        // Success - close modal and reset
        setIsConnectModalOpen(false);
        setConnectionMessage("");
        setSelectedMentor(null);
        alert("Connection request sent successfully!");
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      alert("Failed to send connection request. Please try again.");
    } finally {
      setIsSendingRequest(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Co-founders
          </h1>
          <p className="text-gray-600">
            Connect with experienced mentors who can become your co-founders
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Network
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sent Requests</span>
                  <span className="text-lg font-semibold text-blue-600">
                    12
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Connections</span>
                  <span className="text-lg font-semibold text-green-600">
                    47
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-lg font-semibold text-yellow-600">
                    5
                  </span>
                </div>
              </div>
            </div>

            {/* Search and Filter Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recommended for You
                </h2>
                <span className="text-sm text-gray-500">
                  Based on your profile and preferences
                </span>
              </div>

              {/* Recommended Mentors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMentors.slice(0, 6).map((mentor) => (
                  <div
                    key={mentor.id}
                    onClick={() => handleCardClick(mentor.id)}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
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
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {mentor.profiles.name || "Anonymous"}
                      </h3>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600 font-medium">
                        {mentor.title || "Professional"}
                      </p>
                    </div>

                    {/* Bio */}
                    <div className="mb-4 text-center">
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {mentor.bio || "No bio available yet."}
                      </p>
                    </div>

                    {/* Connect Button */}
                    <div className="pt-4 border-t border-gray-100 mt-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnect(mentor);
                        }}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Co-founders Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  All Co-founders
                </h2>
                <span className="text-sm text-gray-500">
                  {filteredMentors.length} co-founders found
                </span>
              </div>

              {/* All Mentors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    onClick={() => handleCardClick(mentor.id)}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
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
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {mentor.profiles.name || "Anonymous"}
                      </h3>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600 font-medium">
                        {mentor.title || "Professional"}
                      </p>
                    </div>

                    {/* Bio */}
                    <div className="mb-4 text-center">
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {mentor.bio || "No bio available yet."}
                      </p>
                    </div>

                    {/* Connect Button */}
                    <div className="pt-4 border-t border-gray-100 mt-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnect(mentor);
                        }}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Results */}
              {filteredMentors.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No co-founders found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search or filters to find more results.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-purple-600 hover:text-purple-700 font-medium"
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
      {isConnectModalOpen && selectedMentor && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Send Connection Request
              </h2>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  You&apos;re about to send a connection request to{" "}
                  <span className="font-semibold text-gray-900">
                    {selectedMentor.profiles.name}
                  </span>
                  .
                </p>

                <label
                  htmlFor="connection-message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="connection-message"
                  value={connectionMessage}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setConnectionMessage(e.target.value);
                    }
                  }}
                  placeholder="Add a personal message to your connection request..."
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {connectionMessage.length}/500 characters
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendConnection}
                disabled={!connectionMessage.trim() || isSendingRequest}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSendingRequest ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
