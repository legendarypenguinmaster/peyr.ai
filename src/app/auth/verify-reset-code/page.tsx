"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/auth/AuthLayout";
import FormField from "@/components/auth/FormField";
import SubmitButton from "@/components/auth/SubmitButton";
import { CheckCircle, ArrowLeft } from "lucide-react";

export default function VerifyResetCode() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // If no email parameter, redirect to forgot password
      router.push("/auth/forgot-password");
    }
  }, [searchParams, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 6) {
      setCode(value);
      if (error) setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (code.length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      setLoading(false);
      return;
    }

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "recovery",
      });

      if (verifyError) {
        setError(verifyError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        setSuccess(true);
        // Redirect to reset password page after 2 seconds
        setTimeout(() => {
          router.push("/auth/reset-password");
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Verification error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setError(null);

    try {
      const { error: resendError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          }/auth/verify-reset-code`,
        }
      );

      if (resendError) {
        setError(resendError.message);
      } else {
        setError(null);
        // Show success message briefly
        const originalError = error;
        setError("Verification code resent successfully!");
        setTimeout(() => {
          setError(originalError);
        }, 3000);
      }
    } catch (err) {
      setError("Failed to resend verification code. Please try again.");
      console.error("Resend error:", err);
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Code verified!"
        subtitle="Redirecting you to reset your password..."
        footerText=""
        footerLink=""
        footerLinkText=""
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Verification successful!
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Your code has been verified. You will be redirected to the password
            reset page shortly.
          </p>
          <Link
            href="/auth/reset-password"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Continue to Reset Password
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Enter verification code"
      subtitle="We sent a 6-digit code to your email"
      footerText="Remember your password?"
      footerLink="/auth/sign-in"
      footerLinkText="Sign in"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div
            className={`px-4 py-3 rounded-md ${
              error.includes("successfully")
                ? "bg-green-50 border border-green-200 text-green-600"
                : "bg-red-50 border border-red-200 text-red-600"
            }`}
          >
            {error}
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-6">
            Enter the 6-digit verification code sent to <strong>{email}</strong>
          </p>
        </div>

        <FormField
          label="Verification code"
          type="text"
          name="code"
          placeholder="000000"
          required
          value={code}
          onChange={handleChange}
          maxLength={6}
          className="text-center text-2xl tracking-widest font-mono"
        />

        <SubmitButton text="Verify code" loading={loading} />

        <div className="text-center space-y-3">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendLoading}
            className="text-blue-600 hover:text-blue-500 font-medium text-sm disabled:opacity-50"
          >
            {resendLoading ? "Sending..." : "Didn't receive the code? Resend"}
          </button>

          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <ArrowLeft className="h-4 w-4" />
            <Link href="/auth/forgot-password" className="hover:text-gray-700">
              Back to forgot password
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
