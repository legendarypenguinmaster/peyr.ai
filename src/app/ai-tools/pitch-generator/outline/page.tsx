"use client";

import { useEffect, useState } from "react";
import ClientPageWrapper from "@/components/ui/ClientPageWrapper";
import DashboardHeader from "@/components/layout/DashboardHeader";

export default function PitchOutlinePage() {
  const [outline, setOutline] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const raw = sessionStorage.getItem("pg:step1");
        if (!raw) {
          setError("Missing inputs. Please start again.");
          setLoading(false);
          return;
        }
        const inputs = JSON.parse(raw);
        const res = await fetch("/api/ai-tools/pitch-generator/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inputs),
        });
        if (!res.ok) throw new Error("Failed to generate");
        const text = await res.text();
        setOutline(text);
      } catch (e) {
        setError("Failed to generate deck. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <ClientPageWrapper loadingText="Generating deck...">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <DashboardHeader />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h1 className="text-xl font-bold text-gray-900">AI Pitch Deck</h1>
            {loading && <p className="mt-4 text-gray-600">Generating...</p>}
            {error && <p className="mt-4 text-red-600">{error}</p>}
            {!loading && !error && (
              <div className="prose max-w-none mt-4 whitespace-pre-wrap text-gray-800">{outline}</div>
            )}
          </div>
        </main>
      </div>
    </ClientPageWrapper>
  );
}


