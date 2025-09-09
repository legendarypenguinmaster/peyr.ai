import { CheckCircle, Circle } from 'lucide-react';

export default function TrustScore() {
  const trustItems = [
    { label: 'Identity Verified', completed: false },
    { label: 'Background Check', completed: false },
    { label: 'References (3)', completed: false },
    { label: 'Project History', completed: true }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Trust Score</h3>
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <span className="text-2xl font-bold text-green-600">0.0</span>
        </div>
        <p className="text-sm text-gray-600">Building</p>
      </div>
      
      <div className="space-y-2 mb-4">
        {trustItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            {item.completed ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Circle className="w-4 h-4 text-gray-300" />
            )}
            <span className="text-sm text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
      
      <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50">
        Boost Trust Score
      </button>
    </div>
  );
}
