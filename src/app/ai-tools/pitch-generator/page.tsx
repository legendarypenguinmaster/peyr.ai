import ClientPageWrapper from "@/components/ui/ClientPageWrapper";
import DashboardHeader from "@/components/layout/DashboardHeader";
import PitchGeneratorClient from "./PitchGeneratorClient";

export default function PitchGeneratorPage() {
  return (
    <ClientPageWrapper loadingText="Loading Pitch Generator...">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <DashboardHeader />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center">✦</div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Pitch Deck Generator</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Transform your startup idea into an investor‑ready deck with step‑by‑step guidance.</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-semibold">REVOLUTIONARY</span>
            </div>

            {/* Unified client with sticky stepper and hash routing */}
            <PitchGeneratorClient />
          </section>
        </main>
      </div>
    </ClientPageWrapper>
  );
}


