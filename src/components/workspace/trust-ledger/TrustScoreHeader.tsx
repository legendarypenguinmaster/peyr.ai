import { Shield, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrustScoreHeaderProps {
  trustScore: number;
  previousScore?: number;
  trend?: "up" | "down" | "stable";
}

export default function TrustScoreHeader({
  trustScore,
  previousScore,
  trend,
}: TrustScoreHeaderProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/20";
    return "bg-red-100 dark:bg-red-900/20";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Strong";
    if (score >= 60) return "Neutral";
    return "Weak";
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendText = () => {
    if (!previousScore) return "New";
    const diff = trustScore - previousScore;
    if (diff > 0) return `+${diff} from last month`;
    if (diff < 0) return `${diff} from last month`;
    return "No change from last month";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-full ${getScoreBgColor(
              trustScore
            )} flex items-center justify-center`}
          >
            <Shield className={`w-8 h-8 ${getScoreColor(trustScore)}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Trust Ledger
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Founder credibility record and execution tracking
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-4xl font-bold ${getScoreColor(trustScore)}`}>
              {trustScore}
            </span>
            <span className="text-2xl text-gray-500 dark:text-gray-400">
              /100
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(
                trustScore
              )} ${getScoreColor(trustScore)}`}
            >
              {getScoreLabel(trustScore)}
            </span>
            {trend && (
              <div className="flex items-center gap-1">
                {getTrendIcon()}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {getTrendText()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trust Score Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Trust Level</span>
          <span>{trustScore}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              trustScore >= 80
                ? "bg-green-500"
                : trustScore >= 60
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${trustScore}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
}
