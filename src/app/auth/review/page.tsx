"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/auth/AuthLayout";

export default function Review() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [role, setRole] = useState<string>("");
  const [profile, setProfile] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/sign-in");
        return;
      }
      setUser(user);

      // Get user's profile data
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setRole(profileData.role);
        setProfile(profileData.onboarding_data);
      } else {
        router.push("/auth/select-role");
      }
    };

    getUserData();
  }, [router, supabase.auth, supabase]);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    if (!user) return;

    try {
      // Mark signup as completed
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          signup_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

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
    if (!profile) return null;

    if (role === "founder") {
      return (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">Skills & Technologies</h4>
            <div className="mt-1 flex flex-wrap gap-2">
              {profile.skills?.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Goals</h4>
            <p className="mt-1 text-sm text-gray-600">{profile.goals}</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Experience Level</h4>
            <p className="mt-1 text-sm text-gray-600 capitalize">
              {profile.experience}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Location</h4>
            <p className="mt-1 text-sm text-gray-600">{profile.location}</p>
          </div>
        </div>
      );
    }

    if (role === "mentor") {
      return (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">Areas of Expertise</h4>
            <div className="mt-1 flex flex-wrap gap-2">
              {profile.expertise?.map((area: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Years of Experience</h4>
            <p className="mt-1 text-sm text-gray-600">
              {profile.yearsOfExperience}+ years
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Availability</h4>
            <p className="mt-1 text-sm text-gray-600">{profile.availability}</p>
          </div>
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

  return (
    <AuthLayout
      title="Review Your Profile"
      subtitle="Please review your information before completing your signup"
      footerText=""
      footerLink=""
      footerLinkText=""
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
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-500">Name:</span>
              <span className="ml-2 text-sm text-gray-900">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Email:</span>
              <span className="ml-2 text-sm text-gray-900">{user?.email}</span>
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
        {profile && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Profile Details
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
