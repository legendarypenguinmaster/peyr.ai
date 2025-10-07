import {
  CheckCircle,
  Clock,
  FileText,
  Users,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from "lucide-react";

interface TrustActivity {
  id: string;
  type:
    | "milestone"
    | "deadline"
    | "document"
    | "collaboration"
    | "investor"
    | "penalty";
  title: string;
  description: string;
  points: number;
  date: string;
  user?: string;
  status: "completed" | "missed" | "pending";
}

interface TrustTimelineProps {
  activities: TrustActivity[];
}

export default function TrustTimeline({ activities }: TrustTimelineProps) {
  const getActivityIcon = (
    type: TrustActivity["type"],
    status: TrustActivity["status"]
  ) => {
    if (status === "missed") {
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }

    switch (type) {
      case "milestone":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "deadline":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "document":
        return <FileText className="w-5 h-5 text-purple-600" />;
      case "collaboration":
        return <Users className="w-5 h-5 text-indigo-600" />;
      case "investor":
        return <TrendingUp className="w-5 h-5 text-orange-600" />;
      case "penalty":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActivityColor = (points: number) => {
    if (points > 0)
      return "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800";
    if (points < 0)
      return "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800";
    return "border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800";
  };

  const getPointsColor = (points: number) => {
    if (points > 0) return "text-green-600 dark:text-green-400";
    if (points < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Trust Ledger Timeline
        </h2>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No activities yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start completing tasks and milestones to build your trust ledger.
            </p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className={`p-4 rounded-lg border ${getActivityColor(
                activity.points
              )} hover:shadow-sm transition-all duration-200`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                  {getActivityIcon(activity.type, activity.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {activity.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${getPointsColor(
                          activity.points
                        )}`}
                      >
                        {activity.points > 0 ? "+" : ""}
                        {activity.points} pts
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(activity.date)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {activity.description}
                  </p>
                  {activity.user && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.user}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Total Activities: {activities.length}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Net Score:{" "}
              {activities.reduce((sum, activity) => sum + activity.points, 0)}{" "}
              points
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
