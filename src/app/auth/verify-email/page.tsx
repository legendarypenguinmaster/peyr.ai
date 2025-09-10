"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/auth/AuthLayout";
import { CheckCircle, Mail, ArrowLeft } from "lucide-react";

export default function VerifyEmail() {
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    // Get email from URL params or from the current user
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // Try to get email from current user session
      const getUserEmail = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email) {
          setEmail(user.email);
        }
      };
      getUserEmail();
    }
  }, [searchParams, supabase.auth]);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email,
        token: verificationCode,
        type: "signup",
      });

      if (verifyError) {
        setError(verifyError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        setSuccess(true);

        // Wait a moment to show success message, then redirect
        setTimeout(() => {
          router.push("/auth/select-role");
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Email verification error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;

    setResendLoading(true);
    setError(null);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (resendError) {
        setError(resendError.message);
      } else {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 5000);
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
        title="Email Verified!"
        subtitle="Your email has been successfully verified."
        footerText=""
        footerLink=""
        footerLinkText=""
        imageSrc="/images/search.jpg"
        imageAlt="Email verification success"
        layout="form-left"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Verification successful!
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Redirecting you to complete your profile setup...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="We've sent a verification code to your email address."
      footerText=""
      footerLink=""
      footerLinkText=""
      imageSrc="/images/search.jpg"
      imageAlt="Email verification"
      layout="form-left"
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {resendSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
            Verification code sent! Please check your email.
          </div>
        )}

        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600 mb-6">
            {email ? (
              <>
                We&apos;ve sent a 6-digit verification code to{" "}
                <strong>{email}</strong>. Please enter the code below.
              </>
            ) : (
              "Please check your email for the verification code."
            )}
          </p>
        </div>

        <form onSubmit={handleVerification} className="space-y-6">
          <div>
            <label
              htmlFor="verificationCode"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Verification Code
            </label>
            <input
              id="verificationCode"
              name="verificationCode"
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit code"
              required
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(
                  e.target.value.replace(/\D/g, "").slice(0, 6)
                );
                if (error) setError(null);
              }}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center text-lg tracking-widest"
            />
          </div>

          <button
            type="submit"
            disabled={loading || verificationCode.length !== 6}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendLoading}
              className="text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50"
            >
              {resendLoading ? "Sending..." : "Resend code"}
            </button>
          </p>

          <div className="flex items-center justify-center">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-500"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to sign up
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
