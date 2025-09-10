"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardHeader from "@/components/layout/DashboardHeader";
import FormField from "@/components/auth/FormField";
import SubmitButton from "@/components/auth/SubmitButton";

export default function ProfileSetup() {
  const [formData, setFormData] = useState({
    professionalTitle: "",
    location: "",
    bio: "",
    experience: "",
    skills: [] as string[],
    interests: [] as string[],
    portfolioUrl: "",
    linkedinUrl: "",
    githubUrl: "",
  });
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Check authentication and fetch profile data on component mount
  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/sign-in");
          return;
        }
        setIsAuthenticated(true);

        // Fetch existing profile data
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile && !profileError) {
          // Check if we have any existing data
          const hasData =
            profile.professional_title ||
            profile.location ||
            profile.bio ||
            profile.experience ||
            (profile.skills && profile.skills.length > 0) ||
            (profile.interests && profile.interests.length > 0) ||
            profile.portfolio_url ||
            profile.linkedin_url ||
            profile.github_url;

          setHasExistingData(!!hasData);

          // Update form with existing data
          setFormData({
            professionalTitle: profile.professional_title || "",
            location: profile.location || "",
            bio: profile.bio || "",
            experience: profile.experience || "",
            skills: profile.skills || [],
            interests: profile.interests || [],
            portfolioUrl: profile.portfolio_url || "",
            linkedinUrl: profile.linkedin_url || "",
            githubUrl: profile.github_url || "",
          });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/auth/sign-in");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchProfile();
  }, [router, supabase.auth, supabase]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError(null);
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const addInterest = () => {
    if (
      newInterest.trim() &&
      !formData.interests.includes(newInterest.trim())
    ) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()],
      });
      setNewInterest("");
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(
        (interest) => interest !== interestToRemove
      ),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in to update your profile.");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          professional_title: formData.professionalTitle,
          location: formData.location,
          bio: formData.bio,
          experience: formData.experience,
          skills: formData.skills,
          interests: formData.interests,
          portfolio_url: formData.portfolioUrl,
          linkedin_url: formData.linkedinUrl,
          github_url: formData.githubUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Profile update error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Profile Updated Successfully!
            </h2>
            <p className="text-gray-600 mb-4">
              Your profile has been updated. Redirecting you to the dashboard...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {hasExistingData ? "Edit Profile" : "Profile Setup"}
          </h1>
          <p className="text-gray-600">
            {hasExistingData
              ? "Update your profile information to keep it current and improve your co-founder matches."
              : "Complete your profile to get better co-founder matches and increase your visibility."}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Professional Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Professional Information
              </h2>

              <FormField
                label="Professional Title"
                type="text"
                name="professionalTitle"
                placeholder="e.g., Senior Full-Stack Developer"
                value={formData.professionalTitle}
                onChange={handleChange}
              />

              <FormField
                label="Location"
                type="text"
                name="location"
                placeholder="e.g., San Francisco, CA"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            {/* Bio and Experience */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">About You</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  rows={4}
                  placeholder="Tell potential co-founders about yourself, your experience, and what you're looking for..."
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience
                </label>
                <textarea
                  name="experience"
                  rows={4}
                  placeholder="Describe your professional background and key achievements..."
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Skills</h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addSkill())
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>

              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Interests */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Interests</h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add an interest..."
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addInterest())
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={addInterest}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>

              {formData.interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="ml-2 text-green-600 hover:text-green-800 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* URLs */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                External Links
              </h2>

              <FormField
                label="Portfolio URL"
                type="url"
                name="portfolioUrl"
                placeholder="https://your-portfolio.com"
                value={formData.portfolioUrl}
                onChange={handleChange}
              />

              <FormField
                label="LinkedIn URL"
                type="url"
                name="linkedinUrl"
                placeholder="https://linkedin.com/in/yourname"
                value={formData.linkedinUrl}
                onChange={handleChange}
              />

              <FormField
                label="GitHub URL"
                type="url"
                name="githubUrl"
                placeholder="https://github.com/yourusername"
                value={formData.githubUrl}
                onChange={handleChange}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <SubmitButton
                text={hasExistingData ? "Update Profile" : "Save Profile"}
                loading={loading}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
