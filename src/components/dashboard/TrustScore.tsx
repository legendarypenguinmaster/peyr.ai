import { CheckCircle, Circle } from "lucide-react";

export default function TrustScore() {
  const trustItems = [
    { label: "Identity Verified", completed: false, icon: "🆔" },
    { label: "Background Check", completed: false, icon: "🔍" },
    { label: "References (3)", completed: false, icon: "👥" },
    { label: "Project History", completed: true, icon: "📈" },
  ];

  const completedCount = trustItems.filter((item) => item.completed).length;
  const trustScore = (completedCount / trustItems.length) * 10;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trust Score</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Build credibility</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Trust Score Display */}
        <div className="text-center mb-4">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-purple-600"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${trustScore * 10}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {trustScore.toFixed(1)}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {trustScore < 3
              ? "Building"
              : trustScore < 7
              ? "Good"
              : "Excellent"}
          </p>
        </div>

        {/* Trust Items */}
        <div className="space-y-2 mb-4">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <div className="text-sm">{item.icon}</div>
              <div className="flex-1">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
              </div>
              {item.completed ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <Circle className="w-3 h-3 text-gray-300" />
              )}
            </div>
          ))}
        </div>

        <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold cursor-pointer text-sm">
          Boost Trust Score
        </button>
      </div>
    </div>
  );
}
