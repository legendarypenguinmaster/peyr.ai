import { Brain } from "lucide-react";
import RichText from "@/components/ui/RichText";

interface AIExecutiveSummaryProps {
  executiveSummary: string;
}

export default function AIExecutiveSummary({ executiveSummary }: AIExecutiveSummaryProps) {
  return (
    <section className="mb-8">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Executive Summary</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Powered by AI analysis</p>
          </div>
        </div>
        <RichText 
          text={executiveSummary}
          className="text-gray-700 dark:text-gray-300 leading-relaxed"
        />
      </div>
    </section>
  );
}
