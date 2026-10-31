"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderGit2,
  Plus,
  Download,
  FileCode,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowRight,
  Folder,
  FileText
} from "lucide-react";
import { listProjects, createProject, listProjectFiles, getProjectExportUrl } from "@/lib/api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeProjectFiles, setActiveProjectFiles] = useState<{ id: string; files: any[] } | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [budget, setBudget] = useState(50.0);
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    try {
      const data = await listProjects();
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreateLoading(true);

    try {
      await createProject({
        name: name.trim(),
        description: description.trim(),
        priority,
        budget_limit_usd: budget,
      });
      setShowCreateModal(false);
      setName("");
      setDescription("");
      loadProjects();
    } catch (err: any) {
      alert(`Error creating project: ${err.message}`);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleInspectFiles = async (project: any) => {
    try {
      const res = await listProjectFiles(project.id);
      setActiveProjectFiles({ id: project.id, files: res.files });
    } catch (err: any) {
      alert(`Error loading project files: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-[#00D2FF]" />
            Software & Digital Projects
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Each software development initiative operates inside its own isolated filesystem workspace.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-lg bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-semibold shadow-glow-blue flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-16 text-xs text-slate-500">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-2xl bg-[#0B0F17] border border-[#1F293D] max-w-md mx-auto">
          <FolderGit2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No Projects Provisioned</h3>
          <p className="text-xs text-slate-400 mb-4">
            Initialize a project directly or command the AI CEO to plan and generate one automatically.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg bg-[#0066FF] text-white text-xs font-semibold"
          >
            Create First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-[#0B0F17] border border-[#1F293D] rounded-xl p-5 card-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-white truncate">{proj.name}</h3>
                    <div className="text-[11px] text-slate-400 font-mono">ID: {proj.id.slice(0, 8)}...</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      proj.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : proj.status === "active"
                        ? "bg-[#0066FF]/10 text-[#00D2FF] border-[#0066FF]/30"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {proj.description || "No description provided."}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#111827] border border-[#1F293D] text-[11px] font-mono mb-4">
                  <div>
                    <span className="text-slate-500 block">Tasks:</span>
                    <span className="text-white font-semibold">
                      {proj.completed_tasks} / {proj.total_tasks}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Spend:</span>
                    <span className="text-white font-semibold">${(proj.total_spend_usd || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#1F293D] flex items-center justify-between gap-2">
                <button
                  onClick={() => handleInspectFiles(proj)}
                  className="px-3 py-1.5 rounded bg-[#111827] hover:bg-[#161F30] text-slate-300 text-xs font-medium border border-[#1F293D] flex items-center gap-1.5 transition-colors"
                >
                  <FileCode className="w-3.5 h-3.5 text-[#00D2FF]" />
                  <span>Workspace Files</span>
                </button>

                <a
                  href={getProjectExportUrl(proj.id)}
                  download
                  className="p-1.5 rounded bg-[#111827] hover:bg-[#161F30] text-slate-400 hover:text-white border border-[#1F293D] transition-colors"
                  title="Download Workspace ZIP"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Workspace Files Drawer/Modal */}
      {activeProjectFiles && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1F293D] rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#1F293D] flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <FileCode className="w-4 h-4 text-[#00D2FF]" />
                <span>Isolated Project Files (workspaces/{activeProjectFiles.id.slice(0, 8)}/)</span>
              </div>
              <button
                onClick={() => setActiveProjectFiles(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {activeProjectFiles.files.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">No files in workspace yet.</div>
              ) : (
                activeProjectFiles.files.map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-[#111827] border border-[#1F293D] flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2 text-slate-200">
                      {f.type === "directory" ? (
                        <Folder className="w-4 h-4 text-blue-400" />
                      ) : (
                        <FileText className="w-4 h-4 text-emerald-400" />
                      )}
                      <span>{f.path}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {f.type === "file" ? `${(f.size / 1024).toFixed(1)} KB` : "DIR"}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-[#1F293D] bg-[#070A0F]/60 flex justify-end">
              <a
                href={getProjectExportUrl(activeProjectFiles.id)}
                download
                className="px-4 py-2 rounded-lg bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-semibold flex items-center gap-2 shadow-glow-blue"
              >
                <Download className="w-4 h-4" />
                <span>Export Entire Workspace ZIP</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1F293D] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Healthcare Patient Portal"
                  className="w-full bg-[#111827] border border-[#1F293D] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Objective</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Objective, requirements, and deliverables..."
                  className="w-full bg-[#111827] border border-[#1F293D] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-[#111827] border border-[#1F293D] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#0066FF]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Budget Limit ($)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full bg-[#111827] border border-[#1F293D] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0066FF]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1F293D]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#111827] text-slate-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 rounded-lg bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-semibold disabled:opacity-50"
                >
                  {createLoading ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
