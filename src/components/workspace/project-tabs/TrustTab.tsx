"use client";
import { useMemo, useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  FileText,
  Award,
  TrendingUp,
  TrendingDown,
  Users,
  Share2,
  Download,
  ShieldCheck,
  Info,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Modal from "@/components/ui/Modal";

interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  description?: string;
  timestamp: string;
  verified: boolean;
  type: "task" | "document" | "milestone" | "general" | "trust_entry";
  trustPoints?: number;
  metadata?: Record<string, unknown>;
}

interface ContributionItem {
  person: string;
  percent: number;
  tasks: number;
  documents: number;
  milestones: number;
}

interface MilestoneItem {
  id: string;
  title: string;
  date: string;
  verified: boolean;
  by: string;
}

interface TrustScore {
  score: number;
  previousScore: number;
  trend: "up" | "down" | "stable";
}

interface TrustLedgerData {
  activities: ActivityItem[];
  trustScores: Record<string, TrustScore>;
  project: {
    id: string;
    name: string;
    workspace_id: string;
  };
}

interface TrustTabProps {
  projectId?: string;
}

export default function TrustTab({ projectId }: TrustTabProps) {
  const [data, setData] = useState<TrustLedgerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const activitiesPerPage = 10;

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const fetchTrustLedgerData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/workspaces/projects/${projectId}/trust-ledger`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch trust ledger data: ${response.statusText}`
          );
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching trust ledger data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load trust ledger data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrustLedgerData();
  }, [projectId]);

  // Calculate overall trust score (average of all users or use first user's score)
  const overallTrustScore = useMemo(() => {
    if (!data?.trustScores)
      return { score: 0, previousScore: 0, trend: "stable" as const };

    const scores = Object.values(data.trustScores);
    if (scores.length === 0)
      return { score: 0, previousScore: 0, trend: "stable" as const };

    // Use the first user's score as overall (or calculate average)
    return scores[0];
  }, [data?.trustScores]);

  // Calculate contributions from activities
  const contributions: ContributionItem[] = useMemo(() => {
    if (!data?.activities) return [];

    const userStats = new Map<
      string,
      { tasks: number; documents: number; milestones: number }
    >();

    data.activities.forEach((activity) => {
      if (!userStats.has(activity.actor)) {
        userStats.set(activity.actor, {
          tasks: 0,
          documents: 0,
          milestones: 0,
        });
      }

      const stats = userStats.get(activity.actor)!;
      if (activity.type === "task") stats.tasks++;
      else if (activity.type === "document") stats.documents++;
      else if (activity.type === "milestone") stats.milestones++;
    });

    const totalActivities = data.activities.length;
    const result: ContributionItem[] = [];

    userStats.forEach((stats, person) => {
      const total = stats.tasks + stats.documents + stats.milestones;
      const percent =
        totalActivities > 0 ? Math.round((total / totalActivities) * 100) : 0;

      result.push({
        person,
        percent,
        tasks: stats.tasks,
        documents: stats.documents,
        milestones: stats.milestones,
      });
    });

    return result.sort((a, b) => b.percent - a.percent);
  }, [data?.activities]);

  // Extract milestones from activities
  const milestones: MilestoneItem[] = useMemo(() => {
    if (!data?.activities) return [];

    return data.activities
      .filter((activity) => activity.type === "milestone")
      .map((activity) => ({
        id: activity.id,
        title: activity.action,
        date: new Date(activity.timestamp).toISOString().split("T")[0],
        verified: activity.verified,
        by: activity.actor,
      }))
      .slice(0, 5); // Limit to 5 most recent milestones
  }, [data?.activities]);

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get activities to display (latest 5 for main view, paginated for modal)
  const displayedActivities = useMemo(() => {
    if (!data?.activities) return [];

    if (showAllActivities) {
      // Paginated view for modal
      const startIndex = (currentPage - 1) * activitiesPerPage;
      const endIndex = startIndex + activitiesPerPage;
      return data.activities.slice(startIndex, endIndex);
    } else {
      // Latest 5 for main view
      return data.activities.slice(0, 5);
    }
  }, [data?.activities, showAllActivities, currentPage, activitiesPerPage]);

  // Calculate total pages for pagination
  const totalPages = useMemo(() => {
    if (!data?.activities) return 0;
    return Math.ceil(data.activities.length / activitiesPerPage);
  }, [data?.activities, activitiesPerPage]);

  // Reset pagination when modal opens
  const handleViewMore = () => {
    setCurrentPage(1);
    setShowAllActivities(true);
  };

  const handleCloseModal = () => {
    setShowAllActivities(false);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading trust ledger data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">
          No trust ledger data available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header / Score */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                {overallTrustScore.score}
              </span>
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-300 absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Trust Score
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Previous: {overallTrustScore.previousScore}
                {overallTrustScore.trend === "up" && (
                  <span className="inline-flex items-center ml-2 text-green-600 dark:text-green-400">
                    <TrendingUp className="w-4 h-4 mr-1" /> Improving
                  </span>
                )}
                {overallTrustScore.trend === "down" && (
                  <span className="inline-flex items-center ml-2 text-red-600 dark:text-red-400">
                    <TrendingDown className="w-4 h-4 mr-1" /> Declining
                  </span>
                )}
                {overallTrustScore.trend === "stable" && (
                  <span className="inline-flex items-center ml-2 text-gray-600 dark:text-gray-400">
                    <Clock3 className="w-4 h-4 mr-1" /> Stable
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm">
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">
              <Share2 className="w-4 h-4" /> Share Investor View
            </button>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5" /> The Trust Ledger turns
          collaboration into proof of credibility. Verified actions build your
          reputation over time.
        </p>
      </div>

      {/* Grid: Timeline + AI panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Activity Log
            </h4>
            {data.activities.length > 5 && (
              <button
                onClick={handleViewMore}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                View More ({data.activities.length} total)
              </button>
            )}
          </div>
          <div className="space-y-4">
            {displayedActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No activities recorded yet
              </div>
            ) : (
              displayedActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      {activity.type === "document" && (
                        <FileText className="w-4 h-4 text-purple-600" />
                      )}
                      {activity.type === "task" && (
                        <Clock3 className="w-4 h-4 text-amber-600" />
                      )}
                      {activity.type === "milestone" && (
                        <Award className="w-4 h-4 text-green-600" />
                      )}
                      {activity.type === "general" && (
                        <Users className="w-4 h-4 text-blue-600" />
                      )}
                      {activity.type === "trust_entry" && (
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        <span className="font-medium">{activity.actor}</span>{" "}
                        {activity.action}
                      </p>
                      {activity.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {activity.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(activity.timestamp)}
                        {activity.trustPoints && activity.trustPoints > 0 && (
                          <span className="ml-2 text-green-600 dark:text-green-400">
                            +{activity.trustPoints} points
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  {activity.verified ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-md">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-1 rounded-md">
                      <Clock3 className="w-3 h-3" /> Unverified
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            AI Insights
          </h4>
          <div className="space-y-3 text-sm">
            {data.activities.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No insights available yet
              </div>
            ) : (
              <>
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300">
                  {data.activities.filter((a) => a.verified).length} verified
                  activities recorded
                </div>
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300">
                  Trust score based on {data.activities.length} total activities
                </div>
                {contributions.length > 0 && (
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300">
                    {contributions[0]?.person} leads with{" "}
                    {contributions[0]?.percent}% contribution
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Contributions + Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Contribution Breakdown
          </h4>
          <div className="space-y-3">
            {contributions.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No contributions recorded yet
              </div>
            ) : (
              contributions.map((contribution) => (
                <div
                  key={contribution.person}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-200">
                      {contribution.person.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {contribution.person}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {contribution.tasks} tasks · {contribution.documents}{" "}
                        docs · {contribution.milestones} milestones
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 min-w-[160px]">
                    <div className="h-2 flex-1 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 dark:bg-blue-500"
                        style={{ width: `${contribution.percent}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-gray-700 dark:text-gray-300">
                      {contribution.percent}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Milestone Verification
          </h4>
          <div className="space-y-3">
            {milestones.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No milestones recorded yet
              </div>
            ) : (
              milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      <span className="font-medium">{milestone.title}</span>{" "}
                      {milestone.verified ? (
                        <span className="text-green-600 dark:text-green-400">
                          (Verified)
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400">
                          (Pending)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {milestone.date} · by {milestone.by}
                    </p>
                  </div>
                  {milestone.verified ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-md">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-1 rounded-md">
                      <Clock3 className="w-3 h-3" /> Awaiting Evidence
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Investor View (UI-only) */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Investor View
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Share a clean summary of Trust Score trend, verified milestones,
              and contributions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm">
              <Download className="w-4 h-4" /> Export PDF
            </button>
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">
              <Share2 className="w-4 h-4" /> Share Link
            </button>
          </div>
        </div>
      </div>

      {/* All Activities Modal */}
      <Modal
        open={showAllActivities}
        onClose={handleCloseModal}
        title={`All Activities (${data?.activities.length || 0})`}
        maxWidthClassName="max-w-4xl"
      >
        <div className="max-h-[70vh] flex flex-col">
          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              {displayedActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center">
                      {activity.type === "document" && (
                        <FileText className="w-4 h-4 text-purple-600" />
                      )}
                      {activity.type === "task" && (
                        <Clock3 className="w-4 h-4 text-amber-600" />
                      )}
                      {activity.type === "milestone" && (
                        <Award className="w-4 h-4 text-green-600" />
                      )}
                      {activity.type === "general" && (
                        <Users className="w-4 h-4 text-blue-600" />
                      )}
                      {activity.type === "trust_entry" && (
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        <span className="font-medium">{activity.actor}</span>{" "}
                        {activity.action}
                      </p>
                      {activity.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {activity.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(activity.timestamp)}
                        {activity.trustPoints && activity.trustPoints > 0 && (
                          <span className="ml-2 text-green-600 dark:text-green-400">
                            +{activity.trustPoints} points
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  {activity.verified ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-md">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-1 rounded-md">
                      <Clock3 className="w-3 h-3" /> Unverified
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer with Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {(currentPage - 1) * activitiesPerPage + 1} to{" "}
                  {Math.min(
                    currentPage * activitiesPerPage,
                    data?.activities.length || 0
                  )}{" "}
                  of {data?.activities.length || 0} activities
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300 px-3">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
