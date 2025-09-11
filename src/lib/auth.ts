import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getUser() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

export async function getUserProfile() {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) return null;

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return profile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect("/auth/sign-in");
  }

  // Check if email is confirmed
  if (!user.email_confirmed_at) {
    redirect(
      `/auth/verify-email?email=${encodeURIComponent(user.email || "")}`
    );
  }

  return user;
}

export async function requireProfile() {
  const profile = await getUserProfile();
  if (!profile) {
    redirect("/auth/select-role");
  }

  // Check if onboarding is completed
  if (!profile.onboarding_completed) {
    redirect("/auth/onboarding");
  }

  // Check if signup is completed
  if (!profile.signup_completed) {
    redirect("/auth/review");
  }

  return profile;
}

export async function redirectIfAuthenticated() {
  const user = await getUser();
  if (!user) return null;

  // If user is authenticated but email not confirmed, stay on auth pages
  if (!user.email_confirmed_at) return null;

  const profile = await getUserProfile();

  // If user has completed everything, redirect to dashboard
  if (profile && profile.onboarding_completed && profile.signup_completed) {
    redirect("/dashboard");
  }

  // If user has profile but hasn't completed onboarding, redirect to appropriate step
  if (profile) {
    if (!profile.signup_completed) {
      redirect("/auth/review");
    }
    if (!profile.onboarding_completed) {
      redirect("/auth/onboarding");
    }
  } else {
    // User is authenticated but no profile, redirect to role selection
    redirect("/auth/select-role");
  }

  return user;
}
