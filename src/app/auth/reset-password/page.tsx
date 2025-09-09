"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/auth/AuthLayout";
import FormField from "@/components/auth/FormField";
import SubmitButton from "@/components/auth/SubmitButton";
import { CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check if we have a valid session for password reset
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session error:", error);
          setError("Invalid or expired reset link. Please request a new one.");
          return;
        }

        if (session) {
          setIsValidSession(true);
        } else {
          // Check if we're coming from a password reset link
          const urlParams = new URLSearchParams(window.location.search);
          const accessToken = urlParams.get("access_token");
          const refreshToken = urlParams.get("refresh_token");

          if (accessToken && refreshToken) {
            // We have tokens from the reset link, try to set the session
            const { data, error: setSessionError } =
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

            if (setSessionError) {
              console.error("Set session error:", setSessionError);
              setError(
                "Invalid or expired reset link. Please request a new one."
              );
            } else if (data.session) {
              setIsValidSession(true);
            }
          } else {
            // No session and no tokens, redirect to forgot password
            setError(
              "Invalid or expired reset link. Please request a new one."
            );
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred. Please try again.");
      }
    };

    checkSession();
  }, [router, supabase.auth]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Password reset error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <AuthLayout
        title="Invalid Session"
        subtitle="This password reset link is invalid or has expired."
        footerText="Need a new reset link?"
        footerLink="/auth/forgot-password"
        footerLinkText="Request new link"
      >
        <div className="text-center">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}
          <p className="text-sm text-gray-600 mb-6">
            Please request a new password reset link.
          </p>
          <Link
            href="/auth/forgot-password"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Request New Reset Link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout
        title="Password Updated"
        subtitle="Your password has been successfully updated."
        footerText=""
        footerLink=""
        footerLinkText=""
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Password updated successfully!
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            You will be redirected to the dashboard shortly.
          </p>
          <Link
            href="/dashboard"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Dashboard
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your new password below."
      footerText="Remember your password?"
      footerLink="/auth/sign-in"
      footerLinkText="Sign in"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <FormField
          label="New password"
          type="password"
          name="password"
          placeholder="Enter your new password (min. 6 characters)"
          required
          value={formData.password}
          onChange={handleChange}
        />

        <FormField
          label="Confirm new password"
          type="password"
          name="confirmPassword"
          placeholder="Confirm your new password"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
        />

        <SubmitButton text="Update password" loading={loading} />
      </form>
    </AuthLayout>
  );
}
