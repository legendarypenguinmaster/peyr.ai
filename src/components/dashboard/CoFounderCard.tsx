import { User, Star, Info, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import ConnectModal from "../ConnectModal";

interface CoFounderCardProps {
  name: string;
  role: string;
  lookingFor: string;
  location: string;
  description: string;
  skills: string[];
  rating: string;
  isOnline?: boolean;
  lastSeen?: string;
  avatar?: string;
  matchReasoning?: string;
  matchPercentage?: number;
  yearsExperience?: number | null;
  isPaid?: boolean;
  industries?: string[];
  communicationChannel?: string | null;
  mentorshipStyle?: string | null;
  mentorId?: string;
}

export default function CoFounderCard({
  name,
  role,
  lookingFor,
  location,
  description,
  skills,
  rating,
  isOnline = false,
  lastSeen,
  avatar,
  matchReasoning,
  matchPercentage,
  yearsExperience,
  isPaid,
  industries,
  communicationChannel,
  mentorshipStyle,
  mentorId,
}: CoFounderCardProps) {
  const [showReasoning, setShowReasoning] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <User className="w-6 h-6 text-gray-600" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-semibold text-gray-900">{name}</h4>
            {isOnline ? (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-xs text-gray-500">Online now</span>
              </>
            ) : (
              lastSeen && (
                <span className="text-xs text-gray-500">{lastSeen}</span>
              )
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{role}</p>
          <p className="text-sm text-gray-500 mb-2">
            Looking for: {lookingFor}
          </p>
          <div className="flex items-center space-x-2 mb-2">
            {matchPercentage && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border border-green-200">
                {matchPercentage}% Match
              </span>
            )}
            {yearsExperience && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {yearsExperience}+ years exp
              </span>
            )}
            {isPaid && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Paid Mentor
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{location}</p>
          {industries && industries.length > 0 && (
            <p className="text-sm text-gray-500 mb-2">
              Industries: {industries.join(", ")}
            </p>
          )}
          {communicationChannel && (
            <p className="text-sm text-gray-500 mb-2">
              Preferred: {communicationChannel}
            </p>
          )}
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {skill}
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">{rating}</span>
          </div>
          
          {/* Match Reasoning Alert */}
          {matchReasoning && (
            <div className="mb-3">
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Why this match?</span>
                <Info className="w-3 h-3" />
              </button>
              
              {showReasoning && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 mb-1">AI Match Analysis</h4>
                      <p className="text-sm text-blue-800 leading-relaxed">{matchReasoning}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex space-x-3">
            <button 
              onClick={() => setIsConnectModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Connect
            </button>
          </div>
        </div>
      </div>
      
      {/* Connect Modal */}
      <ConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        mentor={{
          id: mentorId || "",
          name: name,
          avatar_url: avatar,
        }}
        onSuccess={() => {
          setIsConnectModalOpen(false);
        }}
      />
    </div>
  );
}
