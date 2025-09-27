"use client";

export default function GrowthToolsSection() {
  const tools = [
    {
      title: "AI Outreach Agent",
      description: "personalized emails to customers, advisors, VCs"
    },
    {
      title: "AI Social Launch Manager",
      description: "campaigns for LinkedIn, X, TikTok"
    },
    {
      title: "AI CRM Lite",
      description: "track your outreach pipeline"
    },
    {
      title: "AI Global Expansion Tools",
      description: "localization, compliance, cultural insights"
    }
  ];

  return (
    <section className="bg-white dark:bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Optional Growth & Scaling Tools
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto mb-8">
            When you&apos;re ready, Peyr.ai helps you take the next step:
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
          {tools.map((tool, index) => (
            <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {tool.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {tool.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-8 border border-yellow-200 dark:border-yellow-800">
          <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
            <span className="font-semibold">Optional</span> — activate when you&apos;re ready to grow. 
            Peyr.ai is valuable even if you never raise funding.
          </p>
        </div>
      </div>
    </section>
  );
}
