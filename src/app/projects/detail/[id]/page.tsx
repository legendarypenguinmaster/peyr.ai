"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  DollarSign, 
  Calendar, 
  Share2, 
  Bookmark, 
  TrendingUp,
  Target,
  Award,
  Briefcase,
  Globe,
  ChevronRight,
  CheckCircle,
  Info,
  Heart,
  Send,
  Flag
} from "lucide-react";

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
    bio?: string;
    location?: string;
  };
  fullDescription?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${projectId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setProject(null);
          } else {
            throw new Error("Failed to fetch project");
          }
        } else {
          const data = await response.json();
          setProject(data.project);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedProjects = async () => {
      try {
        const response = await fetch(`/api/projects?industry=${project?.industry}&limit=3`);
        if (response.ok) {
          const data = await response.json();
          setRelatedProjects(data.projects?.filter((p: Project) => p.id !== projectId) || []);
        }
      } catch (error) {
        console.error("Error fetching related projects:", error);
      }
    };

    if (projectId) {
      fetchProject();
    }
    
    if (project) {
      fetchRelatedProjects();
    }
  }, [projectId, project?.industry]);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Project Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The project you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Projects
        </button>

         <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
                  <p className="text-xl text-blue-100 mb-6">{project.description}</p>
                  <div className="flex flex-wrap gap-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm`}>
                      {project.industry}
                    </span>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm`}>
                      {project.stage}
                    </span>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-3 ml-6">
                  <button
                    onClick={handleLike}
                    className={`p-3 rounded-xl transition-all ${
                      isLiked
                        ? "bg-red-500 text-white"
                        : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
                  </button>
                  <button
                    onClick={handleBookmark}
                    className={`p-3 rounded-xl transition-all ${
                      isBookmarked
                        ? "bg-yellow-500 text-white"
                        : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    }`}
                  >
                    <Bookmark className={`w-6 h-6 ${isBookmarked ? "fill-current" : ""}`} />
                  </button>
                  <button className="p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
               {/* Project Info */}
               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-6 text-blue-100">
                   <div className="flex items-center">
                     <Calendar className="w-5 h-5 mr-2" />
                     <span>Posted {new Date(project.createdAt).toLocaleDateString()}</span>
                   </div>
                   <div className="flex items-center">
                     <Users className="w-5 h-5 mr-2" />
                     <span>{project.roleNeeded}</span>
                   </div>
                   <div className="flex items-center">
                     <Clock className="w-5 h-5 mr-2" />
                     <span className="capitalize">{project.commitment}</span>
                   </div>
                 </div>
                 
                 {/* Action Buttons */}
                 <div className="flex space-x-3">
                   <button className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center">
                     <Send className="w-5 h-5 mr-2" />
                     Apply Now
                   </button>
                   <button className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/30 transition-colors flex items-center">
                     <Flag className="w-5 h-5 mr-2" />
                     Report
                   </button>
                 </div>
               </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: "overview", label: "Overview", icon: Info },
                    { id: "details", label: "Details", icon: Briefcase },
                    { id: "requirements", label: "Requirements", icon: Target }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600 dark:text-blue-400"
                          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      <tab.icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Project Overview */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Project Overview</h3>
                      {project.fullDescription ? (
                        <div
                          className="prose prose-sm max-w-none dark:prose-invert text-gray-700 dark:text-gray-300"
                          dangerouslySetInnerHTML={{ __html: project.fullDescription }}
                        />
                      ) : (
                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {project.description}
                        </div>
                      )}
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl">
                        <div className="flex items-center mb-3">
                          <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Growth Stage</h4>
                        </div>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 capitalize">{project.stage}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Current development phase</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl">
                        <div className="flex items-center mb-3">
                          <Users className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Role Needed</h4>
                        </div>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{project.roleNeeded}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Position being filled</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl">
                        <div className="flex items-center mb-3">
                          <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Commitment</h4>
                        </div>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 capitalize">{project.commitment}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Time commitment required</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "details" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-4" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">Role Needed</div>
                            <div className="text-gray-600 dark:text-gray-400">{project.roleNeeded}</div>
                          </div>
                        </div>
                        
                        {project.budget && (
                          <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400 mr-4" />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">Budget</div>
                              <div className="text-gray-600 dark:text-gray-400">${project.budget.toLocaleString()}</div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {project.deadline && (
                          <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-4" />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">Deadline</div>
                              <div className="text-gray-600 dark:text-gray-400">{new Date(project.deadline).toLocaleDateString()}</div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <Globe className="w-6 h-6 text-orange-600 dark:text-orange-400 mr-4" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">Industry</div>
                            <div className="text-gray-600 dark:text-gray-400 capitalize">{project.industry}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Required Skills */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Required Skills</h4>
                      <div className="flex flex-wrap gap-3">
                        {project.requiredSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Keywords */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm"
                          >
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "requirements" && (
                  <div className="space-y-6">
                    {/* Required Skills */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                        Required Skills
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {project.requiredSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Project Keywords */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Award className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                        Project Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {project.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm"
                          >
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Project Status */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                        Project Status
                      </h4>
                      <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                        <span className="ml-3 text-gray-600 dark:text-gray-400">
                          {project.status === "planning" && "Project is in planning phase"}
                          {project.status === "in progress" && "Project is actively being developed"}
                          {project.status === "on hold" && "Project development is currently paused"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Related Projects */}
            {relatedProjects.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Related Projects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedProjects.map((relatedProject) => (
                    <div key={relatedProject.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{relatedProject.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{relatedProject.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIndustryColor(relatedProject.industry)}`}>
                          {relatedProject.industry}
                        </span>
                        <button className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center">
                          View <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
             )}
         </div>
      </div>

    </div>
  );
}
