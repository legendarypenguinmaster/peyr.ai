import { Plus, Search, Heart } from "lucide-react";

export default function QuickActions() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Get started quickly</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm">Post New Project</span>
        </button>

        <button className="w-full border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer">
          <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <Search className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm">Find Co-Founders</span>
        </button>

        <button className="w-full border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:border-pink-300 dark:hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer">
          <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm">Browse Projects</span>
        </button>
      </div>
    </div>
  );
}
