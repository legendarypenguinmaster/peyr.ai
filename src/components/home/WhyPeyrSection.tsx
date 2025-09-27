"use client";
import Image from "next/image";

export default function WhyPeyrSection() {
  const sections = [
    {
      image: "/images/ai-matched-co-founder.jpg",
      title: "Pair",
      description: "Match with the right co-founder using AI.",
      details: "Our AI compatibility analysis ensures you find a co-founder who complements your skills, shares your vision, and aligns with your values. No more guessing games or endless networking events.",
      color: "from-blue-500 to-blue-600",
      icon: "🤝"
    },
    {
      image: "/images/collaborate-safely.jpg",
      title: "Build",
      description: "Collaborate in an AI-powered workspace.",
      details: "Work together seamlessly in our intelligent workspace with AI-powered tools for project management, document collaboration, and progress tracking. Everything you need to build your startup is in one place.",
      color: "from-purple-500 to-purple-600",
      icon: "🚀",
      reverse: true
    },
    {
      image: "/images/create-profile.jpg",
      title: "Trust",
      description: "Track agreements, contributions, and fairness transparently.",
      details: "Build trust from day one with our transparent tracking system. Monitor contributions, manage agreements, and ensure fairness in all aspects of your partnership. Trust is the foundation of every successful startup.",
      color: "from-green-500 to-green-600",
      icon: "🛡️"
    }
  ];

  return (
    <section className="bg-white dark:bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Why Peyr.ai
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-4">
            Startups don&apos;t start with funding. They start with founders.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
            Most platforms push you to raise money first. Peyr.ai is different.
          </p>
        </div>

        <div className="space-y-20">
          {sections.map((section, index) => (
            <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center ${section.reverse ? 'lg:grid-flow-col-dense' : ''}`}>
              {/* Image */}
              <div className={`${section.reverse ? 'lg:col-start-2' : ''}`}>
                <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src={section.image}
                    alt={section.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-6 left-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${section.color} rounded-full flex items-center justify-center shadow-lg`}>
                      <span className="text-2xl">{section.icon}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className={`${section.reverse ? 'lg:col-start-1' : ''}`}>
                <div className="max-w-lg">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {section.title}
                  </h3>
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                    {section.description}
                  </p>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {section.details}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-20">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 max-w-4xl mx-auto">
            <p className="text-xl text-gray-700 dark:text-gray-300 font-medium">
              With Peyr.ai, your startup begins on a stronger foundation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
