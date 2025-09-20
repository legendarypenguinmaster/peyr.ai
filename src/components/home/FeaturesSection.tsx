export default function FeaturesSection() {
  const features = [
    {
      icon: "🤖",
      title: "AI-Powered Matching",
      description:
        "Advanced algorithms analyze skills, experience, and vision to find your perfect co-founder match",
    },
    {
      icon: "⚖️",
      title: "Smart Legal Agreements",
      description:
        "Automated contract generation with fair equity splits and milestone-based vesting schedules",
    },
    {
      icon: "🔒",
      title: "Milestone Escrow Protection",
      description:
        "Secure escrow system ensures both parties deliver on commitments before funds are released",
    },
    {
      icon: "💬",
      title: "Realtime Collaboration Tools",
      description:
        "Integrated workspace with messaging, file sharing, and project management capabilities",
    },
    {
      icon: "⭐",
      title: "Reputation & Trust System",
      description:
        "Build credibility through verified achievements, reviews, and successful partnerships",
    },
    {
      icon: "📊",
      title: "Investor-Ready Pitch Decks",
      description:
        "AI-generated pitch decks and business plans to help you secure funding faster",
    },
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Why Choose Peyr.ai?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Everything you need to find, connect, and build with the perfect
            co-founder
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-6 text-2xl">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
