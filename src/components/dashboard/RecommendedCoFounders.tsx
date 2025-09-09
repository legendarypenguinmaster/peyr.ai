import CoFounderCard from './CoFounderCard';

export default function RecommendedCoFounders() {
  const coFounders = [
    {
      name: "Sarah Chen",
      role: "Full-Stack Developer & Startup Advisor",
      lookingFor: "CTO/Technical Co-founder",
      location: "San Francisco, CA",
      description: "Experienced full-stack developer with 8+ years building scalable web applications. Passionate about fintech and healthcare innovations.",
      skills: ["React", "Node.js", "Python", "AWS", "+1 more"],
      rating: "4.8 Entrepreneur",
      isOnline: true
    },
    {
      name: "Marcus Rodriguez",
      role: "Product Marketing & Growth Strategist",
      lookingFor: "CMO/Marketing Co-founder",
      location: "Austin, TX",
      description: "Growth-focused product marketer with proven track record of scaling startups from 0 to $10M ARR. Expert in B2B SaaS and marketplace growth.",
      skills: ["Growth Marketing", "Product Strategy", "Analytics", "A/B Testing"],
      rating: "4.6 Entrepreneur",
      lastSeen: "3d ago",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recommended Co-Founders</h3>
        <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</a>
      </div>
      <p className="text-gray-600 mb-6">Based on your skills and project interests</p>
      
      <div className="space-y-4">
        {coFounders.map((coFounder, index) => (
          <CoFounderCard key={index} {...coFounder} />
        ))}
      </div>
    </div>
  );
}
