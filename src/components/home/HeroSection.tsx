"use client";
import Image from "next/image";
import { useState } from "react";

export default function HeroSection() {
  const [showVideo, setShowVideo] = useState(false);
  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <span className="mr-2">🌐</span>
              Peyr.ai - Built for Founders, Ready for Growth
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="inline-block relative overflow-hidden">
                <span className="relative z-10 bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  👉 Pair. Build. Trust.
                </span>
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto lg:mx-0 leading-relaxed">
              From co-founders to companies — Peyr.ai is built for founders, ready for growth. 
              Start with the right partner, build with trust, and scale with AI. Whether you bootstrap or raise, grow with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="/auth/sign-up"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-block text-center cursor-pointer"
              >
                Find My Co-Founder
              </a>
              <a
                href="/auth/sign-up"
                className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                Start Building Free
              </a>
            </div>
          </div>

          {/* Right side - Video thumbnail with play button */}
          <div className="flex justify-center lg:justify-end">
            <div 
              className="w-full max-w-lg h-96 rounded-2xl shadow-2xl overflow-hidden relative cursor-pointer group"
              onClick={() => setShowVideo(true)}
            >
              <Image
                src="/images/search.jpg"
                alt="AI-powered co-founder matching - finding the perfect match from a diverse group of entrepreneurs"
                fill
                className="object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
              />
              
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors duration-300">
                <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                  <div className="w-0 h-0 border-l-[16px] border-l-blue-600 border-y-[12px] border-y-transparent ml-1"></div>
                </div>
              </div>
              
              {/* Video label */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
                  <p className="text-white text-sm font-medium">Watch how Peyr.ai works</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showVideo && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meet Peyr.ai</h3>
              <button onClick={() => setShowVideo(false)} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-2 py-1 rounded-md">✕</button>
            </div>
            <div className="relative w-full aspect-video bg-black">
              <video controls autoPlay className="w-full h-full">
                <source src="https://shurwnbqzoakrqbapkba.supabase.co/storage/v1/object/public/resources/Meet_Peyr_ai_the_V2.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="flex justify-end px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setShowVideo(false)} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
