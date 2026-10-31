"use client";

import { useEffect, useState, useRef } from "react";
import {
  Crown,
  Send,
  Sparkles,
  Play,
  Pause,
  Download,
  AlertCircle,
  Clock,
  CheckCircle2,
  FolderGit2,
  Sliders,
  DollarSign,
  ArrowRight,
  Bot,
  Copy,
  Check,
  Eye,
  X,
  ExternalLink,
  Code
} from "lucide-react";
import { sendCeoChat, getCeoHistory, listProjects } from "@/lib/api";

export default function CeoCommandCenterPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [planOnly, setPlanOnly] = useState(false);
  const [costLimit, setCostLimit] = useState(5.0);
  const [priority, setPriority] = useState("high");
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const extractHtml = (text: string): string | null => {
    if (!text) return null;
    const match = text.match(/```html\s*([\s\S]*?)```/i);
    if (match && match[1]) return match[1].trim();
    if (text.includes("<!DOCTYPE html") || text.includes("<html")) {
      const start = text.indexOf("<!DOCTYPE html") !== -1 ? text.indexOf("<!DOCTYPE html") : text.indexOf("<html");
      const end = text.lastIndexOf("</html>");
      if (start !== -1 && end !== -1) {
        return text.substring(start, end + 7).trim();
      }
    }
    return null;
  };

  const downloadHtml = (html: string, filename = "storefront-landing-page.html") => {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const executeTaskDirectly = async (taskCommand: string) => {
    if (loading) return;

    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      sender_type: "user",
      sender_id: "owner",
      content: taskCommand,
      created_at: new Date().toISOString(),
      metadata: {},
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await sendCeoChat({
        message: taskCommand,
        project_id: selectedProject || undefined,
        plan_only: planOnly,
        cost_limit_usd: costLimit,
      });

      const ceoMsg = {
        id: `ceo-${Date.now()}`,
        sender_type: "agent",
        sender_id: "agent_ceo",
        content: res.reply,
        created_at: new Date().toISOString(),
        metadata: { plan: res.plan, project_id: res.project_id },
      };
      setMessages((prev) => [...prev, ceoMsg]);
    } catch (err: any) {
      const errMsg = {
        id: `err-${Date.now()}`,
        sender_type: "system",
        sender_id: "system",
        content: `Error: ${err.message || "Failed to execute task."}`,
        created_at: new Date().toISOString(),
        metadata: {},
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const hist = await getCeoHistory();
        setMessages(hist);
        const pList = await listProjects();
        setProjects(pList);
      } catch (err) {
        console.error("Failed to load CEO history:", err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    setInputMessage("");

    // Optimistically append user message
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      sender_type: "user",
      sender_id: "owner",
      content: userText,
      created_at: new Date().toISOString(),
      metadata: {},
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await sendCeoChat({
        message: userText,
        project_id: selectedProject || undefined,
        plan_only: planOnly,
        cost_limit_usd: costLimit,
      });

      const ceoMsg = {
        id: `ceo-${Date.now()}`,
        sender_type: "agent",
        sender_id: "agent_ceo",
        content: res.reply,
        created_at: new Date().toISOString(),
        metadata: { plan: res.plan, project_id: res.project_id },
      };
      setMessages((prev) => [...prev, ceoMsg]);
    } catch (err: any) {
      const errMsg = {
        id: `err-${Date.now()}`,
        sender_type: "system",
        sender_id: "system",
        content: `Error: ${err.message || "Failed to communicate with AI CEO."}`,
        created_at: new Date().toISOString(),
        metadata: {},
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCommand = (prompt: string) => {
    setInputMessage(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-6xl mx-auto space-y-4">
      {/* CEO Top Banner */}
      <div className="bg-[#0B0F17] border border-[#1F293D] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0066FF] to-[#00D2FF] flex items-center justify-center shadow-glow-blue shrink-0">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              Alex Vance — AI CEO & Chief of Staff
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                Autonomous Orchestrator
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Direct the entire workforce. The CEO translates natural language into structured execution DAGs, mobilizes specialists, and delivers verified deliverables.
            </div>
          </div>
        </div>

        {/* Execution Options */}
        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={planOnly}
              onChange={(e) => setPlanOnly(e.target.checked)}
              className="rounded bg-[#111827] border-[#1F293D] text-[#0066FF] focus:ring-0"
            />
            <span>Plan Only</span>
          </label>

          <div className="flex items-center gap-1 bg-[#111827] px-2.5 py-1 rounded-lg border border-[#1F293D]">
            <DollarSign className="w-3.5 h-3.5 text-[#00D2FF]" />
            <span className="text-[11px] text-slate-400">Limit:</span>
            <select
              value={costLimit}
              onChange={(e) => setCostLimit(Number(e.target.value))}
              className="bg-transparent text-white font-mono text-xs focus:outline-none"
            >
              <option value={2.0} className="bg-[#111827]">$2.00</option>
              <option value={5.0} className="bg-[#111827]">$5.00</option>
              <option value={15.0} className="bg-[#111827]">$15.00</option>
              <option value={50.0} className="bg-[#111827]">$50.00</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Chat Conversation Window */}
      <div className="flex-1 bg-[#0B0F17] border border-[#1F293D] rounded-xl flex flex-col min-h-0 overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center p-8 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-[#0066FF]/20 text-[#00D2FF] flex items-center justify-center mb-4 border border-[#0066FF]/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-white mb-2">Welcome to the AI CEO Command Center</h2>
              <p className="text-xs text-slate-400 mb-6">
                Tell the AI CEO what you want to build or launch. The CEO will analyze the scope, formulate an execution DAG, assign specialists, and execute the work.
              </p>

              {/* Sample Quick Prompt Cards */}
              <div className="w-full space-y-2 text-left">
                <button
                  onClick={() => handleQuickCommand("Build a professional e-commerce clothing store with cart, payment integration, SEO, and Meta ads campaign.")}
                  className="w-full p-3 rounded-lg bg-[#111827] hover:bg-[#161F30] border border-[#1F293D] text-xs text-slate-200 transition-colors flex items-center justify-between group"
                >
                  <span>Build e-commerce clothing website with cart & ad strategy</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#00D2FF] group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => handleQuickCommand("Prepare a digital marketing campaign for a B2B SaaS startup with competitor analysis, landing page copy, and SEO strategy.")}
                  className="w-full p-3 rounded-lg bg-[#111827] hover:bg-[#161F30] border border-[#1F293D] text-xs text-slate-200 transition-colors flex items-center justify-between group"
                >
                  <span>Prepare multi-channel B2B SaaS growth campaign</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#00D2FF] group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => handleQuickCommand("Design and architect a CRM SaaS application with user roles, PostgreSQL schema, and FastAPI backend.")}
                  className="w-full p-3 rounded-lg bg-[#111827] hover:bg-[#161F30] border border-[#1F293D] text-xs text-slate-200 transition-colors flex items-center justify-between group"
                >
                  <span>Architect enterprise CRM SaaS with database & API</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#00D2FF] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ) : (
            messages.map((m) => {
              const isUser = m.sender_type === "user";
              const plan = m.metadata?.plan;
              const htmlCode = !isUser ? extractHtml(m.content) : null;

              return (
                <div key={m.id} className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}>
                  {!isUser && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0066FF] to-[#00D2FF] text-white flex items-center justify-center shrink-0 shadow-glow-blue mt-1">
                      <Crown className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-3xl rounded-2xl p-4.5 text-xs space-y-3 ${
                    isUser
                      ? "bg-[#0066FF] text-white shadow-glow-blue rounded-tr-none"
                      : "bg-[#111827] text-slate-200 border border-[#1F293D] rounded-tl-none"
                  }`}>
                    <div className="flex items-center justify-between font-semibold text-[11px] opacity-80 mb-1">
                      <span>{isUser ? "Founder & Owner" : "Alex Vance — AI CEO"}</span>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(m.content);
                          }}
                          className="hover:text-[#00D2FF] text-slate-400 p-1 rounded transition-colors"
                          title="Copy deliverable content"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Interactive Deliverable Action Bar for HTML Websites */}
                    {htmlCode && (
                      <div className="p-3 rounded-xl bg-gradient-to-r from-[#0066FF]/20 to-[#00D2FF]/20 border border-[#0066FF]/40 flex flex-wrap items-center justify-between gap-2.5 my-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-bold text-white text-[11px]">Live Web Deliverable Ready</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewHtml(htmlCode);
                              setShowPreviewModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#00D2FF] hover:bg-[#00B8E6] text-slate-950 font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview Live</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadHtml(htmlCode, "pizza-storefront.html")}
                            className="px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1A2333] border border-slate-700 text-slate-200 font-semibold text-[11px] flex items-center gap-1.5 transition-all"
                          >
                            <Download className="w-3.5 h-3.5 text-[#00D2FF]" />
                            <span>Download .html</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>

                    {/* Render Plan Card if Present */}
                    {plan && plan.tasks && (
                      <div className="mt-4 pt-3 border-t border-slate-700/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] text-[#00D2FF] uppercase tracking-wider">
                            Structured Task DAG ({plan.tasks.length} Specialists)
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Est: ~${plan.estimated_cost_usd || "5.00"} USD
                          </span>
                        </div>

                        {/* Execute Entire Workforce Button */}
                        <button
                          type="button"
                          onClick={() => executeTaskDirectly("Execute all remaining tasks for this project")}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#00D2FF] hover:opacity-90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-glow-blue transition-all"
                        >
                          <Sparkles className="w-4 h-4 text-white" />
                          <span>⚡ Run Entire Workforce (Execute All 6 Specialists)</span>
                        </button>

                        <div className="space-y-2">
                          {plan.tasks.map((task: any, idx: number) => (
                            <div
                              key={idx}
                              onClick={() => executeTaskDirectly(`Execute task: ${task.title}`)}
                              title="Click to immediately execute this specialist deliverable"
                              className="p-2.5 rounded-lg bg-[#0B0F17]/80 border border-[#1F293D] hover:border-[#0066FF] hover:bg-[#111827] cursor-pointer flex items-center justify-between gap-3 group transition-all"
                            >
                              <div className="min-w-0">
                                <div className="font-semibold text-white truncate group-hover:text-[#00D2FF] transition-colors">
                                  {task.title}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                                  <span className="text-[#00D2FF]">{task.agent_id}</span>
                                  <span>•</span>
                                  <span className="text-slate-500 group-hover:text-slate-300">Click to run specialist</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-[#0066FF]/20 text-[#00D2FF] border border-[#0066FF]/30">
                                  {task.priority}
                                </span>
                                <Play className="w-3.5 h-3.5 text-[#00D2FF] group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-lg bg-[#111827] text-[#00D2FF] border border-[#1F293D] flex items-center justify-center shrink-0 font-bold text-xs mt-1">
                      FD
                    </div>
                  )}
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex gap-3.5 justify-start">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0066FF] to-[#00D2FF] text-white flex items-center justify-center shrink-0 shadow-glow-blue mt-1">
                <Crown className="w-4 h-4" />
              </div>
              <div className="bg-[#111827] text-slate-300 border border-[#1F293D] rounded-2xl rounded-tl-none p-4 text-xs flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-[#00D2FF] border-t-transparent rounded-full animate-spin" />
                <span>AI CEO is analyzing objective, orchestrating specialists, and verifying deliverables...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer Input Bar */}
        <form onSubmit={handleSend} className="p-4 bg-[#0B0F17] border-t border-[#1F293D]">
          <div className="flex items-center gap-3 bg-[#111827] border border-[#1F293D] rounded-xl px-4 py-2.5 focus-within:border-[#0066FF] transition-colors">
            <textarea
              rows={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Give a command to the AI CEO (e.g. 'Build a modern SaaS landing page with lead form and SEO')..."
              className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="p-2 rounded-lg bg-[#0066FF] hover:bg-[#0052CC] text-white shadow-glow-blue disabled:opacity-40 transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 px-1">
            <span>Press Enter to send. Shift+Enter for new line.</span>
            <span>All execution runs logged into persistent project memory.</span>
          </div>
        </form>
      </div>

      {/* Live HTML Website Preview Modal */}
      {showPreviewModal && previewHtml && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
          <div className="bg-[#0B0F17] border border-[#1F293D] rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#1F293D] flex items-center justify-between bg-[#111827]">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white text-sm">Live Storefront Browser Preview</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#0066FF]/20 text-[#00D2FF] font-mono">
                  100% Mobile Responsive
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadHtml(previewHtml, "storefront-landing-page.html")}
                  className="px-3 py-1.5 rounded-lg bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .html</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Iframe */}
            <div className="flex-1 bg-white overflow-hidden">
              <iframe
                title="Storefront Live Preview"
                srcDoc={previewHtml}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-modals allow-forms"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
