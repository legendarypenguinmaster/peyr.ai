'use client';

import { useState } from 'react';
import { Brain, Star, MessageCircle, Users, TrendingUp, ChevronRight } from 'lucide-react';

export default function AIInsights() {
  const [currentCard, setCurrentCard] = useState(0);

  const cards = [
    {
      title: "Profile Optimization",
      description: "Your profile could be 40% more attractive to co-founders",
      progress: 65,
      buttonText: "Optimize Now",
      icon: Star,
      iconColor: "text-green-600",
      iconBg: "bg-green-100"
    },
    {
      title: "Market Analysis",
      description: "Your project ideas have high market viability",
      progress: 78,
      buttonText: "Analyze Market",
      icon: TrendingUp,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100"
    },
    {
      title: "Smart Matching",
      description: "3 highly compatible co-founders found using AI",
      progress: 85,
      buttonText: "View Matches",
      icon: Users,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100"
    },
    {
      title: "Conversation Assistant",
      description: "Get AI-powered icebreakers for better connections",
      progress: 90,
      buttonText: "Try Assistant",
      icon: MessageCircle,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100"
    }
  ];

  const currentCardData = cards[currentCard];
  const IconComponent = currentCardData.icon;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Gradient Header */}
      <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
      
      <div className="p-6">
        {/* AI Insights Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
              <p className="text-sm text-gray-600">Personalized recommendations</p>
            </div>
          </div>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">NEW</span>
        </div>

        {/* Current Card Content */}
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-8 h-8 ${currentCardData.iconBg} rounded-lg flex items-center justify-center`}>
            <IconComponent className={`w-5 h-5 ${currentCardData.iconColor}`} />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{currentCardData.title}</h4>
            <p className="text-sm text-gray-600">{currentCardData.description}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${currentCardData.progress}%` }}></div>
          </div>
          <span className="text-sm font-medium text-gray-900">{currentCardData.progress}%</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mb-4">
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center space-x-2">
            <span>{currentCardData.buttonText}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
            Next
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center space-x-2">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentCard(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentCard ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
