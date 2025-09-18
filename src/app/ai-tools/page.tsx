import ClientPageWrapper from "@/components/ui/ClientPageWrapper";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Link from "next/link";
import Image from "next/image";

const tools = [
  { slug: "ai-coach", name: "AI Startup Coach", description: "24/7 personalized mentorship trained on thousands of successful startups.", icon: "/images/welcome-bot.png" },
  { slug: "investor-matching", name: "AI Investor Matching", description: "Match with 10,000+ active investors by stage, industry, and traction.", icon: "/images/search.jpg" },
  { slug: "market-validation", name: "AI Market Validation", description: "Real-time trend analysis, competitor intel, and market sizing.", icon: "/images/create-profile.jpg" },
  { slug: "team-builder", name: "AI Team Builder", description: "Find employees, advisors and consultants from global talent networks.", icon: "/images/ai-matched-co-founder.jpg" },
  { slug: "financial-modeling", name: "AI Financial Modeling", description: "Generate 5-year projections with scenario planning.", icon: "/window.svg" },
  { slug: "product-strategy", name: "AI Product Strategy", description: "Roadmaps and go-to-market strategies from proven launches.", icon: "/globe.svg" },
  { slug: "competitor-intel", name: "AI Competitor Intel", description: "Monitor competitors with live alerts and insights.", icon: "/images/collaborate-safely.jpg" },
  { slug: "partnership-discovery", name: "AI Partnership Discovery", description: "Find strategic partnerships and collaboration opportunities.", icon: "/images/search.jpg" },
  { slug: "performance-optimizer", name: "AI Performance Optimizer", description: "Team analytics for burnout prevention and workflow optimization.", icon: "/images/welcome-bot.png" },
  { slug: "global-expansion", name: "AI Global Expansion", description: "International expansion strategy with regulatory guidance.", icon: "/globe.svg" },
  { slug: "pitch-generator", name: "AI Pitch Generator", description: "Investor-ready pitch decks from market data and patterns.", icon: "/images/search.jpg" },
  { slug: "equity-calculator", name: "AI Equity Calculator", description: "Fair equity analysis based on contribution and risk.", icon: "/window.svg" },
  { slug: "legal-generator", name: "AI Legal Generator", description: "Generate compliant startup documents and founder agreements.", icon: "/window.svg" },
  { slug: "risk-assessment", name: "AI Risk Assessment", description: "Predictive analysis of risks and success probability.", icon: "/images/collaborate-safely.jpg" },
  { slug: "compatibility-analysis", name: "AI Compatibility Analysis", description: "Deep analysis of co‑founder compatibility and patterns.", icon: "/images/ai-matched-co-founder.jpg" },
];

export default function AiToolsPage() {
  return (
    <ClientPageWrapper loadingText="Loading AI tools...">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <DashboardHeader />

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                Ultimate AI Entrepreneurial Operating System
              </h1>
              <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
                15 AI-powered tools trained on millions of successful ventures — from investor matching to global expansion. Build smarter, faster, and with confidence.
              </p>
              <div className="mt-6 inline-flex items-center space-x-2 text-sm text-blue-700">
                <span>AI Investor Matching</span>
                <span>•</span>
                <span>Global Market Analysis</span>
                <span>•</span>
                <span>Financial Modeling</span>
                <span>•</span>
                <span>Team Building AI</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tools.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/ai-tools/${tool.slug}`}
                  className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-11 w-11 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      <Image src={tool.icon} alt={tool.name} width={44} height={44} className="object-cover" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700">
                      {tool.name}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 flex-1">{tool.description}</p>
                  <div className="mt-5 text-sm font-medium text-blue-700">Explore →</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </ClientPageWrapper>
  );
}


