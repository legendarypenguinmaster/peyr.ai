"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Brain,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Users,
  Briefcase,
} from "lucide-react";
import MetricsOverview from "@/components/workspace/ai-insights/MetricsOverview";
import AIExecutiveSummary from "@/components/workspace/ai-insights/AIExecutiveSummary";
import AILoadingState from "@/components/workspace/ai-insights/AILoadingState";
import AIInsightsSection from "@/components/workspace/ai-insights/AIInsightsSection";
import InsightsSection from "@/components/workspace/ai-insights/InsightsSection";
import RecommendedActions from "@/components/workspace/ai-insights/RecommendedActions";
import NoInsightsState from "@/components/workspace/ai-insights/NoInsightsState";
import PageHeader from "@/components/workspace/ai-insights/PageHeader";
import {
  generateInsights,
  getInsightIcon,
  getPriorityColor,
  getTrendIcon,
} from "@/components/workspace/ai-insights/insightUtils";

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

interface AIInsightsPageClientProps {
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

interface InsightItem {
  id: string;
  type: "achievement" | "risk" | "opportunity" | "collaboration" | "investor";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  actionable?: boolean;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  metric?: string;
  trend?: "up" | "down" | "stable";
}

export default function AIInsightsPageClient({
  workspaceId,
  workspaceName,
  members,
  projects,
  documents,
  tasks,
}: AIInsightsPageClientProps) {
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<{
    executiveSummary: string;
    achievements: string[];
    risks: string[];
    opportunities: string[];
    collaboration: string[];
    investorReadiness: string[];
    recommendedActions: string[];
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch AI analysis for workspace (cached in DB if available)
  const fetchAIAnalysis = useCallback(async () => {
    try {
      setAiLoading(true);
      // Try GET cached insights first
      const getRes = await fetch(
        `/api/ai-tools/insights/workspace?workspaceId=${workspaceId}`
      );
      if (getRes.status === 200) {
        const data = await getRes.json();
        setAiAnalysis({
          executiveSummary: data.executive_summary || "",
          achievements: Array.isArray(data.achievements)
            ? data.achievements
            : [],
          risks: Array.isArray(data.risks) ? data.risks : [],
          opportunities: Array.isArray(data.opportunities)
            ? data.opportunities
            : [],
          collaboration: Array.isArray(data.collaboration)
            ? data.collaboration
            : [],
          investorReadiness: Array.isArray(data.investor_readiness)
            ? data.investor_readiness
            : [],
          recommendedActions: Array.isArray(data.recommended_actions)
            ? data.recommended_actions
            : [],
        });
        return;
      }
      // Only if not found (404), compute and persist via POST
      if (getRes.status === 404) {
        const postRes = await fetch("/api/ai-tools/insights/workspace", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId,
            members,
            projects,
            documents,
            tasks,
            force: false,
          }),
        });
        if (postRes.ok) {
          const data = await postRes.json();
          setAiAnalysis({
            executiveSummary: data.analysis.executiveSummary || "",
            achievements: data.analysis.achievements || [],
            risks: data.analysis.risks || [],
            opportunities: data.analysis.opportunities || [],
            collaboration: data.analysis.collaboration || [],
            investorReadiness: data.analysis.investorReadiness || [],
            recommendedActions: data.analysis.recommendedActions || [],
          });
        }
      } else {
        // For other errors, do not overwrite DB; just log
        console.error(
          "Failed to load cached AI insights. Status:",
          getRes.status
        );
      }
    } catch (error) {
      console.error("Failed to fetch AI analysis:", error);
    } finally {
      setAiLoading(false);
    }
  }, [workspaceId, members, projects, documents, tasks]);

  // Generate AI insights based on workspace data
  useEffect(() => {
    const newInsights = generateInsights(members, projects, documents, tasks);
    setInsights(newInsights);
    setLoading(false);
  }, [tasks, documents, members, projects]);

  // Fetch AI analysis when component mounts
  useEffect(() => {
    fetchAIAnalysis();
  }, [fetchAIAnalysis]);

  const groupedInsights = {
    overview: insights.filter((i) => i.type === "achievement"),
    risks: insights.filter((i) => i.type === "risk"),
    opportunities: insights.filter((i) => i.type === "opportunity"),
    collaboration: insights.filter((i) => i.type === "collaboration"),
    investor: insights.filter((i) => i.type === "investor"),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <Brain className="w-6 h-6 animate-pulse" />
          <span>Analyzing workspace data...</span>
        </div>
      </div>
    );
  }

  const handleRefreshAI = async () => {
    try {
      setAiLoading(true);
      const res = await fetch("/api/ai-tools/insights/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          members,
          projects,
          documents,
          tasks,
          force: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysis({
          executiveSummary: data.analysis.executiveSummary || "",
          achievements: data.analysis.achievements || [],
          risks: data.analysis.risks || [],
          opportunities: data.analysis.opportunities || [],
          collaboration: data.analysis.collaboration || [],
          investorReadiness: data.analysis.investorReadiness || [],
          recommendedActions: data.analysis.recommendedActions || [],
        });
      }
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        workspaceName={workspaceName}
        aiLoading={aiLoading}
        onRefreshAI={handleRefreshAI}
      />

      <MetricsOverview
        members={members}
        projects={projects}
        documents={documents}
        tasks={tasks}
      />

      {aiAnalysis && (
        <AIExecutiveSummary executiveSummary={aiAnalysis.executiveSummary} />
      )}

      {aiLoading && <AILoadingState />}

      <div className="space-y-8">
        {/* Overview & Achievements */}
        {(groupedInsights.overview.length > 0 ||
          (aiAnalysis && aiAnalysis.achievements.length > 0)) && (
          <InsightsSection
            type="overview"
            title="Overview & Achievements"
            insights={groupedInsights.overview}
            getInsightIcon={getInsightIcon}
            getPriorityColor={getPriorityColor}
            getTrendIcon={getTrendIcon}
          >
            {aiAnalysis && aiAnalysis.achievements.length > 0 && (
              <AIInsightsSection
                type="achievements"
                title="AI-Identified Strengths"
                items={aiAnalysis.achievements}
                icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                bgColor="bg-green-50 dark:bg-green-900/20"
                borderColor="border-green-200 dark:border-green-800"
                iconColor="text-green-600"
              />
            )}
          </InsightsSection>
        )}

        {/* Risks & Red Flags */}
        {(groupedInsights.risks.length > 0 ||
          (aiAnalysis && aiAnalysis.risks.length > 0)) && (
          <InsightsSection
            type="risks"
            title="Risks & Red Flags"
            insights={groupedInsights.risks}
            getInsightIcon={getInsightIcon}
            getPriorityColor={getPriorityColor}
            getTrendIcon={getTrendIcon}
          >
            {aiAnalysis && aiAnalysis.risks.length > 0 && (
              <AIInsightsSection
                type="risks"
                title="AI-Identified Risk Areas"
                items={aiAnalysis.risks}
                icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
                bgColor="bg-red-50 dark:bg-red-900/20"
                borderColor="border-red-200 dark:border-red-800"
                iconColor="text-red-600"
              />
            )}
          </InsightsSection>
        )}

        {/* Opportunities */}
        {(groupedInsights.opportunities.length > 0 ||
          (aiAnalysis && aiAnalysis.opportunities.length > 0)) && (
          <InsightsSection
            type="opportunities"
            title="Growth Opportunities"
            insights={groupedInsights.opportunities}
            getInsightIcon={getInsightIcon}
            getPriorityColor={getPriorityColor}
            getTrendIcon={getTrendIcon}
          >
            {aiAnalysis && aiAnalysis.opportunities.length > 0 && (
              <AIInsightsSection
                type="opportunities"
                title="AI-Identified Growth Opportunities"
                items={aiAnalysis.opportunities}
                icon={<Lightbulb className="w-5 h-5 text-yellow-600" />}
                bgColor="bg-yellow-50 dark:bg-yellow-900/20"
                borderColor="border-yellow-200 dark:border-yellow-800"
                iconColor="text-yellow-600"
              />
            )}
          </InsightsSection>
        )}

        {/* Collaboration Insights */}
        {(groupedInsights.collaboration.length > 0 ||
          (aiAnalysis && aiAnalysis.collaboration.length > 0)) && (
          <InsightsSection
            type="collaboration"
            title="Collaboration Insights"
            insights={groupedInsights.collaboration}
            getInsightIcon={getInsightIcon}
            getPriorityColor={getPriorityColor}
            getTrendIcon={getTrendIcon}
          >
            {aiAnalysis && aiAnalysis.collaboration.length > 0 && (
              <AIInsightsSection
                type="collaboration"
                title="AI Team Dynamics Analysis"
                items={aiAnalysis.collaboration}
                icon={<Users className="w-5 h-5 text-blue-600" />}
                bgColor="bg-blue-50 dark:bg-blue-900/20"
                borderColor="border-blue-200 dark:border-blue-800"
                iconColor="text-blue-600"
              />
            )}
          </InsightsSection>
        )}

        {/* Investor-Ready Insights */}
        {(groupedInsights.investor.length > 0 ||
          (aiAnalysis && aiAnalysis.investorReadiness.length > 0)) && (
          <InsightsSection
            type="investor"
            title="Investor-Ready Insights"
            insights={groupedInsights.investor}
            getInsightIcon={getInsightIcon}
            getPriorityColor={getPriorityColor}
            getTrendIcon={getTrendIcon}
          >
            {aiAnalysis && aiAnalysis.investorReadiness.length > 0 && (
              <AIInsightsSection
                type="investorReadiness"
                title="AI Investor Readiness Assessment"
                items={aiAnalysis.investorReadiness}
                icon={<Briefcase className="w-5 h-5 text-purple-600" />}
                bgColor="bg-purple-50 dark:bg-purple-900/20"
                borderColor="border-purple-200 dark:border-purple-800"
                iconColor="text-purple-600"
              />
            )}
          </InsightsSection>
        )}

        {/* Recommended Actions */}
        {aiAnalysis && aiAnalysis.recommendedActions.length > 0 && (
          <RecommendedActions actions={aiAnalysis.recommendedActions} />
        )}

        {/* No insights state */}
        {insights.length === 0 && <NoInsightsState />}
      </div>
    </div>
  );
}
