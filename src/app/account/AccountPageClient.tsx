"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Lock,
  CreditCard,
  AlertTriangle,
  Trash2,
  ExternalLink,
  Check,
  X,
  Loader2,
} from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";

interface User {
  id: string;
  email?: string;
  email_confirmed_at?: string;
}

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  role: "founder" | "mentor" | "investor" | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  github_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

interface AccountPageClientProps {
  user: User;
  profile: Profile;
}

export default function AccountPageClient({
  user,
  profile,
}: AccountPageClientProps) {
  const [activeSection, setActiveSection] = useState("authentication");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Password form states
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // Verification modal states
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [modalMessage, setModalMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Delete account state
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const showModalMessage = (type: "success" | "error", text: string) => {
    setModalMessage({ type, text });
    setTimeout(() => setModalMessage(null), 5000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage("error", "New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage("error", "Password must be at least 6 characters long");
      return;
    }

    // Open verification modal instead of directly changing password
    setShowVerificationModal(true);
  };

  const handleSendVerificationCode = async () => {
    setSendingCode(true);
    setModalMessage(null); // Clear any existing modal messages

    try {
      // Send verification code using the same method as reset password
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        user?.email || "",
        {
          redirectTo: `${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          }/auth/verify-reset-code`,
        }
      );

      if (resetError) {
        showModalMessage("error", resetError.message);
        return;
      }

      showModalMessage(
        "success",
        "Verification code sent to your email address"
      );
    } catch (error: unknown) {
      showModalMessage(
        "error",
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again."
      );
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationLoading(true);
    setModalMessage(null); // Clear any existing modal messages

    try {
      if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
        showModalMessage(
          "error",
          "Please enter a valid 6-digit verification code"
        );
        return;
      }

      // Verify the OTP code using the same method as reset password
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: user?.email || "",
        token: verificationCode,
        type: "recovery",
      });

      if (verifyError) {
        showModalMessage("error", verifyError.message);
        return;
      }

      if (data.session) {
        // Update password after successful verification
        const { error: updateError } = await supabase.auth.updateUser({
          password: passwordForm.newPassword,
        });

        if (updateError) {
          showModalMessage("error", updateError.message);
          return;
        }

        // Close modal and show success on main page
        setShowVerificationModal(false);
        setVerificationCode("");
        setPasswordForm({ newPassword: "", confirmPassword: "" });
        showMessage("success", "Password updated successfully!");
      }
    } catch (error: unknown) {
      showModalMessage(
        "error",
        error instanceof Error ? error.message : "Failed to update password"
      );
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      showMessage("error", 'Please type "DELETE" to confirm');
      return;
    }

    setLoading(true);

    try {
      // Delete user data from profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Delete role-specific data
      if (profile.role === "founder") {
        await supabase.from("founders").delete().eq("id", user.id);
      } else if (profile.role === "mentor") {
        await supabase.from("mentors").delete().eq("id", user.id);
      }

      // Sign out and redirect
      await supabase.auth.signOut();
      router.push("/");
    } catch (error: unknown) {
      showMessage(
        "error",
        error instanceof Error ? error.message : "Failed to delete account"
      );
      setLoading(false);
    }
  };

  const sections = [
    { id: "authentication", label: "Authentication", icon: Lock },
    { id: "billing", label: "Subscription & Billing", icon: CreditCard },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Account Settings
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <Check className="w-5 h-5 mr-2" />
              ) : (
                <X className="w-5 h-5 mr-2" />
              )}
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                        activeSection === section.id
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {section.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Authentication Section */}
              {activeSection === "authentication" && (
                <div className="space-y-6">
                  {/* Password Change */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center mb-4">
                      <Lock className="w-5 h-5 text-gray-500 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Change Password
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Update your password to keep your account secure.
                    </p>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Confirm new password"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={
                          !passwordForm.newPassword ||
                          !passwordForm.confirmPassword
                        }
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        Update Password
                      </button>
                    </form>
                  </div>

                  {/* Linked Accounts */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Linked Accounts
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold text-sm">
                              G
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Google</p>
                            <p className="text-sm text-gray-500">
                              Connected via Google OAuth
                            </p>
                          </div>
                        </div>
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium cursor-pointer">
                          Disconnect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscription & Billing Section */}
              {activeSection === "billing" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center mb-4">
                      <CreditCard className="w-5 h-5 text-gray-500 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Current Plan
                      </h3>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">
                            Free Plan
                          </h4>
                          <p className="text-gray-600 mt-1">
                            Perfect for getting started
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">$0</p>
                          <p className="text-sm text-gray-500">per month</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-900">
                        Plan Features:
                      </h5>
                      <ul className="space-y-2">
                        <li className="flex items-center text-gray-600">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          Basic profile creation
                        </li>
                        <li className="flex items-center text-gray-600">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          Limited co-founder matching
                        </li>
                        <li className="flex items-center text-gray-600">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          Community access
                        </li>
                      </ul>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center">
                        Upgrade to Pro
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </button>
                      <p className="text-sm text-gray-500 mt-2">
                        Unlock advanced features and unlimited matching
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Billing Information
                    </h3>
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No billing information on file
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Billing details will appear here when you upgrade
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Danger Zone Section */}
              {activeSection === "danger" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
                    <div className="flex items-center mb-4">
                      <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                      <h3 className="text-lg font-semibold text-red-900">
                        Delete Account
                      </h3>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <p className="text-red-800 font-medium mb-2">
                        ⚠️ This action cannot be undone
                      </p>
                      <p className="text-red-700 text-sm">
                        This will permanently delete your account and all
                        associated data, including:
                      </p>
                      <ul className="text-red-700 text-sm mt-2 ml-4 list-disc">
                        <li>Your profile and personal information</li>
                        <li>All your matches and connections</li>
                        <li>Your messages and conversation history</li>
                        <li>Any saved preferences and settings</li>
                      </ul>
                    </div>

                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type &quot;DELETE&quot; to confirm
                          </label>
                          <input
                            type="text"
                            value={deleteConfirm}
                            onChange={(e) => setDeleteConfirm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="Type DELETE to confirm"
                          />
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={handleDeleteAccount}
                            disabled={loading || deleteConfirm !== "DELETE"}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-2" />
                            )}
                            Permanently Delete Account
                          </button>
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              setDeleteConfirm("");
                            }}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Verification Modal */}
          {showVerificationModal && (
            <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <Lock className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Verify Password Change
                  </h3>
                </div>

                <p className="text-gray-600 mb-4">
                  Please enter the 6-digit verification code sent to your email
                  to confirm the password change.
                </p>

                {/* Modal Message Display */}
                {modalMessage && (
                  <div
                    className={`mb-4 p-3 rounded-lg flex items-center ${
                      modalMessage.type === "success"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {modalMessage.type === "success" ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <X className="w-4 h-4 mr-2" />
                    )}
                    {modalMessage.text}
                  </div>
                )}

                <div className="mb-4">
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    disabled={sendingCode}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {sendingCode ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : null}
                    {sendingCode ? "Sending..." : "Send verification code"}
                  </button>
                </div>

                <form onSubmit={handleVerificationSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) =>
                        setVerificationCode(
                          e.target.value.replace(/\D/g, "").slice(0, 6)
                        )
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={
                        verificationLoading || verificationCode.length !== 6
                      }
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {verificationLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Verify & Update Password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowVerificationModal(false);
                        setVerificationCode("");
                        setModalMessage(null);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
