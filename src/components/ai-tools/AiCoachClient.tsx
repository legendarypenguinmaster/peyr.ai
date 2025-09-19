"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Brain, Rocket, Users, LineChart, Send, Lightbulb, Sparkles, Plus, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

const tabs = [
  { key: "idea", label: "Idea Validation", icon: Lightbulb, color: "bg-amber-100 text-amber-800" },
  { key: "market", label: "Market Analysis", icon: LineChart, color: "bg-blue-100 text-blue-800" },
  { key: "funding", label: "Funding Advice", icon: Rocket, color: "bg-green-100 text-green-800" },
  { key: "team", label: "Team Building", icon: Users, color: "bg-purple-100 text-purple-800" },
  { key: "growth", label: "Growth Strategy", icon: Brain, color: "bg-orange-100 text-orange-800" },
];

export default function AiCoachClient() {
  const [activeTab, setActiveTab] = useState("idea");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const [typing, setTyping] = useState(false);
  const [hasAsked, setHasAsked] = useState(false);
  const [sessions, setSessions] = useState<{ id: string; title: string; created_at?: string }[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const supabase = createClient();

  // Load all chat history for the current user
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("ai_coach_sessions")
          .select("id, title, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (data) setSessions(data as { id: string; title: string; created_at?: string }[]);
      } catch {}
    };
    loadSessions();
  }, [supabase]);
  const timeOf = (ts: number) => {
    try {
      return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  useEffect(() => {
    // Seed greeting message
    setMessages([
      {
        id: "greet",
        role: "assistant",
        createdAt: Date.now(),
        content:
          "Hi! I'm your AI Startup Coach, powered by advanced AI. I'm here to help you navigate your entrepreneurial journey with personalized insights, strategic advice, and data‑driven recommendations. What would you like to discuss today?",
      },
    ]);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const suggestionsByTab: Record<string, string[]> = useMemo(() => ({
    idea: [
      "How do I validate my startup idea?",
      "Can you outline a quick experiment plan?",
      "What metrics prove problem-solution fit?",
      "How to interview users effectively?",
    ],
    market: [
      "Give me a quick market analysis for my idea.",
      "Who are the top competitors and their gaps?",
      "What's the TAM/SAM/SOM and how to estimate it?",
      "What trends could shape this market in 12 months?",
    ],
    funding: [
      "What's the best funding strategy for my stage?",
      "How do I craft a compelling narrative for investors?",
      "Which milestones should I hit before raising?",
      "What KPIs matter most for seed investors?",
    ],
    team: [
      "How do I find the right co‑founder?",
      "What startup roles should I hire first?",
      "How to design an equity split that's fair?",
      "How can I avoid team misalignment early?",
    ],
    growth: [
      "Help me with my go‑to‑market strategy",
      "Suggest a 90‑day growth plan for B2B SaaS",
      "What channels fit a low‑budget launch?",
      "How do I design a referral loop?",
    ],
  }), []);

  const suggested = useMemo(() => suggestionsByTab[activeTab] || suggestionsByTab.idea, [activeTab, suggestionsByTab]);
  const placeholder = useMemo(() => (suggested?.[0] ? suggested[0] : "Ask your startup coach anything"), [suggested]);

  const onSend = async () => {
    const prompt = input.trim();
    if (!prompt || isSending) return;
    setIsSending(true);
    const user: Message = { id: crypto.randomUUID(), role: "user", content: prompt, createdAt: Date.now() };
    setMessages((m) => [...m, user]);
    setInput("");
    setTyping(true);
    setHasAsked(true);

    // Ensure a session exists and persist the user message
    let ensuredSessionId = sessionId;
    try {
      if (!ensuredSessionId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const title = prompt.slice(0, 60);
          const { data } = await supabase
            .from("ai_coach_sessions")
            .insert({ user_id: user.id, title })
            .select("id, title, created_at")
            .single();
          if (data) {
            ensuredSessionId = data.id;
            setSessionId(data.id);
            setSessions((prev) => [{ id: data.id, title: data.title, created_at: data.created_at }, ...prev]);
          }
        }
      }
      if (ensuredSessionId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("ai_coach_messages").insert({ session_id: ensuredSessionId, user_id: user.id, role: "user", content: prompt });
        }
      }
    } catch {}

    try {
      const res = await fetch("/api/ai-tools/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, topic: activeTab }),
      });
      if (!res.ok || !res.body) throw new Error("Failed to get response");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      const id = crypto.randomUUID();
      const start: Message = { id, role: "assistant", content: "", createdAt: Date.now() };
      setMessages((m) => [...m, start]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, content: acc } : msg)));
      }
      // Persist assistant message
      try {
        if (ensuredSessionId) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from("ai_coach_messages").insert({ session_id: ensuredSessionId, user_id: user.id, role: "assistant", content: acc });
          }
        }
      } catch {}
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          createdAt: Date.now(),
          content: "Sorry, I couldn't process that right now. Please try again.",
        },
      ]);
    } finally {
      setIsSending(false);
      setTyping(false);
    }
  };

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar with chat history */}
      <aside className="lg:col-span-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 h-[80vh] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Your Chats</h3>
            <button
              onClick={() => { setMessages([]); setHasAsked(false); setSessionId(null); }}
              className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs px-2.5 py-1.5 rounded-md hover:bg-blue-700"
              title="New chat"
            >
              <Plus className="w-4 h-4" /> New
            </button>
          </div>
          <div className="space-y-2 overflow-y-auto flex-1">
            {sessions.map((s) => (
              <div key={s.id} className="relative group">
                <button
                  onClick={async () => {
                    setSessionId(s.id);
                    try {
                      const { data } = await supabase
                        .from("ai_coach_messages")
                        .select("role, content, created_at")
                        .eq("session_id", s.id)
                        .order("created_at", { ascending: true });
                      if (data) {
                        setMessages(
                          (data as { role: string; content: string; created_at: string }[]).map((m) => ({ id: crypto.randomUUID(), role: m.role as "user" | "assistant", content: m.content, createdAt: new Date(m.created_at).getTime() }))
                        );
                        setHasAsked(true);
                        setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }), 0);
                      }
                    } catch {}
                  }}
                  className={`w-full text-left pr-9 px-3 py-2 rounded-md text-sm border ${sessionId === s.id ? "bg-blue-50 border-blue-200 text-blue-800" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                >
                  {s.title}
                  <div className="text-[10px] text-gray-400">{s.created_at ? new Date(s.created_at).toLocaleString() : ""}</div>
                </button>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    const ok = window.confirm("Delete this chat?");
                    if (!ok) return;
                    try {
                      // Delete messages first in case cascade is not set
                      await supabase.from("ai_coach_messages").delete().eq("session_id", s.id);
                      await supabase.from("ai_coach_sessions").delete().eq("id", s.id);
                      setSessions((prev) => prev.filter((x) => x.id !== s.id));
                      if (sessionId === s.id) {
                        setSessionId(null);
                        setMessages([]);
                        setHasAsked(false);
                      }
                    } catch (err) {
                      console.error("Failed to delete session", err);
                    }
                  }}
                  className="absolute right-2 top-1.5 p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                  title="Delete chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="text-xs text-gray-500">No chats yet.</div>
            )}
          </div>
        </div>
      </aside>

      <div className="lg:col-span-9 rounded-2xl border border-blue-200 bg-white shadow-[0_10px_30px_rgba(59,130,246,0.08)] h-[80vh] flex flex-col">
      {/* Header */}
      <div className="px-5 sm:px-6 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">AI Startup Coach</h2>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-semibold">INTELLIGENT</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Your personal AI mentor for startup success, trained on thousands of ventures</p>
            </div>
          </div>
        </div>

        {/* Chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm border transition-colors ${
                activeTab === t.key
                  ? `${t.color} border-transparent`
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
              }`}
            >
              <t.icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation / Empty state */}
      <div className="mt-4 border-t border-gray-100 flex-1 min-h-0">
        {!hasAsked ? (
          <div className="flex-1 flex items-center justify-center">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 items-center justify-center">🤖</span>
              How can I help you?
            </h3>
          </div>
        ) : (
        <div ref={listRef} className="h-full overflow-y-auto px-5 sm:px-6 py-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
          {messages.map((m) => (
            <div key={m.id}>
              <div className={m.role === "assistant" ? "flex items-start gap-3" : "flex items-start justify-end"}>
              {m.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center mt-0.5">
                  <Brain className="w-4 h-4" />
                </div>
              )}
                <div className={`max-w-[90%] w-fit px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed shadow-sm prose prose-sm ${
                m.role === "assistant"
                    ? "bg-white border border-gray-200 text-gray-800"
                    : "bg-blue-600 text-white"
                }`}>
                  {m.role === "assistant" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
              <div className={`mt-1 text-[11px] ${m.role === "assistant" ? "text-gray-500" : "text-right text-gray-400"}`}>{timeOf(m.createdAt)}</div>
            </div>
          ))}
          {typing && (
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <span className="inline-flex h-2 w-2 rounded-full bg-gray-400 animate-pulse" />
              <span className="inline-flex h-2 w-2 rounded-full bg-gray-300 animate-pulse delay-150" />
              <span className="inline-flex h-2 w-2 rounded-full bg-gray-200 animate-pulse delay-300" />
            </div>
          )}
        </div>
        )}
      </div>

      {/* Suggestions */}
      {!hasAsked && (
      <div className="px-5 sm:px-6 pb-4">
        <p className="text-xs text-gray-500 mb-2">Suggested follow-ups:</p>
        <div className="space-y-2">
          {suggested.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="w-full text-left text-sm px-4 py-2 rounded-md bg-[#E9F2FF] hover:bg-[#DDEBFF] text-[#194E8A] border border-[#D0E2FF]"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Composer inside main card */}
      <div className="px-5 sm:px-6 pb-5">
        {hasAsked && (
          <div className="w-full flex justify-center pb-3">
            <button
              onClick={() => { setMessages([]); setHasAsked(false); setSessionId(null); }}
              className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              <span className="inline-flex h-4 w-4 items-center justify-center">🆕</span>
              New chat
            </button>
          </div>
        )}
        <div className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 text-sm outline-none placeholder:text-gray-400"
          />
          <button
            onClick={onSend}
            disabled={isSending}
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white disabled:opacity-60"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-2 text-[11px] text-gray-500">Powered by advanced AI trained on startup best practices and success patterns</p>
      </div>
      </div>
    </div>
    
    </>
  );
}


