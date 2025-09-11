"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function useAuthRedirect() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // If user is authenticated but email not confirmed, stay on auth pages
        if (!user.email_confirmed_at) return;

        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        // If user has completed everything, redirect to dashboard
        if (
          profile &&
          profile.onboarding_completed &&
          profile.signup_completed
        ) {
          router.push("/dashboard");
          return;
        }

        // If user has profile but hasn't completed onboarding, redirect to appropriate step
        if (profile) {
          if (!profile.signup_completed) {
            router.push("/auth/review");
            return;
          }
          if (!profile.onboarding_completed) {
            router.push("/auth/onboarding");
            return;
          }
        } else {
          // User is authenticated but no profile, redirect to role selection
          router.push("/auth/select-role");
          return;
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    };

    checkAuthAndRedirect();
  }, [router, supabase]);
}
