import { CheckCircle, AlertTriangle, Lightbulb, Users, Briefcase } from "lucide-react";
import InsightCard from "./InsightCard";

interface InsightItem {
  id: string;
  type: 'achievement' | 'risk' | 'opportunity' | 'collaboration' | 'investor';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable?: boolean;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  metric?: string;
  trend?: 'up' | 'down' | 'stable';
}

interface InsightsSectionProps {
  type: 'overview' | 'risks' | 'opportunities' | 'collaboration' | 'investor';
  title: string;
  insights: InsightItem[];
  getInsightIcon: (type: InsightItem['type']) => React.ReactNode;
  getPriorityColor: (priority: InsightItem['priority']) => string;
  getTrendIcon: (trend: InsightItem['trend']) => React.ReactNode;
  children?: React.ReactNode;
}

export default function InsightsSection({ 
  type, 
  title, 
  insights, 
  getInsightIcon, 
  getPriorityColor, 
  getTrendIcon,
  children 
}: InsightsSectionProps) {
  if (insights.length === 0 && !children) return null;

  const getSectionIcon = () => {
    switch (type) {
      case 'overview':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'risks':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'opportunities':
        return <Lightbulb className="w-5 h-5 text-yellow-600" />;
      case 'collaboration':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'investor':
        return <Briefcase className="w-5 h-5 text-purple-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSectionBgColor = () => {
    switch (type) {
      case 'overview':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'risks':
        return 'bg-red-100 dark:bg-red-900/20';
      case 'opportunities':
        return 'bg-yellow-100 dark:bg-yellow-900/20';
      case 'collaboration':
        return 'bg-blue-100 dark:bg-blue-900/20';
      case 'investor':
        return 'bg-purple-100 dark:bg-purple-900/20';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-8 h-8 rounded-lg ${getSectionBgColor()} flex items-center justify-center`}>
          {getSectionIcon()}
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {children}

      {insights.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {insights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              getInsightIcon={getInsightIcon}
              getPriorityColor={getPriorityColor}
              getTrendIcon={getTrendIcon}
            />
          ))}
        </div>
      )}
    </section>
  );
}
