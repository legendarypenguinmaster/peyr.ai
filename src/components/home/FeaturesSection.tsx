import {
  Users,
  MessageCircle,
  Zap,
  Shield,
  TrendingUp,
  FileText,
} from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Smart Matching",
      description:
        "Our AI-powered algorithm finds co-founders with complementary skills and shared vision",
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-blue-600" />,
      title: "Real-time Messaging",
      description:
        "Communicate instantly with potential partners through our secure messaging platform",
    },
    {
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      title: "Project Workspace",
      description:
        "Collaborate on projects with shared tasks, notes, and progress tracking",
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Trust & Security",
      description:
        "Verified profiles, background checks, and secure escrow for peace of mind",
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
      title: "Success Tracking",
      description:
        "Monitor your collaborations and track the success of your ventures",
    },
    {
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      title: "Legal Support",
      description:
        "Access to legal agreement templates and professional partnership guidance",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Find and Work with Co-Founders
          </h2>
          <p className="text-xl text-gray-600">
            From discovery to collaboration, we&apos;ve got you covered
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-8 shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
