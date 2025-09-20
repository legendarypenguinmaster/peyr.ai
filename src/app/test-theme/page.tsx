"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useEffect } from "react";

export default function TestThemePage() {
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const updateDebugInfo = () => {
      const darkClassStatus = document.getElementById("dark-class-status");
      const htmlClasses = document.getElementById("html-classes");
      
      if (darkClassStatus) {
        darkClassStatus.textContent = document.documentElement.classList.contains("dark") ? "Yes" : "No";
      }
      
      if (htmlClasses) {
        htmlClasses.textContent = document.documentElement.className || "No classes";
      }
    };

    // Update immediately
    updateDebugInfo();

    // Update when theme changes
    const interval = setInterval(updateDebugInfo, 100);

    return () => clearInterval(interval);
  }, [theme]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Theme Switch Test Page
        </h1>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Current Theme: {theme}
          </h2>
          
          <div className="space-y-4">
            <button
              onClick={toggleTheme}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Toggle Theme (Button 1)
            </button>
            
            <button
              onClick={() => {
                console.log("Button 2 clicked");
                toggleTheme();
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Toggle Theme (Button 2)
            </button>
            
            <div
              onClick={() => {
                console.log("Div clicked");
                toggleTheme();
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer inline-block"
            >
              Toggle Theme (Div)
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Test Elements
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This text should change color when you toggle the theme.
          </p>
          
          {/* Debug Info */}
          <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded mb-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Debug Info:</h4>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              Current theme: <strong>{theme}</strong>
            </p>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              Document has dark class: <strong id="dark-class-status">Checking...</strong>
            </p>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              HTML classes: <strong id="html-classes">Checking...</strong>
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded">
              <p className="text-blue-800 dark:text-blue-200">Blue card</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded">
              <p className="text-green-800 dark:text-green-200">Green card</p>
            </div>
          </div>
          
          {/* Force dark mode test */}
          <div className="mt-4 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Force Dark Mode Test:</h4>
            <div className="bg-gray-800 text-white p-4 rounded">
              <p>This should always be dark (no dark: prefix)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
