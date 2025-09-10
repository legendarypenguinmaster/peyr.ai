"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/auth/AuthLayout";
import { Check } from "lucide-react";

export default function SelectRole() {
  const [selectedRole, setSelectedRole] = useState<
    "founder" | "mentor" | "investor" | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/sign-in");
        return;
      }
      setUser(user);
    };
    getUser();
  }, [router, supabase.auth]);

  const roles = [
    {
      id: "founder" as const,
      title: "Founder",
      emoji: "👩‍💻",
      description: "Looking for co-founders to build your startup",
      features: [
        "Find technical co-founders",
        "Connect with business partners",
        "Build your team",
      ],
    },
    {
      id: "mentor" as const,
      title: "Mentor",
      emoji: "🧑‍🏫",
      description: "Share your expertise with aspiring entrepreneurs",
      features: ["Guide startups", "Share knowledge", "Build your network"],
    },
    {
      id: "investor" as const,
      title: "Investor",
      emoji: "💰",
      description: "Invest in promising startups and founders",
      features: [
        "Discover opportunities",
        "Track investments",
        "Network with founders",
      ],
      disabled: true,
    },
  ];

  const handleRoleSelect = (role: "founder" | "mentor" | "investor") => {
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (!selectedRole || !user) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Attempting to check existing profile for user:", user.id);

      // First, try to update existing profile
      const { data: existingProfile, error: selectError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      console.log("Profile query result:", { existingProfile, selectError });

      if (selectError && selectError.code !== "PGRST116") {
        // PGRST116 is "not found" error, which is expected if profile doesn't exist
        console.error("Profile select error:", selectError);
        setError(
          `Database error: ${selectError.message} (Code: ${selectError.code})`
        );
        setLoading(false);
        return;
      }

      if (existingProfile) {
        // Update existing profile
        console.log("Updating existing profile with role:", selectedRole);
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ role: selectedRole })
          .eq("id", user.id);

        if (updateError) {
          console.error("Profile update error:", updateError);
          setError(
            `Update error: ${updateError.message} (Code: ${updateError.code})`
          );
          setLoading(false);
          return;
        }
        console.log("Profile updated successfully");
      } else {
        // Create new profile if it doesn't exist
        console.log("Creating new profile with role:", selectedRole);
        const profileData = {
          id: user.id,
          role: selectedRole,
          name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
          email: user.email,
        };
        console.log("Profile data to insert:", profileData);

        const { error: insertError } = await supabase
          .from("profiles")
          .insert(profileData);

        if (insertError) {
          console.error("Profile insert error:", insertError);
          setError(
            `Insert error: ${insertError.message} (Code: ${insertError.code})`
          );
          setLoading(false);
          return;
        }
        console.log("Profile created successfully");
      }

      // Redirect to onboarding
      router.push("/auth/onboarding");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Role selection error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Choose Your Role"
      subtitle={`Welcome ${
        user?.user_metadata?.first_name || "there"
      }! What brings you to Peyr.ai?`}
      footerText=""
      footerLink=""
      footerLinkText=""
      imageSrc="/images/ai-matched-co-founder.jpg"
      imageAlt="Choose your role in the startup ecosystem"
      layout="form-right"
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="grid gap-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                selectedRole === role.id
                  ? "border-blue-500 bg-blue-50"
                  : role.disabled
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => !role.disabled && handleRoleSelect(role.id)}
            >
              {role.disabled && (
                <div className="absolute top-2 right-2">
                  <span className="bg-gray-400 text-white text-xs px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                </div>
              )}

              <div className="flex items-start space-x-4">
                <div className="text-4xl">{role.emoji}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {role.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{role.description}</p>
                  <ul className="space-y-1">
                    {role.features.map((feature, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-500 flex items-center"
                      >
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedRole || loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : "Continue"}
        </button>
      </div>
    </AuthLayout>
  );
}
