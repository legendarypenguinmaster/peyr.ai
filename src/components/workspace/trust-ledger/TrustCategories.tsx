import { useState } from "react";
import { Target, Users, Eye, TrendingUp, BarChart3 } from "lucide-react";

interface TrustCategory {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  description: string;
  icon: React.ReactNode;
  activities: number;
  trend: "up" | "down" | "stable";
}

interface TrustCategoriesProps {
  categories: TrustCategory[];
}

export default function TrustCategories({ categories }: TrustCategoriesProps) {
  const [activeTab, setActiveTab] = useState("execution");

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "bg-green-100 dark:bg-green-900/20";
    if (percentage >= 60) return "bg-yellow-100 dark:bg-yellow-900/20";
    return "bg-red-100 dark:bg-red-900/20";
  };

  const getTrendIcon = (trend: TrustCategory["trend"]) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  const tabs = [
    {
      id: "execution",
      name: "Execution",
      icon: <Target className="w-4 h-4" />,
    },
    {
      id: "collaboration",
      name: "Collaboration",
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: "transparency",
      name: "Transparency",
      icon: <Eye className="w-4 h-4" />,
    },
    {
      id: "investor",
      name: "Investor Confidence",
      icon: <TrendingUp className="w-4 h-4" />,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Trust Categories
        </h2>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      {/* Category Content */}
      <div className="space-y-4">
        {categories
          .filter((category) => category.id === activeTab)
          .map((category) => (
            <div key={category.id} className="space-y-4">
              {/* Category Overview */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg ${getScoreBgColor(
                      category.score,
                      category.maxScore
                    )} flex items-center justify-center`}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-2xl font-bold ${getScoreColor(
                        category.score,
                        category.maxScore
                      )}`}
                    >
                      {category.score}
                    </span>
                    <span className="text-lg text-gray-500 dark:text-gray-400">
                      /{category.maxScore}
                    </span>
                    {getTrendIcon(category.trend)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {category.activities} activities
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Progress</span>
                  <span>
                    {Math.round((category.score / category.maxScore) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      category.score / category.maxScore >= 0.8
                        ? "bg-green-500"
                        : category.score / category.maxScore >= 0.6
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${(category.score / category.maxScore) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Category Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Recent Activity
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {Math.floor(category.activities * 0.3)} this week
                  </div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Completion Rate
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {Math.round((category.score / category.maxScore) * 100)}%
                  </div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    Trend
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {category.trend}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
