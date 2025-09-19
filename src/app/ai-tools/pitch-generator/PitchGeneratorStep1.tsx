"use client";

import { useState } from "react";

interface Props {
  onGenerate?: (form: {
    idea: string;
    industry: string;
    funding: string;
    model: string;
    market: string;
    problem: string;
    solution: string;
    competitors: string;
  }) => void | Promise<void>;
}

export default function PitchGeneratorStep1({ onGenerate }: Props) {
  const [form, setForm] = useState({
    idea: "",
    industry: "Software",
    funding: "$1M - $3M",
    model: "SaaS",
    market: "",
    problem: "",
    solution: "",
    competitors: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ idea?: string; problem?: string; solution?: string }>({});

  const update = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    // Clear inline error as soon as the user provides a value for required fields
    if ((key === "idea" || key === "problem" || key === "solution") && value.trim().length > 0) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  };

  const onSubmit = async () => {
    setLoading(true);
    try {
      const nextErrors: { idea?: string; problem?: string; solution?: string } = {};
      if (!form.idea.trim()) nextErrors.idea = "Startup idea is required";
      if (!form.problem.trim()) nextErrors.problem = "Problem statement is required";
      if (!form.solution.trim()) nextErrors.solution = "Solution is required";
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        return;
      }
      sessionStorage.setItem("pg:step1", JSON.stringify(form));
      if (onGenerate) {
        await onGenerate(form);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Startup Idea *</label>
        <textarea value={form.idea} onChange={(e) => update("idea", e.target.value)} className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${errors.idea ? "border-red-400 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`} rows={3} placeholder="Describe your startup idea succinctly..." />
        {errors.idea && <p className="mt-1 text-xs text-red-600">{errors.idea}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
        <select value={form.industry} onChange={(e) => update("industry", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          {[
            "Software","Fintech","Healthtech","E-commerce","AI","Edtech","Climate","Other",
          ].map((i) => (<option key={i} value={i}>{i}</option>))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Funding Goal</label>
        <select value={form.funding} onChange={(e) => update("funding", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          {["<$1M","$1M - $3M","$3M - $5M","$5M - $10M","$10M+"].map((f) => (<option key={f} value={f}>{f}</option>))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Business Model</label>
        <select value={form.model} onChange={(e) => update("model", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          {["SaaS","Marketplace","Subscription","Usage-based","Freemium","Hardware","Services"].map((m) => (<option key={m} value={m}>{m}</option>))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Target Market</label>
        <input value={form.market} onChange={(e) => update("market", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe your target audience" />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Problem Statement *</label>
        <textarea value={form.problem} onChange={(e) => update("problem", e.target.value)} className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${errors.problem ? "border-red-400 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`} rows={3} placeholder="What's the core problem you solve?" />
        {errors.problem && <p className="mt-1 text-xs text-red-600">{errors.problem}</p>}
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Solution *</label>
        <textarea value={form.solution} onChange={(e) => update("solution", e.target.value)} className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${errors.solution ? "border-red-400 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`} rows={3} placeholder="Summarize your solution" />
        {errors.solution && <p className="mt-1 text-xs text-red-600">{errors.solution}</p>}
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Key Competitors</label>
        <input value={form.competitors} onChange={(e) => update("competitors", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Comma‑separated list" />
      </div>

      <div className="md:col-span-2 flex items-center justify-between pt-2">
        <p className="text-xs text-gray-500">Step 1 of 3 • Provide inputs to tailor your deck</p>
        <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60">
          {loading ? "Preparing..." : "Generate AI Pitch Deck"}
        </button>
      </div>
    </form>
  );
}


