"use client";

import { useEffect, useState } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  DollarSign,
  Clock,
  Send,
  Lock,
  Layers
} from "lucide-react";
import { listApprovals, decideApproval } from "@/lib/api";

export default function ApprovalCenterPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadApprovals();
  }, [filter]);

  async function loadApprovals() {
    setLoading(true);
    try {
      const data = await listApprovals(filter !== "all" ? filter : undefined);
      setApprovals(data);
    } catch (err) {
      console.error("Failed to load approvals:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await decideApproval(id, "approve");
      setApprovals((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "approved" } : a))
      );
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalId) return;

    try {
      await decideApproval(rejectModalId, "reject", rejectReason);
      setApprovals((prev) =>
        prev.map((a) => (a.id === rejectModalId ? { ...a, status: "rejected" } : a))
      );
      setRejectModalId(null);
      setRejectReason("");
    } catch (err: any) {
      alert(`Rejection error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            Human Approval & Safety Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict human-in-the-loop gating for external ad spend, email dispatches, and live deployments.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {["all", "pending", "approved", "rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize border transition-all ${
                filter === st
                  ? "bg-[#0066FF] text-white border-[#0066FF]"
                  : "bg-[#111827] text-slate-400 border-[#1F293D] hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-slate-500">Loading approval queue...</div>
      ) : approvals.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-2xl bg-[#0B0F17] border border-[#1F293D]">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white mb-1">Approval Queue Clean</h3>
          <p className="text-xs text-slate-400">
            No pending action requires founder intervention at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((appr) => (
            <div
              key={appr.id}
              className="bg-[#0B0F17] border border-[#1F293D] rounded-xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      appr.risk_level === "critical"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : appr.risk_level === "high"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    }`}
                  >
                    Risk: {appr.risk_level}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    Agent: <span className="text-[#00D2FF]">{appr.requesting_agent_id}</span>
                  </span>
                  {appr.project_name && (
                    <span className="text-xs text-slate-400">• Project: {appr.project_name}</span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white">{appr.action_title}</h3>
                <p className="text-xs text-slate-400">
                  Target Service: <span className="text-slate-200 font-semibold">{appr.target_service}</span>
                  {appr.financial_impact_usd > 0 && (
                    <span className="ml-3 text-emerald-400 font-mono">
                      Financial Impact: ${appr.financial_impact_usd.toFixed(2)} USD
                    </span>
                  )}
                </p>

                <div className="p-2.5 rounded-lg bg-[#111827] border border-[#1F293D] text-[11px] font-mono text-slate-300">
                  {JSON.stringify(appr.action_details)}
                </div>
              </div>

              {/* Status / Decision Controls */}
              <div className="flex items-center gap-2.5 shrink-0">
                {appr.status === "pending" ? (
                  <>
                    <button
                      onClick={() => handleApprove(appr.id)}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => setRejectModalId(appr.id)}
                      className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </>
                ) : (
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize border ${
                      appr.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {appr.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1F293D] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-2">Reject Gated Action</h3>
            <p className="text-xs text-slate-400 mb-4">
              State the reason for rejecting this agent action. The agent will be notified and task status marked failed.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Budget too high, or copy needs revision..."
                className="w-full bg-[#111827] border border-[#1F293D] rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#0066FF]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModalId(null)}
                  className="px-3 py-1.5 rounded bg-[#111827] text-slate-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
