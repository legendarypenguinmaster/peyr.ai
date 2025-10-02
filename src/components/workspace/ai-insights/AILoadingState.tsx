import { Brain } from "lucide-react";

export default function AILoadingState() {
  return (
    <section className="mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-600 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Analyzing Workspace Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">GPT-4o is processing your workspace information...</p>
          </div>
        </div>
      </div>
    </section>
  );
}
