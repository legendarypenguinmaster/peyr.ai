"use client";

import { useState, useEffect } from "react";
import { X, Save, MapPin, Users, Award, TrendingUp, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Profile, FounderData } from "@/app/profile/types";

interface EditFounderProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  founderData: FounderData | null;
  onSave: (
    updatedProfile: Profile,
    updatedFounderData: FounderData | null
  ) => void;
}

export default function EditFounderProfileModal({
  isOpen,
  onClose,
  profile,
  founderData,
  onSave,
}: EditFounderProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const supabase = createClient();

  const SKILLS_OPTIONS = [
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

  const COMMITMENT_LEVELS = [
    { value: "part-time", label: "Part-time" },
    { value: "full-time", label: "Full-time" },
    { value: "flexible", label: "Flexible" },
  ];

  const COMMUNICATION_STYLES = [
    { value: "direct", label: "Direct & Straightforward" },
    { value: "collaborative", label: "Collaborative & Open" },
    { value: "analytical", label: "Analytical & Data-driven" },
    { value: "creative", label: "Creative & Innovative" },
  ];

  // Form state
  const [formData, setFormData] = useState({
    // Profile data
    name: profile?.name || "",
    bio: founderData?.bio ?? profile?.bio ?? "",
    location: founderData?.location ?? profile?.location ?? "",
    linkedin_url: founderData?.linkedin_url ?? profile?.linkedin_url ?? "",
    github_url: founderData?.github_url ?? profile?.github_url ?? "",
    timezone: founderData?.timezone ?? "",

    // Founder-specific data
    skills: founderData?.skills || [],
    industries: founderData?.industries || [],
    cofounder_preference: founderData?.cofounder_preference || "",
    commitment_level: founderData?.commitment_level || "",
    communication_style: founderData?.communication_style || "",
    availability_hours: founderData?.availability_hours || 0,
  });

  const [newSkill, setNewSkill] = useState("");
  const [newIndustry, setNewIndustry] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData({
        // Profile data
        name: profile?.name || "",
        bio: founderData?.bio ?? profile?.bio ?? "",
        location: founderData?.location ?? profile?.location ?? "",
        linkedin_url: founderData?.linkedin_url ?? profile?.linkedin_url ?? "",
        github_url: founderData?.github_url ?? profile?.github_url ?? "",
        timezone: founderData?.timezone ?? "",

        // Founder-specific data
        skills: founderData?.skills || [],
        industries: founderData?.industries || [],
        cofounder_preference: founderData?.cofounder_preference || "",
        commitment_level: founderData?.commitment_level || "",
        communication_style: founderData?.communication_style || "",
        availability_hours: founderData?.availability_hours || 0,
      });
    }
  }, [isOpen, profile, founderData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const addItem = (
    field: "skills" | "industries",
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

  const removeItem = (field: "skills" | "industries", index: number) => {
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

      // Update founder data
      const founderDataToUpdate = {
        skills: formData.skills,
        industries: formData.industries,
        bio: formData.bio,
        location: formData.location,
        timezone: formData.timezone,
        linkedin_url: formData.linkedin_url,
        github_url: formData.github_url,
        cofounder_preference: formData.cofounder_preference,
        commitment_level: formData.commitment_level,
        communication_style: formData.communication_style,
        availability_hours: formData.availability_hours,
      };

      const { error: founderError } = await supabase
        .from("founders")
        .update(founderDataToUpdate)
        .eq("id", profile.id);

      if (founderError) throw founderError;

      // Construct updated profile object
      const updatedProfile: Profile = {
        ...profile,
        name: formData.name,
        bio: formData.bio, // mirrored for display compatibility
        location: formData.location, // mirrored for display compatibility
      };

      // Construct updated founder data object
      const updatedFounderData = founderData
        ? { ...founderData, ...founderDataToUpdate }
        : null;

      onSave(updatedProfile, updatedFounderData);
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
            Edit Founder Profile
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
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Tell us about yourself and your startup..."
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
                    <Clock className="w-4 h-4 inline mr-1" />
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
                  Skills
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Select skill</option>
                      {SKILLS_OPTIONS.map((skill) => (
                        <option key={skill} value={skill}>
                          {skill}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => addItem("skills", newSkill, setNewSkill)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeItem("skills", index)}
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
                  Co-founder Preference
                </label>
                <textarea
                  name="cofounder_preference"
                  value={formData.cofounder_preference}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Describe what you're looking for in a co-founder..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commitment Level
                  </label>
                  <select
                    name="commitment_level"
                    value={formData.commitment_level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select commitment level</option>
                    {COMMITMENT_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Communication Style
                  </label>
                  <select
                    name="communication_style"
                    value={formData.communication_style}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select communication style</option>
                    {COMMUNICATION_STYLES.map((style) => (
                      <option key={style.value} value={style.value}>
                        {style.label}
                      </option>
                    ))}
                  </select>
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
