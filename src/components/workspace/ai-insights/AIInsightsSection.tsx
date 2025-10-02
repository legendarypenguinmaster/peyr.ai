import { CheckCircle, AlertTriangle, Lightbulb, Users, Briefcase, Sparkles } from "lucide-react";
import RichText from "@/components/ui/RichText";

interface AIInsightsSectionProps {
  type: 'achievements' | 'risks' | 'opportunities' | 'collaboration' | 'investorReadiness';
  title: string;
  items: string[];
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  iconColor: string;
}

export default function AIInsightsSection({ 
  type, 
  title, 
  items, 
  icon, 
  bgColor, 
  borderColor, 
  iconColor 
}: AIInsightsSectionProps) {
  if (items.length === 0) return null;

  const getItemIcon = () => {
    switch (type) {
      case 'achievements':
        return <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />;
      case 'risks':
        return <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />;
      case 'opportunities':
        return <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />;
      case 'collaboration':
        return <Users className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />;
      case 'investorReadiness':
        return <Briefcase className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />;
    }
  };

  return (
    <div className="mb-6">
      <div className={`${bgColor} rounded-xl border ${borderColor} p-6`}>
        <div className="flex items-center gap-2 mb-4">
          {type === 'achievements' ? (
            <Sparkles className={`w-5 h-5 ${iconColor}`} />
          ) : (
            icon
          )}
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              {getItemIcon()}
              <RichText 
                text={item}
                className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
