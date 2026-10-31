"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Play,
  Settings2,
  Bot,
  Crown,
  Sparkles,
  ShieldAlert,
  Terminal,
  Activity,
  Layers,
  CheckSquare,
  FileCode,
  DollarSign
} from "lucide-react";
import { listAgents, getAgentInstruction, updateAgentInstruction, updateAgentStatus, testAgent } from "@/lib/api";

export default function WorkforcePage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [activeModalAgent, setActiveModalAgent] = useState<any | null>(null);

  // Modal State
  const [instructionText, setInstructionText] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [testPrompt, setTestPrompt] = useState("");
  const [testResponse, setTestResponse] = useState<any | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    setLoading(true);
    try {
      const data = await listAgents();
      setAgents(data);
    } catch (err) {
      console.error("Failed to load agents:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenDetail = async (agent: any) => {
    setActiveModalAgent(agent);
    setTestResponse(null);
    setTestPrompt("");
    try {
      const res = await getAgentInstruction(agent.agent_id);
      setInstructionText(res.system_prompt);
    } catch (err) {
      setInstructionText(agent.mission);
    }
  };

  const handleSaveInstruction = async () => {
    if (!activeModalAgent) return;
    setSaveLoading(true);
    try {
      await updateAgentInstruction(activeModalAgent.agent_id, instructionText);
      alert("System prompt updated successfully.");
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleStatus = async (agent: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateAgentStatus(agent.agent_id, { is_enabled: !agent.is_enabled });
      setAgents((prev) =>
        prev.map((a) => (a.agent_id === agent.agent_id ? { ...a, is_enabled: !a.is_enabled } : a))
      );
    } catch (err: any) {
      alert(`Error toggling status: ${err.message}`);
    }
  };

  const handleRunTest = async () => {
    if (!testPrompt.trim() || !activeModalAgent) return;
    setTestLoading(true);
    try {
      const res = await testAgent(activeModalAgent.agent_id, testPrompt);
      setTestResponse(res);
    } catch (err: any) {
      setTestResponse({ status: "error", response: err.message });
    } finally {
      setTestLoading(false);
    }
  };

  const filteredAgents = agents.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.designation.toLowerCase().includes(search.toLowerCase()) ||
      a.specialization.toLowerCase().includes(search.toLowerCase()) ||
      a.agent_id.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === "all" || a.department_id === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00D2FF]" />
            AI Workforce Directory (30 Registered Specialists)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Dedicated specialist profiles across 5 divisions with custom system instructions, tool permissions, and quality checklists.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search specialists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#111827] border border-[#1F293D] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0066FF]"
            />
          </div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-[#111827] border border-[#1F293D] rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-[#0066FF]"
          >
            <option value="all">All Departments (5)</option>
            <option value="executive">Executive Management</option>
            <option value="tech">Technology</option>
            <option value="marketing">Digital Marketing</option>
            <option value="creative">Creative Studio</option>
            <option value="sales">Sales & Client Services</option>
          </select>
        </div>
      </div>

      {/* Grid of 30 Agents */}
      {loading ? (
        <div className="text-center py-16 text-xs text-slate-500">Loading 30 specialist agent profiles...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAgents.map((agent) => (
            <div
              key={agent.agent_id}
              onClick={() => handleOpenDetail(agent)}
              className="bg-[#0B0F17] border border-[#1F293D] rounded-xl p-5 card-hover cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-glow-blue shrink-0"
                      style={{ backgroundColor: agent.color || "#0066FF" }}
                    >
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{agent.name}</h3>
                      <div className="text-[11px] font-medium text-[#00D2FF]">
                        {agent.designation}
                      </div>
                    </div>
                  </div>

                  {/* Enable/Disable Toggle */}
                  <button
                    onClick={(e) => handleToggleStatus(agent, e)}
                    title={agent.is_enabled ? "Disable Agent" : "Enable Agent"}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
                      agent.is_enabled
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-800 text-slate-500 border-slate-700"
                    }`}
                  >
                    {agent.is_enabled ? "Active" : "Disabled"}
                  </button>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {agent.mission}
                </p>

                {/* Tool Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {agent.tool_permissions?.slice(0, 3).map((tool: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#111827] text-slate-300 border border-[#1F293D] font-mono"
                    >
                      {tool}
                    </span>
                  ))}
                  {agent.tool_permissions?.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 text-slate-500 font-mono">
                      +{agent.tool_permissions.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats Footer */}
              <div className="pt-3 border-t border-[#1F293D] flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Runs: {agent.total_runs || 0}</span>
                <span>Tokens: {(agent.total_tokens || 0).toLocaleString()}</span>
                <span>Cost: ${(agent.total_cost_usd || 0).toFixed(3)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Agent Detail Modal / Drawer */}
      {activeModalAgent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1F293D] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#1F293D] flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: activeModalAgent.color }}
                >
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    {activeModalAgent.name}
                    <span className="text-xs px-2 py-0.5 rounded font-mono bg-[#111827] text-[#00D2FF] border border-[#1F293D]">
                      {activeModalAgent.agent_id}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">{activeModalAgent.designation}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalAgent(null)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-[#111827]"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Mission & Specialization */}
              <div className="space-y-2">
                <div className="font-semibold text-slate-300 uppercase text-[10px] tracking-wider">
                  Mission & Scope
                </div>
                <div className="p-3.5 rounded-lg bg-[#111827] border border-[#1F293D] text-slate-300 leading-relaxed">
                  {activeModalAgent.mission}
                </div>
              </div>

              {/* System Prompt Instruction Editor */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-300 uppercase text-[10px] tracking-wider">
                    System Instructions (Live Prompt)
                  </span>
                  <button
                    onClick={handleSaveInstruction}
                    disabled={saveLoading}
                    className="px-3 py-1 rounded bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-semibold shadow-glow-blue transition-all disabled:opacity-50"
                  >
                    {saveLoading ? "Saving..." : "Save Prompt"}
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={instructionText}
                  onChange={(e) => setInstructionText(e.target.value)}
                  className="w-full bg-[#111827] border border-[#1F293D] rounded-lg p-3 text-slate-200 font-mono text-xs focus:outline-none focus:border-[#0066FF] leading-relaxed"
                />
              </div>

              {/* Quality Checklist & Tools */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="font-semibold text-slate-300 uppercase text-[10px] tracking-wider">
                    Quality Checklist
                  </span>
                  <div className="p-3 rounded-lg bg-[#111827] border border-[#1F293D] space-y-1.5">
                    {activeModalAgent.quality_checklist?.map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-slate-300">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-semibold text-slate-300 uppercase text-[10px] tracking-wider">
                    Authorized Tools & Scopes
                  </span>
                  <div className="p-3 rounded-lg bg-[#111827] border border-[#1F293D] flex flex-wrap gap-1.5">
                    {activeModalAgent.tool_permissions?.map((t: string, i: number) => (
                      <span key={i} className="px-2 py-1 rounded bg-[#0B0F17] text-[#00D2FF] border border-[#1F293D] font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interactive Sandbox Test Runner */}
              <div className="p-4 rounded-xl bg-[#111827] border border-[#1F293D] space-y-3">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#00D2FF]" />
                  <span>Sandbox Test Runner</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    placeholder={`Test ${activeModalAgent.name}'s response on a specific scenario...`}
                    className="flex-1 bg-[#0B0F17] border border-[#1F293D] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0066FF]"
                  />
                  <button
                    onClick={handleRunTest}
                    disabled={testLoading || !testPrompt.trim()}
                    className="px-4 py-2 rounded-lg bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold text-xs disabled:opacity-50"
                  >
                    {testLoading ? "Running..." : "Test"}
                  </button>
                </div>

                {testResponse && (
                  <div className="mt-3 p-3 rounded-lg bg-[#070A0F] border border-[#1F293D] font-mono text-[11px] text-slate-300 whitespace-pre-wrap">
                    {testResponse.response}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
