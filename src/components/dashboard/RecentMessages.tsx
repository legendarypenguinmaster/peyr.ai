import { MessageCircle } from 'lucide-react';

export default function RecentMessages() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Messages</h3>
        <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</a>
      </div>
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500">No messages yet. Start connecting with potential co-founders!</p>
      </div>
    </div>
  );
}
