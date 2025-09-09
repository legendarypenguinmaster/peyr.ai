import { Plus, Search, Heart } from 'lucide-react';

export default function QuickActions() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>+ Post New Project</span>
        </button>
        <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2">
          <Search className="w-4 h-4" />
          <span>Find Co-Founders</span>
        </button>
        <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2">
          <Heart className="w-4 h-4" />
          <span>Browse Projects</span>
        </button>
      </div>
    </div>
  );
}
