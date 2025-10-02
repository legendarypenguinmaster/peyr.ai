import { Brain } from "lucide-react";

export default function NoInsightsState() {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
        <Brain className="w-10 h-10 text-gray-400 dark:text-gray-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        No insights available yet
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
        Start adding projects, tasks, and documents to your workspace to unlock AI-powered insights and recommendations.
      </p>
    </div>
  );
}
