import CoFounderCard from "./CoFounderCard";

export default function RecommendedCoFounders() {
  const coFounders = [
    {
      name: "Sarah Chen",
      role: "Full-Stack Developer & Startup Advisor",
      lookingFor: "CTO/Technical Co-founder",
      location: "San Francisco, CA",
      description:
        "Experienced full-stack developer with 8+ years building scalable web applications. Passionate about fintech and healthcare innovations.",
      skills: ["React", "Node.js", "Python", "AWS", "+1 more"],
      rating: "4.8 Entrepreneur",
      isOnline: true,
    },
    {
      name: "Marcus Rodriguez",
      role: "Product Marketing & Growth Strategist",
      lookingFor: "CMO/Marketing Co-founder",
      location: "Austin, TX",
      description:
        "Growth-focused product marketer with proven track record of scaling startups from 0 to $10M ARR. Expert in B2B SaaS and marketplace growth.",
      skills: [
        "Growth Marketing",
        "Product Strategy",
        "Analytics",
        "A/B Testing",
      ],
      rating: "4.6 Entrepreneur",
      lastSeen: "3d ago",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Recommended Co-Founders
              </h3>
              <p className="text-sm text-gray-600">
                Based on your skills and project interests
              </p>
            </div>
          </div>
          <a
            href="#"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium bg-white px-3 py-1 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors cursor-pointer"
          >
            View All
          </a>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {coFounders.map((coFounder, index) => (
            <CoFounderCard key={index} {...coFounder} />
          ))}
        </div>
      </div>
    </div>
  );
}
