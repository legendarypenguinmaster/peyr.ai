import { MessageCircle } from "lucide-react";

export default function RecentMessages() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Messages
              </h3>
              <p className="text-sm text-gray-600">Your conversations</p>
            </div>
          </div>
          <a
            href="#"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium bg-white px-3 py-1 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors cursor-pointer"
          >
            View All
          </a>
        </div>
      </div>

      <div className="p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-10 h-10 text-indigo-500" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            No Messages Yet
          </h4>
          <p className="text-gray-500 mb-6">
            Start connecting with potential co-founders to begin meaningful
            conversations.
          </p>
          <button className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer">
            Start Messaging
          </button>
        </div>
      </div>
    </div>
  );
}
