import React from "react";
import { 
  Target, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Users, 
  BarChart3, 
  Lightbulb, 
  TrendingUp, 
  Briefcase 
} from "lucide-react";

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

interface InsightItem {
  id: string;
  type: 'achievement' | 'risk' | 'opportunity' | 'collaboration' | 'investor';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable?: boolean;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  metric?: string;
  trend?: 'up' | 'down' | 'stable';
}

export function generateInsights(members: Member[], projects: Project[], documents: Document[], tasks: Task[]): InsightItem[] {
  const newInsights: InsightItem[] = [];

  // Overview Insights
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (completionRate >= 80) {
    newInsights.push({
      id: 'milestone-success',
      type: 'achievement',
      title: 'Excellent Milestone Progress',
      description: `You've completed ${completedTasks}/${totalTasks} tasks with a ${completionRate}% completion rate. This demonstrates strong execution capability.`,
      priority: 'medium',
      actionable: true,
      actionText: 'View Task Details',
      icon: <Target className="w-5 h-5" />,
      metric: `${completionRate}%`,
      trend: 'up'
    });
  } else if (completionRate < 50) {
    newInsights.push({
      id: 'milestone-concern',
      type: 'risk',
      title: 'Milestone Progress Needs Attention',
      description: `Only ${completedTasks}/${totalTasks} tasks completed (${completionRate}% completion rate). This could impact investor confidence and team momentum.`,
      priority: 'high',
      actionable: true,
      actionText: 'Review Tasks',
      icon: <AlertTriangle className="w-5 h-5" />,
      metric: `${completionRate}%`,
      trend: 'down'
    });
  }

  // Overdue tasks
  const overdueTasks = tasks.filter(task => 
    task.status !== 'completed' && 
    new Date(task.due_date) < new Date()
  );
  
  if (overdueTasks.length > 0) {
    newInsights.push({
      id: 'overdue-tasks',
      type: 'risk',
      title: 'Overdue Tasks Detected',
      description: `${overdueTasks.length} task${overdueTasks.length > 1 ? 's' : ''} ${overdueTasks.length > 1 ? 'are' : 'is'} overdue. This creates credibility risk with investors and stakeholders.`,
      priority: 'high',
      actionable: true,
      actionText: 'Address Overdue Tasks',
      icon: <Clock className="w-5 h-5" />,
      metric: `${overdueTasks.length}`,
      trend: 'down'
    });
  }

  // Document activity
  const recentDocuments = documents.filter(doc => 
    new Date(doc.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );

  if (recentDocuments.length === 0) {
    newInsights.push({
      id: 'low-activity',
      type: 'risk',
      title: 'Low Document Activity',
      description: 'No documents have been updated in the past week. Regular documentation updates are crucial for investor transparency and team alignment.',
      priority: 'medium',
      actionable: true,
      actionText: 'Upload Documents',
      icon: <FileText className="w-5 h-5" />,
      metric: '0',
      trend: 'down'
    });
  } else {
    newInsights.push({
      id: 'active-documentation',
      type: 'achievement',
      title: 'Active Documentation',
      description: `${recentDocuments.length} document${recentDocuments.length > 1 ? 's' : ''} updated this week. Excellent progress tracking and transparency.`,
      priority: 'low',
      actionable: true,
      actionText: 'View Documents',
      icon: <FileText className="w-5 h-5" />,
      metric: `${recentDocuments.length}`,
      trend: 'up'
    });
  }

  // Collaboration insights
  if (members.length > 1) {
    const memberContributions = members.map(member => {
      const memberDocs = documents.filter(doc => doc.created_by === member.profiles.id);
      const memberTasks = tasks.filter(task => task.assigned_to === member.profiles.id);
      return {
        member: member.profiles.full_name,
        documents: memberDocs.length,
        tasks: memberTasks.length,
        total: memberDocs.length + memberTasks.length
      };
    });

    const maxContributor = memberContributions.reduce((max, current) => 
      current.total > max.total ? current : max
    );
    const minContributor = memberContributions.reduce((min, current) => 
      current.total < min.total ? current : min
    );

    if (maxContributor.total > minContributor.total * 2) {
      newInsights.push({
        id: 'collaboration-imbalance',
        type: 'collaboration',
        title: 'Collaboration Imbalance Detected',
        description: `${maxContributor.member} is contributing significantly more than ${minContributor.member}. Consider rebalancing responsibilities for better team dynamics.`,
        priority: 'medium',
        actionable: true,
        actionText: 'Review Team Balance',
        icon: <Users className="w-5 h-5" />,
        metric: `${Math.round((maxContributor.total / (maxContributor.total + minContributor.total)) * 100)}%`,
        trend: 'stable'
      });
    }
  }

  // Project status insights
  const activeProjects = projects.filter(project => project.status === 'active').length;
  const completedProjects = projects.filter(project => project.status === 'completed').length;

  if (activeProjects > 0) {
    newInsights.push({
      id: 'project-momentum',
      type: 'achievement',
      title: 'Active Project Momentum',
      description: `${activeProjects} active project${activeProjects > 1 ? 's' : ''} in progress with ${completedProjects} completed. Strong execution pipeline.`,
      priority: 'low',
      actionable: true,
      actionText: 'View Projects',
      icon: <BarChart3 className="w-5 h-5" />,
      metric: `${activeProjects}`,
      trend: 'up'
    });
  }

  // AI-generated opportunities
  newInsights.push({
    id: 'ai-opportunity-1',
    type: 'opportunity',
    title: 'AI-Powered Market Analysis',
    description: 'Based on your project data, AI suggests creating a competitive analysis document. This could significantly strengthen your investor pitch and market positioning.',
    priority: 'medium',
    actionable: true,
    actionText: 'Generate Analysis',
    icon: <Lightbulb className="w-5 h-5" />,
    metric: 'New',
    trend: 'up'
  });

  newInsights.push({
    id: 'ai-opportunity-2',
    type: 'opportunity',
    title: 'Financial Model Enhancement',
    description: 'Your business plan could benefit from a detailed 5-year financial projection. AI can help generate this based on your current data and industry benchmarks.',
    priority: 'medium',
    actionable: true,
    actionText: 'Create Financial Model',
    icon: <TrendingUp className="w-5 h-5" />,
    metric: '5-Year',
    trend: 'up'
  });

  // Investor-ready insights
  newInsights.push({
    id: 'investor-summary',
    type: 'investor',
    title: 'Monthly Progress Summary',
    description: 'AI has generated a comprehensive monthly summary highlighting key achievements, risks, and next steps. Perfect for investor communication.',
    priority: 'medium',
    actionable: true,
    actionText: 'Generate Summary',
    icon: <Briefcase className="w-5 h-5" />,
    metric: 'Monthly',
    trend: 'stable'
  });

  return newInsights;
}

export function getInsightIcon(type: InsightItem['type']) {
  switch (type) {
    case 'achievement':
      return <Target className="w-5 h-5 text-green-600" />;
    case 'risk':
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    case 'opportunity':
      return <Lightbulb className="w-5 h-5 text-yellow-600" />;
    case 'collaboration':
      return <Users className="w-5 h-5 text-blue-600" />;
    case 'investor':
      return <Briefcase className="w-5 h-5 text-purple-600" />;
    default:
      return <Target className="w-5 h-5 text-gray-600" />;
  }
}

export function getPriorityColor(priority: InsightItem['priority']) {
  switch (priority) {
    case 'high':
      return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
    case 'medium':
      return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
    case 'low':
      return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
    default:
      return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800';
  }
}

export function getTrendIcon(trend: InsightItem['trend']) {
  switch (trend) {
    case 'up':
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    case 'down':
      return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
    case 'stable':
      return <TrendingUp className="w-4 h-4 text-gray-600" />;
    default:
      return null;
  }
}
