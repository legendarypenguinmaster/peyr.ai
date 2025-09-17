"use client";

import { useState, useEffect } from "react";
import PageLoader from "./PageLoader";

interface ClientPageWrapperProps {
  children: React.ReactNode;
  loadingText?: string;
  minLoadTime?: number; // Minimum loading time in ms
}

export default function ClientPageWrapper({ 
  children, 
  loadingText = "Loading page...",
  minLoadTime = 500 
}: ClientPageWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const loadPage = async () => {
      // Ensure minimum loading time for better UX
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsed);
      
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      setIsLoading(false);
    };

    loadPage();
  }, [startTime, minLoadTime]);

  if (isLoading) {
    return <PageLoader text={loadingText} />;
  }

  return <>{children}</>;
}
