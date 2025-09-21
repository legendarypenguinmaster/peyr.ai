import ClientPageWrapper from "@/components/ui/ClientPageWrapper";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Link from "next/link";
import Image from "next/image";

const tools = [
  { slug: "ai-coach", name: "AI Startup Coach", description: "24/7 personalized mentorship trained on thousands of successful startups.", icon: "/images/ai-tools/ai-coach.jpg" },
  { slug: "pitch-generator", name: "AI Pitch Generator", description: "Investor-ready pitch decks from market data and patterns.", icon: "/images/ai-tools/ai-pitch.jpg" },
  { slug: "equity-calculator", name: "AI Equity Calculator", description: "Fair equity analysis based on contribution and risk.", icon: "/images/ai-tools/ai-equity.jpg" },
  { slug: "legal-generator", name: "AI Legal Generator", description: "Generate compliant startup documents and founder agreements.", icon: "/images/ai-tools/ai-legal.jpg" },
  { slug: "risk-assessment", name: "AI Risk Assessment", description: "Predictive analysis of risks and success probability.", icon: "/images/ai-tools/ai-risk.jpg" },
  { slug: "investor-matching", name: "AI Investor Matching", description: "Match with 10,000+ active investors by stage, industry, and traction.", icon: "/images/ai-tools/ai-investor.jpg" },
  { slug: "market-validation", name: "AI Market Validation", description: "Real-time trend analysis, competitor intel, and market sizing.", icon: "/images/ai-tools/ai-market.jpg" },
  { slug: "team-builder", name: "AI Team Builder", description: "Find employees, advisors and consultants from global talent networks.", icon: "/images/ai-tools/ai-team.jpg" },
  { slug: "financial-modeling", name: "AI Financial Modeling", description: "Generate 5-year projections with scenario planning.", icon: "/images/ai-tools/ai-financial.jpg" },
  { slug: "product-strategy", name: "AI Product Strategy", description: "Roadmaps and go-to-market strategies from proven launches.", icon: "/images/ai-tools/ai-product.jpg" },
  { slug: "competitor-intel", name: "AI Competitor Intel", description: "Monitor competitors with live alerts and insights.", icon: "/images/ai-tools/ai-competitor.jpg" },
  { slug: "partnership-discovery", name: "AI Partnership Discovery", description: "Find strategic partnerships and collaboration opportunities.", icon: "/images/ai-tools/ai-partnership.jpg" },
  { slug: "performance-optimizer", name: "AI Performance Optimizer", description: "Team analytics for burnout prevention and workflow optimization.", icon: "/images/ai-tools/ai-performance.jpg" },
  { slug: "global-expansion", name: "AI Global Expansion", description: "International expansion strategy with regulatory guidance.", icon: "/images/ai-tools/ai-global.jpg" },
  { slug: "compatibility-analysis", name: "AI Compatibility Analysis", description: "Deep analysis of co‑founder compatibility and patterns.", icon: "/images/ai-tools/ai-compatibility.jpg" },
  { slug: "ai-diagram-generator", name: "AI Diagram Generator", description: "Create professional diagrams instantly with AI from process descriptions.", icon: "/images/ai-tools/ai-diagram.jpg" },
];

export default function AiToolsPage() {
  return (
    <ClientPageWrapper loadingText="Loading AI tools...">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <DashboardHeader />

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                Ultimate AI Entrepreneurial Operating System
              </h1>
              <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                15 AI-powered tools trained on millions of successful ventures — from investor matching to global expansion. Build smarter, faster, and with confidence.
              </p>
              <div className="mt-6 inline-flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-400">
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
                  className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                >
                  {/* Full-width image header */}
                  <div className="relative w-full h-40 bg-gray-100">
                    <Image src={tool.icon} alt={tool.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" />
                  </div>
                  <div className="p-5 text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">{tool.name}</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
                    <div className="mt-4 text-sm font-medium text-blue-700 dark:text-blue-400">Explore →</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </ClientPageWrapper>
  );
}


