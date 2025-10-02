import { ArrowRight } from "lucide-react";

interface InsightItem {
  id: string;
  type: "achievement" | "risk" | "opportunity" | "collaboration" | "investor";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  actionable?: boolean;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  metric?: string;
  trend?: "up" | "down" | "stable";
}

interface InsightCardProps {
  insight: InsightItem;
  getInsightIcon: (type: InsightItem["type"]) => React.ReactNode;
  getPriorityColor: (priority: InsightItem["priority"]) => string;
  getTrendIcon: (trend: InsightItem["trend"]) => React.ReactNode;
}

export default function InsightCard({
  insight,
  getInsightIcon,
  getPriorityColor,
  getTrendIcon,
}: InsightCardProps) {
  return (
    <div
      className={`p-6 rounded-xl border ${getPriorityColor(
        insight.priority
      )} hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
          {insight.icon || getInsightIcon(insight.type)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {insight.title}
            </h3>
            {insight.metric && (
              <span className="px-2 py-1 bg-white dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400 rounded-md">
                {insight.metric}
              </span>
            )}
            {insight.trend && getTrendIcon(insight.trend)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
            {insight.description}
          </p>
          {insight.actionable && (
            <button className="inline-flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors">
              {insight.actionText}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
