import ClientPageWrapper from "@/components/ui/ClientPageWrapper";
import DashboardHeader from "@/components/layout/DashboardHeader";
import AiCoachClient from "@/components/ai-tools/AiCoachClient";

export default function AiCoachPage() {
  return (
    <ClientPageWrapper loadingText="Loading AI Coach...">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <DashboardHeader />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AiCoachClient />
        </main>
      </div>
    </ClientPageWrapper>
  );
}


