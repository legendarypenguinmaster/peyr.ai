"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/auth/AuthLayout";
import FormField from "@/components/auth/FormField";
import SubmitButton from "@/components/auth/SubmitButton";
import { CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          }/auth/verify-reset-code`,
        }
      );

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      setEmailSent(true);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Password reset error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 6) {
      setCode(value);
      if (error) setError(null);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError(null);

    if (code.length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      setVerifying(false);
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
        setVerifying(false);
        return;
      }

      if (data.session) {
        setSuccess(true);
        // Redirect to reset password page after 2 seconds
        setTimeout(() => {
          window.location.href = "/auth/reset-password";
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Verification error:", err);
    } finally {
      setVerifying(false);
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
        setError("Verification code resent successfully!");
        setTimeout(() => {
          setError(null);
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
        imageSrc="/images/search.jpg"
        imageAlt="Password reset verification"
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
            Your code has been verified. You will be redirected to the password
            reset page shortly.
          </p>
        </div>
      </AuthLayout>
    );
  }

  if (emailSent) {
    return (
      <AuthLayout
        title="Enter verification code"
        subtitle="We sent a 6-digit code to your email"
        footerText="Remember your password?"
        footerLink="/auth/sign-in"
        footerLinkText="Sign in"
        imageSrc="/images/search.jpg"
        imageAlt="Email verification code"
        layout="form-left"
      >
        <form className="space-y-6" onSubmit={handleVerifyCode}>
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
              Enter the 6-digit verification code sent to{" "}
              <strong>{email}</strong>
            </p>
          </div>

          <FormField
            label="Verification code"
            type="text"
            name="code"
            placeholder="000000"
            required
            value={code}
            onChange={handleCodeChange}
            maxLength={6}
            className="text-center text-2xl tracking-widest font-mono"
          />

          <SubmitButton text="Verify code" loading={verifying} />

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
              <button
                type="button"
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                  setCode("");
                  setError(null);
                }}
                className="hover:text-gray-700 font-medium"
              >
                Back to email input
              </button>
            </div>
          </div>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="No worries, we'll send you reset instructions."
      footerText="Remember your password?"
      footerLink="/auth/sign-in"
      footerLinkText="Sign in"
      imageSrc="/images/search.jpg"
      imageAlt="Password reset assistance"
      layout="form-left"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-6">
            Enter your email address and we&apos;ll send you a verification code
            to reset your password.
          </p>
        </div>

        <FormField
          label="Email address"
          type="email"
          name="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
        />

        <SubmitButton text="Send verification code" loading={loading} />

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button
              type="button"
              onClick={() => {
                setEmailSent(false);
                setEmail("");
              }}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              try again
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
