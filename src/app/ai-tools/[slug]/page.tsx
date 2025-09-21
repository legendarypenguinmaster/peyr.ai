import ClientPageWrapper from "@/components/ui/ClientPageWrapper";
import DashboardHeader from "@/components/layout/DashboardHeader";
import RiskAssessmentClient from "../risk-assessment/RiskAssessmentClient";

const toolCopy: Record<string, { title: string; subtitle: string; body: string }> = {
  "ai-coach": {
    title: "AI Startup Coach",
    subtitle: "Personalized mentorship, any time",
    body: "Get actionable guidance on strategy, product, hiring, fundraising, and more. Your always-on coach trained on thousands of successful startups.",
  },
  "investor-matching": {
    title: "AI Investor Matching",
    subtitle: "Meet the right investors fast",
    body: "Match with relevant investors by stage, industry, geography, and traction. Prioritized intros and outreach templates included.",
  },
  "market-validation": {
    title: "AI Market Validation",
    subtitle: "Decide with data",
    body: "Analyze demand, trends, competitor dynamics, and pricing to validate your ideas with confidence.",
  },
  // ... other slugs can reuse a generic template
};

export default async function AiToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Handle specific tools that have dedicated pages
  if (slug === "risk-assessment") {
    return <RiskAssessmentClient />;
  }
  
  const copy = toolCopy[slug] || {
    title: "Coming Soon",
    subtitle: "This AI tool page is under construction",
    body: "We are actively building this experience. Check back shortly or explore other AI tools.",
  };

  return (
    <ClientPageWrapper loadingText="Loading tool...">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <DashboardHeader />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{copy.title}</h1>
          <p className="mt-3 text-gray-700 dark:text-gray-300">{copy.subtitle}</p>

          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{copy.body}</p>
            <div className="mt-6 inline-flex items-center text-blue-700 dark:text-blue-400 font-medium">Get Started →</div>
          </div>
        </main>
      </div>
    </ClientPageWrapper>
  );
}


