import { User, Star } from 'lucide-react';

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
  avatar
}: CoFounderCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
          {avatar ? (
            <img 
              src={avatar} 
              alt={name}
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
              lastSeen && <span className="text-xs text-gray-500">{lastSeen}</span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{role}</p>
          <p className="text-sm text-gray-500 mb-2">Looking for: {lookingFor}</p>
          <div className="flex items-center space-x-2 mb-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✓ Verified
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Startup Veteran
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{location}</p>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((skill, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {skill}
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">{rating}</span>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Message
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
