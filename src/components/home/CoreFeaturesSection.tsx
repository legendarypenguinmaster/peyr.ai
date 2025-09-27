"use client";
import Image from "next/image";

export default function CoreFeaturesSection() {
  const tools = [
    // Pair Tools
    {
      number: "01",
      image: "/images/ai-tools/ai-compatibility.jpg",
      title: "AI Compatibility Analysis",
      description: "Analyze skills, goals, and values alignment to find the perfect co-founder match using advanced AI algorithms.",
      color: "from-blue-500 to-cyan-500",
      category: "Pair"
    },
    {
      number: "02",
      image: "/images/ai-tools/ai-team.jpg",
      title: "AI Team Builder",
      description: "Create balanced roles and responsibilities for your startup team with AI-powered recommendations.",
      color: "from-blue-500 to-cyan-500",
      category: "Pair"
    },
    {
      number: "03",
      image: "/images/ai-tools/ai-equity.jpg",
      title: "AI Equity Calculator",
      description: "Calculate fair equity splits for bootstrapping founders based on contributions, risk, and value.",
      color: "from-blue-500 to-cyan-500",
      category: "Pair"
    },
    // Build Tools
    {
      number: "04",
      image: "/images/ai-tools/ai-product.jpg",
      title: "AI Roadmap Generator",
      description: "Transform your startup idea into a detailed execution plan with AI-generated roadmaps and milestones.",
      color: "from-purple-500 to-pink-500",
      category: "Build"
    },
    {
      number: "05",
      image: "/images/ai-tools/ai-diagram.jpg",
      title: "AI Doc-to-Task Converter",
      description: "Convert your notes and documents into actionable task items automatically with AI processing.",
      color: "from-purple-500 to-pink-500",
      category: "Build"
    },
    {
      number: "06",
      image: "/images/ai-tools/ai-performance.jpg",
      title: "AI Performance Predictor",
      description: "Forecast milestone success and predict potential challenges using AI-powered analytics.",
      color: "from-purple-500 to-pink-500",
      category: "Build"
    },
    {
      number: "07",
      image: "/images/ai-tools/ai-market.jpg",
      title: "AI Market Validation",
      description: "Validate your startup idea with AI-powered market research and customer insights.",
      color: "from-purple-500 to-pink-500",
      category: "Build"
    },
    {
      number: "08",
      image: "/images/ai-tools/ai-pitch.jpg",
      title: "AI Pitch Generator",
      description: "Create investor-ready pitch decks in minutes with AI-powered content generation and design.",
      color: "from-purple-500 to-pink-500",
      category: "Build"
    },
    // Trust Tools
    {
      number: "09",
      image: "/images/ai-tools/ai-legal.jpg",
      title: "AI Agreement Tracker",
      description: "Securely store and manage NDAs, equity agreements, and contracts with AI-powered organization.",
      color: "from-green-500 to-emerald-500",
      category: "Trust"
    },
    {
      number: "10",
      image: "/images/ai-tools/ai-coach.jpg",
      title: "AI Founder Coach & Burnout Monitor",
      description: "Get personalized guidance and wellbeing monitoring to maintain founder health and productivity.",
      color: "from-green-500 to-emerald-500",
      category: "Trust"
    },
    {
      number: "11",
      image: "/images/ai-tools/ai-risk.jpg",
      title: "AI Risk Assessment",
      description: "Assess and mitigate startup risks with AI-powered analysis and recommendations.",
      color: "from-green-500 to-emerald-500",
      category: "Trust"
    },
    {
      number: "12",
      image: "/images/ai-tools/ai-financial.jpg",
      title: "AI Financial Modeling",
      description: "Create comprehensive financial models and projections for your startup with AI assistance.",
      color: "from-green-500 to-emerald-500",
      category: "Trust"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Core Features
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Bootstrapping + Collaboration Tools
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {tools.map((tool, index) => (
            <div key={index} className="relative flex">
              {/* Tool card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col w-full h-full">
                {/* Tool image */}
                <div className="relative h-48 overflow-hidden flex-shrink-0">
                  <Image
                    src={tool.image}
                    alt={tool.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${tool.color} rounded-lg flex items-center justify-center shadow-lg`}
                    >
                      <span className="text-white font-bold text-lg">
                        {tool.number}
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-white text-xs font-medium">
                        {tool.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tool content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 leading-tight">
                    {tool.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4 flex-grow text-sm">
                    {tool.description}
                  </p>

                  {/* Decorative element */}
                  <div
                    className={`h-1 bg-gradient-to-r ${tool.color} rounded-full opacity-60`}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to explore these tools?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start building your startup with AI-powered collaboration tools
            </p>
            <a
              href="/auth/sign-up"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg inline-block cursor-pointer"
            >
              Start Building
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
