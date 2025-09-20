"use client";

import { useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import EditFounderProfileModal from "@/components/profile/EditFounderProfileModal";
import EditMentorProfileModal from "@/components/profile/EditMentorProfileModal";
import FounderProfile from "@/components/profile/FounderProfile";
import MentorProfile from "@/components/profile/MentorProfile";
import InvestorProfile from "@/components/profile/InvestorProfile";
import { FounderData, MentorData, Profile } from "./types";
import Image from "next/image";
import {
  MapPin,
  Edit3,
  Share2,
  Star,
  MessageCircle,
  Heart,
  Eye,
  Shield,
} from "lucide-react";

// Types moved to ./types

interface ProfilePageClientProps {
  profile: Profile;
  roleData: FounderData | MentorData | null;
  currentUserId?: string;
}

export default function ProfilePageClient({
  profile,
  roleData,
  currentUserId,
}: ProfilePageClientProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState("");
  const [currentProfile, setCurrentProfile] = useState(profile);
  const [currentRoleData, setCurrentRoleData] = useState(roleData);
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);

  // Check if the current user is viewing their own profile
  const isOwnProfile = currentUserId && currentUserId === profile.id;

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleConnect = () => {
    setIsConnectModalOpen(true);
  };

  const handleSendConnection = () => {
    // TODO: Implement connection request functionality
    console.log("Sending connection request to:", currentProfile.id);
    console.log("Message:", connectionMessage);

    // Close modal and reset message
    setIsConnectModalOpen(false);
    setConnectionMessage("");

    // TODO: Show success notification
    alert("Connection request sent!");
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopiedNotification(true);
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowCopiedNotification(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
      alert("Failed to copy URL to clipboard");
    }
  };

  const handleSaveProfile = (
    updatedProfile: Profile,
    updatedRoleData: FounderData | MentorData | null
  ) => {
    setCurrentProfile(updatedProfile);
    setCurrentRoleData(updatedRoleData);
    setIsEditModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DashboardHeader />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10 opacity-50"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-500/10 dark:to-purple-500/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-400/20 to-blue-400/20 dark:from-green-500/10 dark:to-blue-500/10 rounded-full translate-y-24 -translate-x-24"></div>

          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-gray-800">
                  {currentProfile.avatar_url ? (
                    <Image
                      src={currentProfile.avatar_url}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                      {currentProfile.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                        {currentProfile.name}
                      </h1>
                      <div
                        className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          currentProfile.id_verification
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        {currentProfile.id_verification
                          ? "ID Verified"
                          : "ID Not Verified"}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md">
                        {currentProfile.role === "founder" && "👩‍💻 Founder"}
                        {currentProfile.role === "mentor" && "🧑‍🏫 Mentor"}
                        {currentProfile.role === "investor" && "💰 Investor"}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {currentProfile.location || "Location not specified"}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      {currentProfile.email}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                    {isOwnProfile ? (
                      <>
                        <button
                          onClick={handleEditProfile}
                          className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Profile
                        </button>
                        <button
                          onClick={handleShare}
                          className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleConnect}
                        className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">1.2K</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
                  <Eye className="w-4 h-4 mr-1" />
                  Profile Views
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">47</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Messages
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">23</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
                  <Heart className="w-4 h-4 mr-1" />
                  Connections
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">4.8</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
                  <Star className="w-4 h-4 mr-1" />
                  Rating
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role-specific content */}
        {currentProfile.role === "founder" &&
          currentRoleData &&
          "skills" in currentRoleData && (
            <FounderProfile
              profile={currentProfile}
              founderData={currentRoleData as FounderData}
            />
          )}

        {currentProfile.role === "mentor" &&
          currentRoleData &&
          "expertise_domains" in currentRoleData && (
            <MentorProfile
              profile={currentProfile}
              mentorData={currentRoleData as MentorData}
            />
          )}

        {currentProfile.role === "investor" && (
          <InvestorProfile profile={currentProfile} />
        )}
      </div>

      {/* Edit Profile Modal (role-specific) */}
      {currentProfile.role === "founder" ? (
        <EditFounderProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={currentProfile}
          founderData={currentRoleData as FounderData | null}
          onSave={handleSaveProfile}
        />
      ) : currentProfile.role === "mentor" ? (
        <EditMentorProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={currentProfile}
          mentorData={currentRoleData as MentorData | null}
          onSave={handleSaveProfile}
        />
      ) : null}

      {/* Connect Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Send Connection Request
              </h2>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  You&apos;re about to send a connection request to{" "}
                  <span className="font-semibold text-gray-900">
                    {currentProfile.name}
                  </span>
                  .
                </p>

                <label
                  htmlFor="connection-message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Message (Optional)
                </label>
                <textarea
                  id="connection-message"
                  value={connectionMessage}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setConnectionMessage(e.target.value);
                    }
                  }}
                  placeholder="Add a personal message to your connection request..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {connectionMessage.length}/500 characters
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendConnection}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copied Notification */}
      {showCopiedNotification && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-in slide-in-from-right duration-300">
          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
            <svg
              className="w-3 h-3 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="font-medium">URL copied to clipboard!</span>
        </div>
      )}
    </div>
  );
}

// inlined founder/mentor components removed; now imported from ./components

// inlined InvestorProfile removed; now imported from ./components
