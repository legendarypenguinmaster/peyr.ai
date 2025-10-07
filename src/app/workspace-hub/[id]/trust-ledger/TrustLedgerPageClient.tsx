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
  icon: React.ReactNode;
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
  // Reference props to avoid unused-var warnings while UI is mock-driven
  const _props = props;
  const [trustScore] = useState(75);
  const [previousScore] = useState(72);
  const [trend] = useState<"up" | "down" | "stable">("up");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      // Mock activities
      const mockActivities: Activity[] = [
        {
          id: "1",
          type: "milestone",
          title: "Prototype completed on time",
          description: "Successfully delivered MVP prototype ahead of schedule",
          points: 3,
          date: "2024-01-15",
          user: "Alice Johnson",
          status: "completed",
        },
        {
          id: "2",
          type: "deadline",
          title: "Marketing Plan delayed",
          description: "Marketing strategy document was 3 days late",
          points: -2,
          date: "2024-01-12",
          user: "Bob Smith",
          status: "missed",
        },
        {
          id: "3",
          type: "document",
          title: "Investor-ready deck uploaded",
          description: "Comprehensive pitch deck shared with team",
          points: 2,
          date: "2024-01-10",
          user: "Alice Johnson",
          status: "completed",
        },
        {
          id: "4",
          type: "collaboration",
          title: "Team collaboration milestone",
          description: "Successfully coordinated cross-functional project",
          points: 2,
          date: "2024-01-08",
          user: "Team",
          status: "completed",
        },
        {
          id: "5",
          type: "investor",
          title: "Investor meeting completed",
          description: "Successful pitch presentation to potential investors",
          points: 4,
          date: "2024-01-05",
          user: "Alice Johnson",
          status: "completed",
        },
      ];

      // Mock categories
      const mockCategories: Category[] = [
        {
          id: "execution",
          name: "Execution",
          score: 78,
          maxScore: 100,
          description:
            "Task completion, deadline adherence, and delivery quality",
          icon: <div className="w-5 h-5 bg-green-500 rounded"></div>,
          activities: 12,
          trend: "up" as const,
        },
        {
          id: "collaboration",
          name: "Collaboration",
          score: 85,
          maxScore: 100,
          description:
            "Team coordination, communication, and contribution balance",
          icon: <div className="w-5 h-5 bg-blue-500 rounded"></div>,
          activities: 8,
          trend: "stable" as const,
        },
        {
          id: "transparency",
          name: "Transparency",
          score: 72,
          maxScore: 100,
          description:
            "Document sharing, updates, and information accessibility",
          icon: <div className="w-5 h-5 bg-purple-500 rounded"></div>,
          activities: 15,
          trend: "up" as const,
        },
        {
          id: "investor",
          name: "Investor Confidence",
          score: 68,
          maxScore: 100,
          description:
            "Investor interactions, pitch quality, and business readiness",
          icon: <div className="w-5 h-5 bg-orange-500 rounded"></div>,
          activities: 5,
          trend: "up" as const,
        },
      ];

      // Mock insights
      const mockInsights: Insight[] = [
        {
          id: "1",
          type: "positive",
          title: "Strong Execution Track Record",
          description:
            "**Team has been consistent** in delivering product milestones, with 85% on-time completion rate. This demonstrates reliable execution capability.",
          category: "Execution",
          priority: "medium",
        },
        {
          id: "2",
          type: "warning",
          title: "Marketing Outputs Lagging",
          description:
            "While product development is strong, *marketing deliverables* have been delayed twice this month. Consider allocating more resources to marketing tasks.",
          category: "Execution",
          priority: "high",
        },
        {
          id: "3",
          type: "suggestion",
          title: "Collaboration Balance is Healthy",
          description:
            "Bob is leading development while Alice focuses on documentation and investor relations. This is a **healthy division of responsibilities** that plays to each founder's strengths.",
          category: "Collaboration",
          priority: "low",
        },
      ];

      setActivities(mockActivities);
      setCategories(mockCategories);
      setInsights(mockInsights);
      setLoading(false);
    }, 1000);
  }, []);

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
