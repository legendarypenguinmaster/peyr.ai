import { Brain, Sparkles } from "lucide-react";

interface PageHeaderProps {
  workspaceName: string;
  aiLoading: boolean;
  onRefreshAI: () => void;
}

export default function PageHeader({ workspaceName, aiLoading, onRefreshAI }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
          <Brain className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {workspaceName} • Intelligent analysis powered by AI
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl text-lg leading-relaxed">
          Your AI-powered co-pilot analyzing patterns, opportunities, and risks across all your workspace data to help you make better decisions and build investor confidence.
        </p>
        <button
          onClick={onRefreshAI}
          disabled={aiLoading}
          className="ml-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
        >
          {aiLoading ? (
            <>
              <Brain className="w-4 h-4 animate-pulse" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Refresh AI Analysis
            </>
          )}
        </button>
      </div>
    </div>
  );
}
