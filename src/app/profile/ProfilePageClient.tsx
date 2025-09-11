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
  const [currentProfile, setCurrentProfile] = useState(profile);
  const [currentRoleData, setCurrentRoleData] = useState(roleData);
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);

  // Check if the current user is viewing their own profile
  const isOwnProfile = currentUserId && currentUserId === profile.id;

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <DashboardHeader />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-50"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-400/20 to-blue-400/20 rounded-full translate-y-24 -translate-x-24"></div>

          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-200 flex items-center justify-center shadow-lg ring-4 ring-white">
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
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-4xl font-bold text-gray-900">
                        {currentProfile.name}
                      </h1>
                      <div
                        className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          currentProfile.id_verification
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
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
                      <span className="text-gray-600 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {currentProfile.location || "Location not specified"}
                      </span>
                    </div>
                    <p className="text-gray-600 text-lg">
                      {currentProfile.email}
                    </p>
                  </div>

                  {/* Action Buttons - Only show for own profile */}
                  {isOwnProfile && (
                    <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                      <button
                        onClick={handleEditProfile}
                        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </button>
                      <button
                        onClick={handleShare}
                        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">1.2K</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <Eye className="w-4 h-4 mr-1" />
                  Profile Views
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">47</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Messages
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">23</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <Heart className="w-4 h-4 mr-1" />
                  Connections
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">4.8</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
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
