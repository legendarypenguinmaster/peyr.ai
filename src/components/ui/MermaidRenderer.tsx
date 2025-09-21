"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidRendererProps {
  chart: string;
  id: string;
  className?: string;
}

export default function MermaidRenderer({ chart, id, className = "" }: MermaidRendererProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
      fontFamily: "inherit",
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
      },
      sequence: {
        useMaxWidth: true,
      },
      gantt: {
        useMaxWidth: true,
      },
    });

    const renderChart = async () => {
      if (chartRef.current && chart) {
        try {
          // Clear previous content
          chartRef.current.innerHTML = "";
          
          // Generate unique ID for this chart
          const chartId = `mermaid-${id}-${Date.now()}`;
          
          // Render the chart
          const { svg } = await mermaid.render(chartId, chart);
          
          // Insert the SVG into the container
          if (chartRef.current) {
            chartRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error("Mermaid rendering error:", error);
          if (chartRef.current) {
            chartRef.current.innerHTML = `
              <div class="flex items-center justify-center h-64 text-red-600 dark:text-red-400">
                <div class="text-center">
                  <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p class="text-sm">Error rendering diagram</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Please check your diagram syntax</p>
                </div>
              </div>
            `;
          }
        }
      }
    };

    renderChart();
  }, [chart, id]);

  return (
    <div 
      ref={chartRef} 
      className={`mermaid-container ${className}`}
      style={{ minHeight: "200px" }}
    />
  );
}
