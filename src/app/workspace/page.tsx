"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { 
  Plus, 
  Search, 
  FileText, 
  Video, 
  Clock, 
  BarChart3, 
  MoreVertical, 
  Calendar, 
  Users, 
  Star,
  Grid3X3,
  List,
  Filter,
  X,
  Lightbulb,
  Target,
  BookOpen,
  TrendingUp,
  ChevronDown
} from "lucide-react";

interface Workspace {
  id: string;
  title: string;
  description: string;
  owner: string;
  role: "Owner" | "Member" | "Collaborator";
  createdAt: string;
  members: number;
  tags: string[];
  rating: number;
  type: "project" | "team" | "personal";
}

export default function WorkspaceHubPage() {
  const router = useRouter();
  const { toasts, showSuccess, showError, removeToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "owned" | "collaborative">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);

  const filteredWorkspaces = workspaces.filter(workspace => {
    const matchesSearch = workspace.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workspace.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workspace.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = activeFilter === "all" || 
                         (activeFilter === "owned" && workspace.role === "Owner") ||
                         (activeFilter === "collaborative" && workspace.role !== "Owner");
    
    return matchesSearch && matchesFilter;
  });

  const handleCreateWorkspace = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setWorkspaceName("");
    setWorkspaceDescription("");
    setSelectedTemplate("");
  };

  const fetchWorkspaces = useCallback(async () => {
    if (fetchingRef.current) {
      console.log("Already fetching workspaces, skipping...");
      return;
    }
    
    try {
      console.log("Starting to fetch workspaces...");
      fetchingRef.current = true;
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (activeFilter !== "all") params.append("filter", activeFilter);
      
      const response = await fetch(`/api/workspaces?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch workspaces");
      }
      
      const data = await response.json();
      setWorkspaces(data);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      showError("Failed to fetch workspaces");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [searchQuery, activeFilter, showError]);

  const handleCreateWorkspaceSubmit = async () => {
    if (!workspaceName.trim()) {
      showError("Please enter a workspace name");
      return;
    }

    if (!selectedTemplate) {
      showError("Please select a template");
      return;
    }
    
    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: workspaceName,
          description: workspaceDescription,
          template: selectedTemplate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create workspace");
      }

      // Close modal and refresh workspaces
      handleCloseModal();
      await fetchWorkspaces();
      showSuccess("Workspace created successfully!");
    } catch (error) {
      console.error("Error creating workspace:", error);
      showError(error instanceof Error ? error.message : "Failed to create workspace");
    }
  };

  const templates = [
    {
      id: "startup-project",
      name: "Startup Project",
      icon: Lightbulb,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20"
    },
    {
      id: "product-development",
      name: "Product Development", 
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      id: "research-documentation",
      name: "Research & Documentation",
      icon: BookOpen,
      color: "text-green-600", 
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      id: "marketing-campaign",
      name: "Marketing Campaign",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20"
    }
  ];

  const handleWorkspaceClick = (workspaceId: string) => {
    router.push(`/workspace/${workspaceId}`);
  };

  const getFilterLabel = (filter: string) => {
    switch (filter) {
      case "all": return "All Workspaces";
      case "owned": return "Owned by Me";
      case "collaborative": return "Collaborative";
      default: return "All Workspaces";
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch workspaces on component mount and when filters change
  useEffect(() => {
    fetchWorkspaces();
    return () => {
      fetchingRef.current = false;
    };
  }, [searchQuery, activeFilter, fetchWorkspaces]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Workspace Hub
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Manage all your projects, documents, and collaborations in one powerful workspace
              </p>
            </div>
            <button
              onClick={handleCreateWorkspace}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Workspace
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Documents</h3>
            <p className="text-gray-600 dark:text-gray-400">Create & manage docs</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Meetings</h3>
            <p className="text-gray-600 dark:text-gray-400">Schedule & join calls</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Time Tracking</h3>
            <p className="text-gray-600 dark:text-gray-400">Track productivity</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400">Track performance</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search workspaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          
          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-w-[180px]"
            >
              <Filter className="w-4 h-4" />
              <span className="flex-1 text-left">{getFilterLabel(activeFilter)}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showFilterDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10">
                <button
                  onClick={() => {
                    setActiveFilter("all");
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors first:rounded-t-xl ${
                    activeFilter === "all"
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  All Workspaces
                </button>
                <button
                  onClick={() => {
                    setActiveFilter("owned");
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                    activeFilter === "owned"
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  Owned by Me
                </button>
                <button
                  onClick={() => {
                    setActiveFilter("collaborative");
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors last:rounded-b-xl ${
                    activeFilter === "collaborative"
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  Collaborative
                </button>
              </div>
            )}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredWorkspaces.length} workspace{filteredWorkspaces.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Workspaces Display */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading workspaces...</p>
          </div>
        ) : filteredWorkspaces.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No workspaces found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery ? "Try adjusting your search terms" : "Create your first workspace to get started"}
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreateWorkspace}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Workspace
              </button>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          }`}>
            {filteredWorkspaces.map((workspace) => (
              <div
                key={workspace.id}
                onClick={() => handleWorkspaceClick(workspace.id)}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {workspace.title}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle workspace options
                    }}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    workspace.role === "Owner"
                      ? "bg-black text-white"
                      : workspace.role === "Member"
                      ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                  }`}>
                    {workspace.role}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {workspace.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {workspace.createdAt}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {workspace.members} member{workspace.members !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    {workspace.rating}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {workspace.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Workspace Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={handleCloseModal}></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Create New Workspace
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Workspace Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="Enter workspace name..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={workspaceDescription}
                    onChange={(e) => setWorkspaceDescription(e.target.value)}
                    placeholder="Describe your workspace..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                  />
                </div>

                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Choose Template
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {templates.map((template) => {
                      const IconComponent = template.icon;
                      return (
                        <button
                          key={template.id}
                          onClick={() => setSelectedTemplate(template.id)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            selectedTemplate === template.id
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                          }`}
                        >
                          <div className={`w-12 h-12 ${template.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                            <IconComponent className={`w-6 h-6 ${template.color}`} />
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white text-center">
                            {template.name}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleCreateWorkspaceSubmit}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Create Workspace
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
