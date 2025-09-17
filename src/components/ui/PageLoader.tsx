"use client";

import LoadingSpinner from "./LoadingSpinner";

interface PageLoaderProps {
  text?: string;
}

export default function PageLoader({ text = "Loading..." }: PageLoaderProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-lg text-gray-600">{text}</p>
        <p className="mt-2 text-sm text-gray-500">Please wait while we load your data</p>
      </div>
    </div>
  );
}
