"use client";

import { useEffect, useState } from "react";
import PitchGeneratorStep1 from "./PitchGeneratorStep1";

type Step = "prepare" | "review" | "slides";

export default function PitchGeneratorClient() {
  const [step, setStep] = useState<Step>("prepare");
  type Deck = {
    title: string;
    summary?: string;
    market?: { sizeNote?: string; audience?: string };
    businessModel?: { model?: string; revenueStreams?: string[] };
    problem?: string;
    solution?: string;
    competitors?: string[];
    goToMarket?: string[];
    traction?: string[];
    teamNote?: string;
    financialsAndAsk?: { fundingGoal?: string; useOfFunds?: string[]; projectionsNote?: string };
    slides?: { title: string; bullets: string[] }[];
  };
  const [deck, setDeck] = useState<Deck | null>(null);
  const [generating, setGenerating] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Sync step with URL hash
  useEffect(() => {
    const currentHash = (typeof window !== "undefined" && window.location.hash.replace("#", "")) as Step;
    if (currentHash === "prepare" || currentHash === "review" || currentHash === "slides") {
      setStep(currentHash);
    } else if (typeof window !== "undefined") {
      // default to prepare if no hash
      window.location.hash = "prepare";
      setStep("prepare");
    }
    const onHashChange = () => {
      const h = window.location.hash.replace("#", "") as Step;
      if (h === "prepare" || h === "review" || h === "slides") setStep(h);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const go = (s: Step) => {
    if (typeof window !== "undefined") {
      window.location.hash = s;
      setStep(s);
    }
  };

  const Stepper = () => (
    <div className="sticky top-[68px] z-10 bg-white/70 backdrop-blur border-b border-gray-100">{/* fixed step line */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3 text-sm">
          {([
            { key: "prepare", label: "Inputs" },
            { key: "review", label: "Review" },
            { key: "slides", label: "Deck" },
          ] as { key: Step; label: string }[]).map((s, idx, arr) => (
            <div key={s.key} className="flex items-center gap-3">
              <button onClick={() => go(s.key)} className={`h-7 w-7 rounded-full text-xs font-semibold flex items-center justify-center ${step === s.key ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>{idx + 1}</button>
              <span className={`text-sm ${step === s.key ? "text-gray-900" : "text-gray-500"}`}>{s.label}</span>
              {idx < arr.length - 1 && <div className="h-px w-10 sm:w-20 bg-gray-200" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const handleGenerate = async (form: Record<string, string>) => {
    // call the generator API and move to review, store result locally
    try {
      setGenerating(true);
      const res = await fetch("/api/ai-tools/pitch-generator/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      sessionStorage.setItem("pg:outline", JSON.stringify(json));
      setDeck(json);
      go("review");
    } catch {
      go("review");
    } finally {
      setGenerating(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!deck) return;
    
    try {
      setGeneratingPdf(true);
      const res = await fetch("/api/ai-tools/pitch-generator/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deck }),
      });
      const json = await res.json();
      if (json.pdfDataUrl) {
        setPdfDataUrl(json.pdfDataUrl);
        go("slides");
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = () => {
    if (pdfDataUrl) {
      const link = document.createElement("a");
      link.href = pdfDataUrl;
      link.download = `${deck?.title || "pitch-deck"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Stepper />
      {step === "prepare" && <PitchGeneratorStep1 onGenerate={handleGenerate} />}
      {step === "review" && (
        <div className="mt-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Market Size", icon: "📈" },
                { title: "Revenue Model", icon: "💲" },
                { title: "Target Audience", icon: "👥" },
                { title: "Success Score", icon: "🎯" },
              ].map((c) => (
                <div key={c.title} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                  <div className="text-2xl">{c.icon}</div>
                  <div className="mt-2 text-sm font-medium text-gray-800">{c.title}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Generated structured result */}
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900">Generated Overview</h3>
            {generating ? (
              <p className="mt-2 text-gray-600">Generating...</p>
            ) : (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-500">Problem</div>
                  <div className="mt-1 text-gray-900">{deck?.problem || "—"}</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-500">Solution</div>
                  <div className="mt-1 text-gray-900">{deck?.solution || "—"}</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-500">Target Audience</div>
                  <div className="mt-1 text-gray-900">{deck?.market?.audience || "—"}</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-500">Business Model</div>
                  <div className="mt-1 text-gray-900">{deck?.businessModel?.model || "—"}</div>
                  {deck?.businessModel?.revenueStreams && (
                    <ul className="mt-2 list-disc list-inside text-gray-800 text-sm">
                      {deck.businessModel.revenueStreams.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="md:col-span-2 border rounded-lg p-4">
                  <div className="text-sm text-gray-500">Go-To-Market</div>
                  {deck?.goToMarket && deck.goToMarket.length > 0 ? (
                    <ul className="mt-1 list-disc list-inside text-gray-800">
                      {deck.goToMarket.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-1 text-gray-900">—</div>
                  )}
                </div>
                <div className="md:col-span-2 border rounded-lg p-4">
                  <div className="text-sm text-gray-500">Slides</div>
                  {deck?.slides && deck.slides.length > 0 ? (
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {deck.slides.map((s, i) => (
                        <div key={i} className="rounded-md border p-3">
                          <div className="font-medium text-gray-900">{s.title}</div>
                          <ul className="mt-1 list-disc list-inside text-sm text-gray-800">
                            {s.bullets.map((b, j) => (
                              <li key={j}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-1 text-gray-900">—</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button 
              onClick={handleGeneratePdf} 
              disabled={generatingPdf}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingPdf ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                "Preview Full Deck"
              )}
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">Download PDF</button>
            <button onClick={() => go("prepare") } className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">Generate New Deck</button>
          </div>
        </div>
      )}
      {step === "slides" && (
        <div className="mt-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{deck?.title || "Pitch Deck"}</h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleDownloadPdf}
                  disabled={!pdfDataUrl}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </button>
                <button onClick={() => go("review")} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Back to Review
                </button>
              </div>
            </div>

            {/* Slide Navigation */}
            <div className="mb-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {deck?.slides?.map((slide, index) => (
                  <button
                    key={index}
                    className="flex-shrink-0 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium whitespace-nowrap"
                  >
                    Slide {index + 1}: {slide.title}
                  </button>
                ))}
              </div>
            </div>

            {/* PDF Viewer or Slide Display */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 min-h-[500px] border border-purple-100">
              {pdfDataUrl ? (
                <div className="w-full h-full">
                  <iframe
                    src={pdfDataUrl}
                    className="w-full h-[500px] rounded-lg border border-gray-200"
                    title="Pitch Deck PDF"
                  />
                </div>
              ) : (
                <div className="max-w-4xl mx-auto">
                  {deck?.slides && deck.slides.length > 0 ? (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{deck.slides[0].title}</h1>
                        <div className="w-16 h-1 bg-purple-600 mx-auto rounded-full"></div>
                      </div>
                      <div className="space-y-4">
                        {deck.slides[0].bullets.map((bullet, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-lg text-gray-800 leading-relaxed">{bullet}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📊</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No slides available</h3>
                      <p className="text-gray-600">Generate a pitch deck to see slides here.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Slide Controls */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm text-gray-600">1 of {deck?.slides?.length || 0}</span>
                <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Present
                </button>
                <button 
                  onClick={handleDownloadPdf}
                  disabled={!pdfDataUrl}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


