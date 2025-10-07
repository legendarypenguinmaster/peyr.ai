import {
  Brain,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Users,
  Target,
} from "lucide-react";
import RichText from "@/components/ui/RichText";

interface AIInsight {
  id: string;
  type: "positive" | "warning" | "suggestion";
  title: string;
  description: string;
  category: string;
  priority: "high" | "medium" | "low";
}

interface AIInsightsPanelProps {
  insights: AIInsight[];
  isLoading?: boolean;
}

export default function AIInsightsPanel({
  insights,
  isLoading = false,
}: AIInsightsPanelProps) {
  const getInsightIcon = (type: AIInsight["type"]) => {
    switch (type) {
      case "positive":
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "suggestion":
        return <Lightbulb className="w-5 h-5 text-blue-600" />;
      default:
        return <Brain className="w-5 h-5 text-gray-600" />;
    }
  };

  const getInsightColor = (type: AIInsight["type"]) => {
    switch (type) {
      case "positive":
        return "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800";
      case "warning":
        return "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800";
      case "suggestion":
        return "border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800";
      default:
        return "border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800";
    }
  };

  const getPriorityColor = (priority: AIInsight["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-600 dark:text-red-400";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "low":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "execution":
        return <Target className="w-4 h-4" />;
      case "collaboration":
        return <Users className="w-4 h-4" />;
      case "transparency":
        return <Brain className="w-4 h-4" />;
      case "investor":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-600 animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            AI Insights
          </h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
          <Brain className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          AI Insights
        </h2>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
      </div>

      <div className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No insights available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              AI will analyze your workspace data to provide personalized
              insights.
            </p>
          </div>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-lg border ${getInsightColor(
                insight.type
              )} hover:shadow-sm transition-all duration-200`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {insight.title}
                    </h3>
                    <div className="flex items-center gap-1">
                      {getCategoryIcon(insight.category)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {insight.category}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full bg-white dark:bg-gray-800 ${getPriorityColor(
                        insight.priority
                      )}`}
                    >
                      {insight.priority}
                    </span>
                  </div>
                  <RichText
                    text={insight.description}
                    className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {insights.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Powered by GPT-4o analysis
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {insights.length} insights generated
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
