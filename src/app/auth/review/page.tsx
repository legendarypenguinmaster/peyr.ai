"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/auth/AuthLayout";
import { RootState } from "@/store/store";

export default function Review() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Get data from Redux state
  const { profile, founder, mentor, role } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    const getUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/sign-in");
          return;
        }
        setUser(user);

        // Check if user has a role in the database
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError || !profileData?.role) {
          console.log("No role found in database, redirecting to select-role");
          router.push("/auth/select-role");
          return;
        }

        // Wait a bit for Redux state to be rehydrated
        setTimeout(() => {
          // Check if we have Redux data, if not, redirect to onboarding
          console.log("Redux state check:", { profile, role, founder, mentor });
          if (!profile || !role) {
            console.log("No Redux data found, redirecting to onboarding");
            router.push("/auth/onboarding");
            return;
          }

          console.log("Review page initialized successfully");
          setInitializing(false);
        }, 1000);
      } catch (error) {
        console.error("Error initializing review page:", error);
        router.push("/auth/sign-in");
      }
    };

    getUserData();
  }, [router, supabase.auth, supabase, profile, role]);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    if (!user || !profile || !role) {
      setError("Missing required data. Please try again.");
      setLoading(false);
      return;
    }

    try {
      console.log("Completing signup and saving all data to database");

      // Prepare profile data
      const profileData = {
        id: user.id,
        name: profile.name,
        email: user.email,
        role: role,
        avatar_url: profile.avatar_url,
        signup_completed: true,
        onboarding_completed: true,
      };

      // Save profile data
      console.log("Saving profile data:", profileData);
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(profileData);

      if (profileError) {
        console.error("Profile save error:", profileError);
        setError(`Failed to save profile: ${profileError.message}`);
        return;
      }

      // Save role-specific data
      if (role === "founder" && founder) {
        const founderData = {
          id: user.id,
          ...founder,
        };
        console.log("Saving founder data:", founderData);
        const { error: founderError } = await supabase
          .from("founders")
          .upsert(founderData);

        if (founderError) {
          console.error("Founder save error:", founderError);
          setError(`Failed to save founder data: ${founderError.message}`);
          return;
        }
      } else if (role === "mentor" && mentor) {
        const mentorData = {
          id: user.id,
          ...mentor,
        };
        console.log("Saving mentor data:", mentorData);
        const { error: mentorError } = await supabase
          .from("mentors")
          .upsert(mentorData);

        if (mentorError) {
          console.error("Mentor save error:", mentorError);
          setError(`Failed to save mentor data: ${mentorError.message}`);
          return;
        }
      }

      console.log("Signup completed successfully, redirecting to dashboard");
      router.push("/dashboard");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Review completion error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleEmoji = () => {
    switch (role) {
      case "founder":
        return "👩‍💻";
      case "mentor":
        return "🧑‍🏫";
      case "investor":
        return "💰";
      default:
        return "👤";
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case "founder":
        return "Founder";
      case "mentor":
        return "Mentor";
      case "investor":
        return "Investor";
      default:
        return "User";
    }
  };

  const renderProfileSummary = () => {
    if (role === "founder" && founder) {
      return (
        <div className="space-y-4">
          {founder.bio && (
            <div>
              <h4 className="font-medium text-gray-900">Bio</h4>
              <p className="mt-1 text-sm text-gray-600">{founder.bio}</p>
            </div>
          )}

          {founder.location && (
            <div>
              <h4 className="font-medium text-gray-900">Location</h4>
              <p className="mt-1 text-sm text-gray-600">{founder.location}</p>
            </div>
          )}

          {founder.timezone && (
            <div>
              <h4 className="font-medium text-gray-900">Timezone</h4>
              <p className="mt-1 text-sm text-gray-600">{founder.timezone}</p>
            </div>
          )}

          {founder.skills && founder.skills.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900">
                Skills & Technologies
              </h4>
              <div className="mt-1 flex flex-wrap gap-2">
                {founder.skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {founder.industries && founder.industries.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900">Industries</h4>
              <div className="mt-1 flex flex-wrap gap-2">
                {founder.industries.map((industry: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {industry}
                  </span>
                ))}
              </div>
            </div>
          )}

          {founder.cofounder_preference && (
            <div>
              <h4 className="font-medium text-gray-900">
                Co-founder Preference
              </h4>
              <p className="mt-1 text-sm text-gray-600">
                {founder.cofounder_preference}
              </p>
            </div>
          )}

          {founder.commitment_level && (
            <div>
              <h4 className="font-medium text-gray-900">Commitment Level</h4>
              <p className="mt-1 text-sm text-gray-600">
                {founder.commitment_level}
              </p>
            </div>
          )}

          {founder.availability_hours && (
            <div>
              <h4 className="font-medium text-gray-900">Availability</h4>
              <p className="mt-1 text-sm text-gray-600">
                {founder.availability_hours} hours per week
              </p>
            </div>
          )}

          {founder.communication_style && (
            <div>
              <h4 className="font-medium text-gray-900">Communication Style</h4>
              <p className="mt-1 text-sm text-gray-600">
                {founder.communication_style}
              </p>
            </div>
          )}

          {(founder.linkedin_url || founder.github_url) && (
            <div>
              <h4 className="font-medium text-gray-900">Links</h4>
              <div className="mt-1 space-y-1">
                {founder.linkedin_url && (
                  <p className="text-sm text-gray-600">
                    LinkedIn:{" "}
                    <a
                      href={founder.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {founder.linkedin_url}
                    </a>
                  </p>
                )}
                {founder.github_url && (
                  <p className="text-sm text-gray-600">
                    GitHub:{" "}
                    <a
                      href={founder.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {founder.github_url}
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (role === "mentor" && mentor) {
      return (
        <div className="space-y-4">
          {mentor.bio && (
            <div>
              <h4 className="font-medium text-gray-900">Bio</h4>
              <p className="mt-1 text-sm text-gray-600">{mentor.bio}</p>
            </div>
          )}

          {mentor.expertise_domains && mentor.expertise_domains.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900">Areas of Expertise</h4>
              <div className="mt-1 flex flex-wrap gap-2">
                {mentor.expertise_domains.map(
                  (domain: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {domain}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          {mentor.industries && mentor.industries.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900">Industries</h4>
              <div className="mt-1 flex flex-wrap gap-2">
                {mentor.industries.map((industry: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {industry}
                  </span>
                ))}
              </div>
            </div>
          )}

          {mentor.years_experience && (
            <div>
              <h4 className="font-medium text-gray-900">Years of Experience</h4>
              <p className="mt-1 text-sm text-gray-600">
                {mentor.years_experience}+ years
              </p>
            </div>
          )}

          {mentor.past_roles && mentor.past_roles.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900">Past Roles</h4>
              <div className="mt-1 flex flex-wrap gap-2">
                {mentor.past_roles.map((role: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {mentor.availability_hours && (
            <div>
              <h4 className="font-medium text-gray-900">Availability</h4>
              <p className="mt-1 text-sm text-gray-600">
                {mentor.availability_hours} hours per month
              </p>
            </div>
          )}

          {mentor.communication_channel && (
            <div>
              <h4 className="font-medium text-gray-900">
                Communication Channel
              </h4>
              <p className="mt-1 text-sm text-gray-600">
                {mentor.communication_channel}
              </p>
            </div>
          )}

          {mentor.mentorship_style && (
            <div>
              <h4 className="font-medium text-gray-900">Mentorship Style</h4>
              <p className="mt-1 text-sm text-gray-600">
                {mentor.mentorship_style}
              </p>
            </div>
          )}

          {mentor.is_paid !== null && (
            <div>
              <h4 className="font-medium text-gray-900">Mentorship Type</h4>
              <p className="mt-1 text-sm text-gray-600">
                {mentor.is_paid ? "Paid mentorship" : "Free mentorship"}
              </p>
            </div>
          )}
        </div>
      );
    }

    if (role === "investor") {
      return (
        <div className="text-center py-4">
          <p className="text-gray-600">Investor profile setup coming soon</p>
        </div>
      );
    }

    return null;
  };

  // Show loading state while initializing
  if (initializing) {
    return (
      <AuthLayout
        title="Loading..."
        subtitle="Preparing your profile review"
        footerText=""
        footerLink=""
        footerLinkText=""
        imageSrc="/images/collaborate-safely.jpg"
        imageAlt="Loading"
        layout="form-right"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile information...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Review Your Profile"
      subtitle="Please review your information before completing your signup"
      footerText=""
      footerLink=""
      footerLinkText=""
      imageSrc="/images/collaborate-safely.jpg"
      imageAlt="Review your profile information"
      layout="form-right"
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* User Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Personal Information
          </h3>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">Name:</span>
                <span className="ml-2 text-sm text-gray-900">
                  {profile?.name || "—"}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Email:
                </span>
                <span className="ml-2 text-sm text-gray-900">
                  {user?.email}
                </span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 ml-4 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No avatar
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Role */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Selected Role
          </h3>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getRoleEmoji()}</span>
            <div>
              <div className="font-medium text-gray-900">{getRoleTitle()}</div>
              <div className="text-sm text-gray-500">
                {role === "founder" &&
                  "Looking for co-founders to build your startup"}
                {role === "mentor" &&
                  "Share your expertise with aspiring entrepreneurs"}
                {role === "investor" &&
                  "Invest in promising startups and founders"}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        {(founder || mentor) && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              {role === "founder" ? "Founder Details" : "Mentor Details"}
            </h3>
            {renderProfileSummary()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => router.back()}
            className="flex-1 flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Edit
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Completing..." : "Complete Signup"}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
