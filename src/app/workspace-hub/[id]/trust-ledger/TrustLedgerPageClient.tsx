"use client";

import React, { useState, useEffect } from "react";
import TrustScoreHeader from "@/components/workspace/trust-ledger/TrustScoreHeader";
import TrustTimeline from "@/components/workspace/trust-ledger/TrustTimeline";
import TrustCategories from "@/components/workspace/trust-ledger/TrustCategories";
import AIInsightsPanel from "@/components/workspace/trust-ledger/AIInsightsPanel";
import ExportShare from "@/components/workspace/trust-ledger/ExportShare";

type Activity = {
  id: string;
  type: "milestone" | "deadline" | "document" | "collaboration" | "investor";
  title: string;
  description: string;
  points: number;
  date: string; // ISO date
  user: string;
  status: "completed" | "missed" | "pending";
};

type Category = {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  description: string;
  icon: string;
  activities: number;
  trend: "up" | "down" | "stable";
};

type Insight = {
  id: string;
  type: "positive" | "warning" | "suggestion";
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
};

interface Member {
  role: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface Project {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Document {
  id: string;
  title: string;
  type: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  due_date: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
}

interface TrustLedgerPageClientProps {
  workspaceId: string;
  workspaceName: string;
  workspaceDescription: string;
  currentUserId: string;
  userRole: string;
  members: Member[];
  projects: Project[];
  documents: Document[];
  tasks: Task[];
}

export default function TrustLedgerPageClient(
  props: TrustLedgerPageClientProps
) {
  const { workspaceId } = props;
  const [trustScore, setTrustScore] = useState(75);
  const [previousScore, setPreviousScore] = useState(72);
  const [trend, setTrend] = useState<"up" | "down" | "stable">("up");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load workspace trust data
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/workspaces/${workspaceId}/trust-ledger?page=${page}&pageSize=7`
        );
        if (res.ok) {
          const data = await res.json();
          // Compute overall trust score from all users
          const scores = data?.trustScores
            ? (Object.values(data.trustScores) as Array<{
                score: number;
                previousScore: number;
                trend: "up" | "down" | "stable";
              }>)
            : [];
          if (!cancelled && scores.length > 0) {
            // Calculate overall workspace trust score (average of all users)
            const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
            const totalPreviousScore = scores.reduce(
              (sum, s) => sum + s.previousScore,
              0
            );
            const avgScore = Math.round(totalScore / scores.length);
            const avgPreviousScore = Math.round(
              totalPreviousScore / scores.length
            );

            // Determine overall trend
            let overallTrend: "up" | "down" | "stable" = "stable";
            if (avgScore > avgPreviousScore) overallTrend = "up";
            else if (avgScore < avgPreviousScore) overallTrend = "down";

            setTrustScore(avgScore);
            setPreviousScore(avgPreviousScore);
            setTrend(overallTrend);
          }
          // Map API activities to TrustTimeline format
          if (!cancelled && Array.isArray(data?.activities)) {
            const mapped: Activity[] = data.activities.map(
              (a: {
                id: string;
                action: string;
                description?: string;
                trustPoints?: number;
                type: string;
                timestamp: string;
                actor: string;
              }) => {
                const points: number =
                  typeof a.trustPoints === "number" ? a.trustPoints : 0;
                const status: Activity["status"] =
                  points < 0 ? "missed" : points > 0 ? "completed" : "pending";
                let type: Activity["type"] = "collaboration";
                if (a.type === "document") type = "document";
                else if (a.type === "task")
                  type = status === "missed" ? "deadline" : "milestone";
                else if (points < 0) type = "penalty" as Activity["type"];
                return {
                  id: a.id,
                  type,
                  title: a.action,
                  description: a.description || "",
                  points,
                  date: new Date(a.timestamp).toISOString().split("T")[0],
                  user: a.actor,
                  status,
                };
              }
            );
            setActivities(mapped);
            if (data?.pagination?.totalPages) {
              setTotalPages(data.pagination.totalPages);
            }
            if (data?.insights) {
              setInsights(data.insights);
            }
            if (data?.categories) {
              setCategories(data.categories);
            }
          }
        }
      } catch (_e) {
        // ignore for now; keep mock fallback below
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [workspaceId, page]);

  // No more mock data - everything comes from API now

  const handleExport = (type: "private" | "investor") => {
    console.log(`Exporting ${type} view of trust ledger`);
    // TODO: Implement actual export functionality
  };

  const handleShare = (type: "private" | "investor") => {
    console.log(`Sharing ${type} view of trust ledger`);
    // TODO: Implement actual sharing functionality
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Trust Score Header */}
      <TrustScoreHeader
        trustScore={trustScore}
        previousScore={previousScore}
        trend={trend}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column - Timeline */}
        <div className="lg:col-span-2">
          <TrustTimeline activities={activities} />
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Right Column - AI Insights */}
        <div>
          <AIInsightsPanel insights={insights} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trust Categories */}
        <div>
          <TrustCategories categories={categories} />
        </div>

        {/* Export & Share */}
        <div>
          <ExportShare
            trustScore={trustScore}
            onExport={handleExport}
            onShare={handleShare}
          />
        </div>
      </div>
    </div>
  );
}
