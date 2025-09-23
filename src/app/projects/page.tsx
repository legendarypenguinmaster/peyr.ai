"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Search, Plus, Filter, MapPin, Clock, Users, DollarSign } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  industry: string;
  stage: string;
  commitment: string;
  roleNeeded: string;
  requiredSkills: string[];
  status: string;
  budget?: number;
  deadline?: string;
  keywords: string[];
  createdAt: string;
  author: {
    name: string;
    avatar?: string;
  };
}

interface Filters {
  industry: string;
  stage: string;
  commitment: string;
  roleNeeded: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({
    industry: "all",
    stage: "any",
    commitment: "any",
    roleNeeded: ""
  });
  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    industry: "all",
    stage: "any",
    commitment: "any",
    roleNeeded: ""
  });
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const projectsPerPage = 10;

  // Fetch projects from API
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters using applied filters and search
      const params = new URLSearchParams();
      if (appliedFilters.industry !== "all") params.append("industry", appliedFilters.industry);
      if (appliedFilters.stage !== "any") params.append("stage", appliedFilters.stage);
      if (appliedFilters.commitment !== "any") params.append("commitment", appliedFilters.commitment);
      if (appliedFilters.roleNeeded) params.append("roleNeeded", appliedFilters.roleNeeded);
      if (appliedSearchQuery) params.append("search", appliedSearchQuery);
      params.append("page", currentPage.toString());
      params.append("limit", projectsPerPage.toString());

      const response = await fetch(`/api/projects?${params.toString()}`);
      
      if (!response.ok) {
        let errorData = {};
        try {
          const text = await response.text();
          errorData = text ? JSON.parse(text) : {};
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error("API Error:", errorData);
        throw new Error((errorData as { error?: string }).error || `HTTP ${response.status}: Failed to fetch projects`);
      }

      const data = await response.json();
      setProjects(data.projects);
      setTotalPages(data.pagination.totalPages);
      setTotalProjects(data.pagination.total);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch projects");
      setProjects([]);
      setTotalPages(1);
      setTotalProjects(0);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, appliedSearchQuery, currentPage]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Reset to first page when applied filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters, appliedSearchQuery]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setAppliedSearchQuery(searchQuery);
      setCurrentPage(1);
    }
  };

  const clearFilters = () => {
    const defaultFilters = {
      industry: "all",
      stage: "any",
      commitment: "any",
      roleNeeded: ""
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setSearchQuery("");
    setAppliedSearchQuery("");
    setCurrentPage(1);
  };

  // Current projects are already paginated from API
  const currentProjects = projects;

  const getIndustryColor = (industry: string) => {
    const colors = {
      fintech: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      healthtech: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      edtech: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      "e-commerce": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      "ai/ml": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
      biotech: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
      cleantech: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    };
    return colors[industry as keyof typeof colors] || colors.other;
  };

  const getStageColor = (stage: string) => {
    const colors = {
      idea: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      mvp: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      growth: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    };
    return colors[stage as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      planning: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      "in progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      "on hold": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
    };
    return colors[status as keyof typeof colors] || colors.planning;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Startup Projects
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover exciting startup projects and find your next opportunity
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                  {(filters.industry !== appliedFilters.industry || 
                    filters.stage !== appliedFilters.stage || 
                    filters.commitment !== appliedFilters.commitment || 
                    filters.roleNeeded !== appliedFilters.roleNeeded) && (
                    <span className="ml-2 w-2 h-2 bg-orange-500 rounded-full" title="Filters changed - click Find to apply"></span>
                  )}
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                {/* Industry Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Industry
                  </label>
                  <select
                    value={filters.industry}
                    onChange={(e) => handleFilterChange("industry", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Industries</option>
                    <option value="fintech">FinTech</option>
                    <option value="healthtech">HealthTech</option>
                    <option value="edtech">EdTech</option>
                    <option value="e-commerce">E-commerce</option>
                    <option value="ai/ml">AI/ML</option>
                    <option value="biotech">BioTech</option>
                    <option value="cleantech">CleanTech</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Stage Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stage
                  </label>
                  <select
                    value={filters.stage}
                    onChange={(e) => handleFilterChange("stage", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="any">Any Stage</option>
                    <option value="idea">Idea</option>
                    <option value="mvp">MVP</option>
                    <option value="growth">Growth</option>
                  </select>
                </div>

                {/* Commitment Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Commitment
                  </label>
                  <select
                    value={filters.commitment}
                    onChange={(e) => handleFilterChange("commitment", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="any">Any Commitment</option>
                    <option value="part-time">Part-time</option>
                    <option value="full-time">Full-time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

                {/* Role Needed Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role Needed
                  </label>
                  <input
                    type="text"
                    value={filters.roleNeeded}
                    onChange={(e) => handleFilterChange("roleNeeded", e.target.value)}
                    placeholder="e.g., CTO, Designer, etc"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Find Button */}
              <div className="pt-4">
                <button
                  onClick={applyFilters}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Projects</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Post Project */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  placeholder="Search projects by title or keywords... (Press Enter to search)"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    searchQuery !== appliedSearchQuery 
                      ? "border-orange-300 dark:border-orange-600" 
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {searchQuery !== appliedSearchQuery && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full" title="Press Enter to search"></span>
                  </div>
                )}
              </div>
              <button
                onClick={() => router.push('/project/new')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Post Project</span>
              </button>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Showing {totalProjects} project{totalProjects !== 1 ? 's' : ''}
                {appliedSearchQuery && ` for "${appliedSearchQuery}"`}
              </p>
            </div>

            {/* Projects List */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Error Loading Projects
                </h3>
                <p className="text-red-600 dark:text-red-400 mb-6">
                  {error}
                </p>
                <button
                  onClick={fetchProjects}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : currentProjects.length > 0 ? (
              <div className="space-y-6">
                {currentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => window.location.href = `/projects/detail/${project.id}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {project.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 ml-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getIndustryColor(project.industry)}`}>
                          {project.industry}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStageColor(project.stage)}`}>
                          {project.stage}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{project.roleNeeded}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="capitalize">{project.commitment}</span>
                      </div>
                      {project.budget && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <DollarSign className="w-4 h-4 mr-2" />
                          <span>${project.budget.toLocaleString()}</span>
                        </div>
                      )}
                      {project.deadline && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{new Date(project.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {project.requiredSkills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                        {project.requiredSkills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm">
                            +{project.requiredSkills.length - 3} more
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span>by {project.author.name}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No projects found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-8 space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
