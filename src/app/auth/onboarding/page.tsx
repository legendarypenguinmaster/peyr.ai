"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Onboarding() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const redirectToRoleSpecificOnboarding = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error getting user:", userError);
          router.push("/auth/sign-in");
          return;
        }

        if (!user) {
          console.log("No user found, redirecting to sign-in");
          router.push("/auth/sign-in");
          return;
        }

        console.log("User found:", user.id);

        // Get user's role and completion from profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, signup_completed")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error getting profile:", profileError);
          router.push("/auth/select-role");
          return;
        }

        console.log("Profile found:", profile);

        if (profile?.signup_completed === true) {
          router.push("/dashboard");
          return;
        }

        if (profile?.role) {
          // Redirect to role-specific onboarding
          switch (profile.role) {
            case "founder":
              router.push("/onboarding/founder");
              break;
            case "mentor":
              router.push("/onboarding/mentor");
              break;
            case "investor":
              router.push("/onboarding/investor");
              break;
            default:
              router.push("/auth/select-role");
          }
        } else {
          console.log("No role found, redirecting to select-role");
          router.push("/auth/select-role");
        }
      } catch (error) {
        console.error("Unexpected error in onboarding redirect:", error);
        router.push("/auth/sign-in");
      }
    };

    redirectToRoleSpecificOnboarding();
  }, [router, supabase.auth, supabase]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to onboarding...</p>
      </div>
    </div>
  );
}
