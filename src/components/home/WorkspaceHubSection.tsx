"use client";

export default function WorkspaceHubSection() {
  const workspaceFeatures = [
    {
      icon: "📋",
      title: "Kanban tasks & milestones",
      description: "Organize and track your progress visually"
    },
    {
      icon: "📄",
      title: "Document collaboration with AI summaries",
      description: "Smart document management and insights"
    },
    {
      icon: "💬",
      title: "Real-time chat & AI meeting notes",
      description: "Seamless communication with intelligent summaries"
    },
    {
      icon: "⚖️",
      title: "Contribution tracking & equity fairness",
      description: "Transparent tracking of everyone's contributions"
    },
    {
      icon: "📈",
      title: "Growth insights & execution nudges",
      description: "AI-powered recommendations for better outcomes"
    }
  ];

  return (
    <section className="bg-white dark:bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            The Workspace Hub
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-4">
            Your AI-powered co-founder workspace.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
            Inside Peyr.ai, everything founders need lives in one place:
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {workspaceFeatures.map((feature, index) => (
            <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow duration-300">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
          <p className="text-xl text-gray-700 dark:text-gray-300 font-medium">
            It&apos;s simple, collaborative, and built around trust.
          </p>
        </div>
      </div>
    </section>
  );
}
