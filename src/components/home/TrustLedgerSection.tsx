"use client";

export default function TrustLedgerSection() {
  const trustFeatures = [
    {
      icon: "📋",
      title: "Agreements signed",
      description: "All contracts and NDAs tracked securely"
    },
    {
      icon: "📊",
      title: "Contributions logged",
      description: "Every task, meeting, and milestone recorded"
    },
    {
      icon: "⭐",
      title: "Peer reviews & sentiment analysis",
      description: "AI-powered feedback and relationship insights"
    },
    {
      icon: "🎯",
      title: "AI-generated Trust Score",
      description: "Quantified trustworthiness and reliability metrics"
    }
  ];

  return (
    <section className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            The Trust Ledger
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-4">
            Build with trust. Grow with confidence.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
            Peyr.ai&apos;s Trust Ledger turns collaboration into measurable credibility:
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {trustFeatures.map((feature, index) => (
            <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              When the time comes, investors see more than a pitch deck
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              — they see a proven history of trust and execution.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
