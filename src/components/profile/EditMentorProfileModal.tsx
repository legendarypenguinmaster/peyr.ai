"use client";

import { useState, useEffect } from "react";
import { X, Save, MapPin, Users, Award, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Profile, MentorData } from "@/app/profile/types";

interface EditMentorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  mentorData: MentorData | null;
  onSave: (
    updatedProfile: Profile,
    updatedMentorData: MentorData | null
  ) => void;
}

export default function EditMentorProfileModal({
  isOpen,
  onClose,
  profile,
  mentorData,
  onSave,
}: EditMentorProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const supabase = createClient();

  const EXPERTISE_DOMAINS = [
    "Product Management",
    "Marketing & Growth",
    "Sales & Business Development",
    "Finance & Fundraising",
    "Operations & Strategy",
    "Technology & Engineering",
    "UI/UX Design",
    "Data Science & Analytics",
    "Legal & Compliance",
    "Human Resources",
    "Customer Success",
    "Content & Communications",
    "Partnerships",
    "International Expansion",
    "Crisis Management",
  ];

  const INDUSTRIES_OPTIONS = [
    "Technology",
    "Healthcare",
    "Fintech",
    "E-commerce",
    "Education",
    "Gaming",
    "SaaS",
    "AI/ML",
    "Blockchain",
    "Cybersecurity",
    "IoT",
    "Biotech",
    "Real Estate",
    "Transportation",
    "Energy",
    "Food & Beverage",
    "Fashion",
    "Entertainment",
    "Sports",
    "Travel",
    "Social Media",
    "Marketplace",
  ];

  const PAST_ROLES = [
    "CEO/Founder",
    "CTO/Technical Co-founder",
    "VP of Engineering",
    "VP of Product",
    "VP of Marketing",
    "VP of Sales",
    "Head of Operations",
    "Head of Design",
    "Senior Product Manager",
    "Senior Engineer",
    "Marketing Director",
    "Sales Director",
    "Business Development Manager",
    "Investment Banker",
    "Management Consultant",
    "Venture Capitalist",
    "Angel Investor",
    "Board Member",
    "Advisor",
    "Other",
  ];

  const MENTORSHIP_STYLES = [
    { value: "advice-only", label: "Advice & Guidance Only" },
    { value: "hands-on", label: "Hands-on Support & Implementation" },
    { value: "strategic", label: "Strategic Planning & Direction" },
    { value: "networking", label: "Networking & Introductions" },
    { value: "mixed", label: "Mixed Approach" },
  ];

  // Form state
  const [formData, setFormData] = useState({
    // Profile data
    name: profile?.name || "",
    title: mentorData?.title || "",
    bio: mentorData?.bio ?? profile?.bio ?? "",
    location: mentorData?.location ?? profile?.location ?? "",
    linkedin_url: mentorData?.linkedin_url ?? profile?.linkedin_url ?? "",
    github_url: mentorData?.github_url ?? profile?.github_url ?? "",
    timezone: mentorData?.timezone ?? "",

    // Mentor-specific data
    expertise_domains: mentorData?.expertise_domains || [],
    past_roles: mentorData?.past_roles || [],
    industries: mentorData?.industries || [],
    communication_channel: mentorData?.communication_channel || "",
    mentorship_style: mentorData?.mentorship_style || "",
    is_paid: mentorData?.is_paid || false,
    years_experience: mentorData?.years_experience || 0,
    availability_hours: mentorData?.availability_hours || 0,
  });

  const [newExpertise, setNewExpertise] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newIndustry, setNewIndustry] = useState("");

  const COMMUNICATION_CHANNELS = [
    { value: "email", label: "Email" },
    { value: "video-calls", label: "Video Calls (Zoom, Meet)" },
    { value: "phone", label: "Phone Calls" },
    { value: "slack", label: "Slack/Discord" },
    { value: "in-person", label: "In-person Meetings" },
    { value: "mixed", label: "Mixed (Email + Calls)" },
  ];

  useEffect(() => {
    if (isOpen) {
      setFormData({
        // Profile data
        name: profile?.name || "",
        title: mentorData?.title || "",
        bio: mentorData?.bio ?? profile?.bio ?? "",
        location: mentorData?.location ?? profile?.location ?? "",
        linkedin_url: mentorData?.linkedin_url ?? profile?.linkedin_url ?? "",
        github_url: mentorData?.github_url ?? profile?.github_url ?? "",
        timezone: mentorData?.timezone ?? "",

        // Mentor-specific data
        expertise_domains: mentorData?.expertise_domains || [],
        past_roles: mentorData?.past_roles || [],
        industries: mentorData?.industries || [],
        communication_channel: mentorData?.communication_channel || "",
        mentorship_style: mentorData?.mentorship_style || "",
        is_paid: mentorData?.is_paid || false,
        years_experience: mentorData?.years_experience || 0,
        availability_hours: mentorData?.availability_hours || 0,
      });
    }
  }, [isOpen, profile, mentorData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const addItem = (
    field: "expertise_domains" | "past_roles" | "industries",
    newValue: string,
    setter: (value: string) => void
  ) => {
    if (newValue.trim() && !formData[field].includes(newValue.trim())) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], newValue.trim()],
      }));
      setter("");
    }
  };

  const removeItem = (
    field: "expertise_domains" | "past_roles" | "industries",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // Update profile data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
        })
        .eq("id", profile.id);

      if (profileError) throw profileError;

      // Update mentor data
      const mentorDataToUpdate = {
        title: formData.title,
        expertise_domains: formData.expertise_domains,
        past_roles: formData.past_roles,
        industries: formData.industries,
        bio: formData.bio,
        location: formData.location,
        timezone: formData.timezone,
        linkedin_url: formData.linkedin_url,
        github_url: formData.github_url,
        communication_channel: formData.communication_channel,
        mentorship_style: formData.mentorship_style,
        is_paid: formData.is_paid,
        years_experience: formData.years_experience,
        availability_hours: formData.availability_hours,
      };

      const { error: mentorError } = await supabase
        .from("mentors")
        .update(mentorDataToUpdate)
        .eq("id", profile.id);

      if (mentorError) throw mentorError;

      // Construct updated profile object
      const updatedProfile: Profile = {
        ...profile,
        name: formData.name,
        bio: formData.bio, // mirrored for display compatibility
        location: formData.location, // mirrored for display compatibility
      };

      // Construct updated mentor data object
      const updatedMentorData = mentorData
        ? { ...mentorData, ...mentorDataToUpdate }
        : null;

      onSave(updatedProfile, updatedMentorData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Edit Mentor Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: "basic", label: "Basic Info", icon: Users },
            { id: "experience", label: "Experience", icon: Award },
            { id: "social", label: "Social Links", icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {activeTab === "basic" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., Full Stack Developer, Product Manager, CEO"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Tell us about yourself and your expertise..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <input
                    type="text"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., PST, EST, UTC"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "experience" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    name="years_experience"
                    value={formData.years_experience}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability (hours per week)
                  </label>
                  <input
                    type="number"
                    name="availability_hours"
                    value={formData.availability_hours}
                    onChange={handleInputChange}
                    min="0"
                    max="168"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expertise Domains
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={newExpertise}
                      onChange={(e) => setNewExpertise(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Select expertise domain</option>
                      {EXPERTISE_DOMAINS.map((domain) => (
                        <option key={domain} value={domain}>
                          {domain}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        addItem(
                          "expertise_domains",
                          newExpertise,
                          setNewExpertise
                        )
                      }
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.expertise_domains.map((domain, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2"
                      >
                        {domain}
                        <button
                          type="button"
                          onClick={() => removeItem("expertise_domains", index)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Past Roles
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Select past role</option>
                      {PAST_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => addItem("past_roles", newRole, setNewRole)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.past_roles.map((role, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                      >
                        {role}
                        <button
                          type="button"
                          onClick={() => removeItem("past_roles", index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industries
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={newIndustry}
                      onChange={(e) => setNewIndustry(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Select industry</option>
                      {INDUSTRIES_OPTIONS.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        addItem("industries", newIndustry, setNewIndustry)
                      }
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.industries.map((industry, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2"
                      >
                        {industry}
                        <button
                          type="button"
                          onClick={() => removeItem("industries", index)}
                          className="text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Communication Channel
                </label>
                <select
                  name="communication_channel"
                  value={formData.communication_channel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select communication channel</option>
                  {COMMUNICATION_CHANNELS.map((channel) => (
                    <option key={channel.value} value={channel.value}>
                      {channel.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mentorship Style
                </label>
                <select
                  name="mentorship_style"
                  value={formData.mentorship_style}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select mentorship style</option>
                  {MENTORSHIP_STYLES.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paid Mentorship
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="is_paid"
                    checked={formData.is_paid}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-700">
                    {formData.is_paid
                      ? "Yes, I offer paid mentorship"
                      : "No, I offer free mentorship"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "social" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="https://linkedin.com/in/yourusername"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    name="github_url"
                    value={formData.github_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="https://github.com/yourusername"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
