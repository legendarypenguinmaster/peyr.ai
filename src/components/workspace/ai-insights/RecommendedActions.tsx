import { Zap } from "lucide-react";
import RichText from "@/components/ui/RichText";

interface RecommendedActionsProps {
  actions: string[];
}

export default function RecommendedActions({ actions }: RecommendedActionsProps) {
  if (actions.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-indigo-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recommended Actions</h2>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
      </div>
      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">AI-Powered Action Plan</h3>
        </div>
        <ul className="space-y-3">
          {actions.map((action, index) => (
            <li key={index} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-indigo-100 dark:border-indigo-800">
              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{index + 1}</span>
              </div>
              <RichText 
                text={action}
                className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
