import { Circle } from 'lucide-react';

export default function ProfileCompletion() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h3>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Completion Rate</span>
          <span className="font-medium">0%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-gray-400 h-2 rounded-full" style={{ width: '0%' }}></div>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        {['Basic Information', 'Skills & expertise', 'Portfolio & experience', 'Identity verification', 'References'].map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Circle className="w-4 h-4 text-gray-300" />
            <span className="text-sm text-gray-600">{item}</span>
          </div>
        ))}
      </div>
      
      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
        Complete Profile
      </button>
    </div>
  );
}
