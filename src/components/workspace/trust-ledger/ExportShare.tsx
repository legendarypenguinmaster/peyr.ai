import { useState } from "react";
import { Download, Share2, Eye, EyeOff, Lock, Unlock } from "lucide-react";

interface ExportShareProps {
  trustScore: number;
  onExport: (type: "private" | "investor") => void;
  onShare: (type: "private" | "investor") => void;
}

export default function ExportShare({
  trustScore,
  onExport,
  onShare,
}: ExportShareProps) {
  const [showShareOptions, setShowShareOptions] = useState(false);

  const exportOptions = [
    {
      id: "private",
      title: "Private View",
      description: "Detailed logs for internal use only",
      icon: <Lock className="w-5 h-5" />,
      features: [
        "Complete activity timeline",
        "Detailed trust calculations",
        "Team performance metrics",
        "All milestone tracking",
      ],
      color:
        "border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800",
    },
    {
      id: "investor",
      title: "Investor View",
      description: "Polished summary for external sharing",
      icon: <Unlock className="w-5 h-5" />,
      features: [
        "Executive summary only",
        "High-level trust metrics",
        "Key achievements highlighted",
        "Professional formatting",
      ],
      color:
        "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
          <Share2 className="w-5 h-5 text-indigo-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Export & Share
        </h2>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
      </div>

      <div className="space-y-4">
        {exportOptions.map((option) => (
          <div
            key={option.id}
            className={`p-4 rounded-lg border ${option.color} hover:shadow-sm transition-all duration-200`}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                {option.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {option.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        onExport(option.id as "private" | "investor")
                      }
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <button
                      onClick={() =>
                        onShare(option.id as "private" | "investor")
                      }
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {option.description}
                </p>
                <div className="space-y-1">
                  {option.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Score Summary */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Current Trust Score
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {trustScore >= 80
                ? "Strong credibility"
                : trustScore >= 60
                ? "Neutral credibility"
                : "Needs improvement"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {trustScore}/100
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {trustScore >= 80
                ? "Excellent"
                : trustScore >= 60
                ? "Good"
                : "Fair"}
            </div>
          </div>
        </div>
      </div>

      {/* Share Options Toggle */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowShareOptions(!showShareOptions)}
          className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
        >
          {showShareOptions ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          {showShareOptions ? "Hide" : "Show"} sharing options
        </button>

        {showShareOptions && (
          <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Sharing Options
            </h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                • <strong>Private View:</strong> Share with team members and
                advisors
              </p>
              <p>
                • <strong>Investor View:</strong> Share with potential investors
                and partners
              </p>
              <p>
                • <strong>Export Formats:</strong> PDF, DOCX, or shareable link
              </p>
              <p>
                • <strong>Access Control:</strong> Set expiration dates and view
                permissions
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
