"use client";

import { useEffect, useState } from "react";
import {
  Kanban,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Pause,
  Bot,
  Play,
  ArrowRight,
  ShieldAlert,
  Search
} from "lucide-react";
import { listTasks, updateTask, listProjects } from "@/lib/api";

const KANBAN_COLUMNS = [
  { id: "backlog", label: "Backlog", color: "#64748B" },
  { id: "planning", label: "Planning", color: "#06B6D4" },
  { id: "assigned", label: "Assigned", color: "#3B82F6" },
  { id: "in_progress", label: "In Progress", color: "#00D2FF" },
  { id: "waiting_approval", label: "Waiting Approval", color: "#F59E0B" },
  { id: "quality_review", label: "Quality Review", color: "#8B5CF6" },
  { id: "completed", label: "Completed", color: "#10B981" },
  { id: "failed", label: "Failed", color: "#EF4444" },
];

export default function TasksKanbanPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [activeTaskModal, setActiveTaskModal] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedProject, selectedPriority]);

  async function loadData() {
    setLoading(true);
    try {
      const pParams: any = {};
      if (selectedProject !== "all") pParams.project_id = selectedProject;
      if (selectedPriority !== "all") pParams.priority_filter = selectedPriority;

      const [tList, pList] = await Promise.all([listTasks(pParams), listProjects()]);
      setTasks(tList);
      setProjects(pList);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTask(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      if (activeTaskModal?.id === taskId) {
        setActiveTaskModal((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err: any) {
      alert(`Error updating task status: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Kanban className="w-5 h-5 text-[#00D2FF]" />
            Task Management (8-Stage Kanban Pipeline)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time stage tracking across multi-agent DAG dependencies and quality review gates.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 text-xs">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-[#111827] border border-[#1F293D] rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-[#0066FF]"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-[#111827] border border-[#1F293D] rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-[#0066FF]"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* 8-Column Horizontal Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 min-h-[650px]">
        {KANBAN_COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className="w-72 shrink-0 bg-[#0B0F17] border border-[#1F293D] rounded-xl flex flex-col max-h-[750px]"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-[#1F293D] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                  <span className="text-xs font-bold text-slate-200">{col.label}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111827] text-slate-400 border border-[#1F293D]">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {colTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setActiveTaskModal(t)}
                    className="p-3 rounded-lg bg-[#111827] border border-[#1F293D] hover:border-[#0066FF]/40 cursor-pointer card-hover space-y-2.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-white line-clamp-2 leading-tight">
                        {t.title}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase shrink-0 ${
                          t.priority === "urgent"
                            ? "bg-rose-500/20 text-rose-400"
                            : t.priority === "high"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Bot className="w-3.5 h-3.5 text-[#00D2FF]" />
                      <span className="font-mono text-[#00D2FF] truncate">
                        {t.assigned_agent_id}
                      </span>
                    </div>

                    {t.expected_output && (
                      <div className="text-[10px] text-slate-500 line-clamp-1 italic">
                        Out: {t.expected_output}
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#1F293D]/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>${(t.execution_cost_usd || 0).toFixed(3)}</span>
                      <span>{t.tokens_used ? `${t.tokens_used} tok` : "0 tok"}</span>
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="text-center py-8 text-[11px] text-slate-600 italic">
                    Empty Stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Detail Modal */}
      {activeTaskModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1F293D] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-xs">
            <div className="p-5 border-b border-[#1F293D] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">{activeTaskModal.title}</h3>
                <div className="text-[11px] text-slate-400 font-mono">
                  Agent: {activeTaskModal.assigned_agent_id}
                </div>
              </div>
              <button
                onClick={() => setActiveTaskModal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Description / Specification
                </label>
                <div className="p-3 rounded-lg bg-[#111827] border border-[#1F293D] text-slate-300">
                  {activeTaskModal.description || "No specifications recorded."}
                </div>
              </div>

              {activeTaskModal.actual_output && (
                <div>
                  <label className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                    Specialist Output Deliverable
                  </label>
                  <div className="p-3 rounded-lg bg-[#070A0F] border border-[#1F293D] font-mono text-[11px] text-slate-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {activeTaskModal.actual_output}
                  </div>
                </div>
              )}

              {/* Status Change Buttons */}
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Transition Task Stage
                </label>
                <div className="flex flex-wrap gap-2">
                  {KANBAN_COLUMNS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleStatusChange(activeTaskModal.id, c.id)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all ${
                        activeTaskModal.status === c.id
                          ? "bg-[#0066FF] text-white border-[#0066FF]"
                          : "bg-[#111827] text-slate-400 border-[#1F293D] hover:text-white"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
