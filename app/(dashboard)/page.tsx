"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  FolderGit2,
  Kanban,
  CheckCircle2,
  Coins,
  ArrowUpRight,
  Sparkles,
  Activity,
  Briefcase,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { getOverviewStats } from "@/lib/api";

export default function OverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getOverviewStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load overview statistics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B0F17] via-[#111827] to-[#161F30] border border-[#1F293D] p-8 shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 gradient-glow pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0066FF]/20 border border-[#0066FF]/30 text-xs font-semibold text-[#00D2FF]">
              <Sparkles className="w-3.5 h-3.5" />
              Executive Agency Management
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              IBS AI WORKFORCE
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-2xl">
              One Company. Thirty AI Specialists. Unlimited Possibilities. Coordinate full-cycle web development, SaaS engineering, digital marketing, creative design, and sales acquisition.
            </p>
          </div>
          <Link
            href="/ceo"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#00D2FF] text-white text-xs font-bold shadow-glow-blue hover:opacity-90 transition-all flex items-center gap-2 shrink-0 self-start md:self-auto"
          >
            <span>Launch CEO Command</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Agents */}
        <div className="bg-[#0B0F17] border border-[#1F293D] rounded-xl p-5 card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">AI Specialists</span>
            <div className="p-2 rounded-lg bg-[#0066FF]/10 text-[#00D2FF]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {loading ? "..." : `${stats?.total_agents || 30}`}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <span>{stats?.active_agents || 30} Active in Registry</span>
            <span className="text-slate-500">• 5 Divisions</span>
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-[#0B0F17] border border-[#1F293D] rounded-xl p-5 card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Active Projects</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {loading ? "..." : stats?.active_projects ?? 0}
          </div>
          <div className="text-[11px] text-slate-400">
            {stats?.completed_projects || 0} Finished Deliverables
          </div>
        </div>

        {/* Running Tasks */}
        <div className="bg-[#0B0F17] border border-[#1F293D] rounded-xl p-5 card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Running Tasks</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Kanban className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {loading ? "..." : stats?.running_tasks ?? 0}
          </div>
          <div className="text-[11px] text-amber-400">
            {stats?.pending_approvals || 0} Pending Founder Approvals
          </div>
        </div>

        {/* AI Expenditure */}
        <div className="bg-[#0B0F17] border border-[#1F293D] rounded-xl p-5 card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Monthly AI Cost</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {loading ? "..." : `$${(stats?.monthly_ai_cost_usd || 0).toFixed(2)}`}
          </div>
          <div className="text-[11px] text-slate-400">
            Total Spend: ${(stats?.total_spend_usd || 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Tasks & Real Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Completed/Active Tasks */}
        <div className="lg:col-span-2 bg-[#0B0F17] border border-[#1F293D] rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-white">Recent Task Orchestration</h2>
              <p className="text-[11px] text-slate-400">Live multi-agent execution pipeline</p>
            </div>
            <Link href="/tasks" className="text-xs text-[#00D2FF] hover:underline flex items-center gap-1">
              View Kanban Board <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="text-xs text-slate-500 py-8 text-center">Loading task pipeline...</div>
          ) : stats?.recent_tasks?.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-lg bg-[#111827]/50 border border-dashed border-[#1F293D]">
              <Kanban className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-slate-300">No active tasks yet</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Give an objective to the AI CEO in the Command Center to initiate automated work.
              </div>
              <Link
                href="/ceo"
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0066FF] text-white text-xs font-semibold"
              >
                Start First Project
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1F293D] text-slate-400 text-[11px]">
                    <th className="pb-3 font-semibold">Task</th>
                    <th className="pb-3 font-semibold">Specialist</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F293D]/50">
                  {stats?.recent_tasks?.map((t: any) => (
                    <tr key={t.id} className="hover:bg-[#111827]/40 transition-colors">
                      <td className="py-3 font-medium text-slate-200">{t.title}</td>
                      <td className="py-3 font-mono text-[11px] text-[#00D2FF]">
                        {t.agent_id}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            t.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : t.status === "in_progress"
                              ? "bg-[#0066FF]/10 text-[#00D2FF] border border-[#0066FF]/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-slate-400 text-[11px]">
                        ${(t.cost_usd || 0).toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Live Event Stream & Quick Actions */}
        <div className="space-y-6">
          {/* Live Activity Feed */}
          <div className="bg-[#0B0F17] border border-[#1F293D] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-sm font-bold text-white">Live Activity Stream</h2>
              </div>
              <Link href="/activity" className="text-xs text-[#00D2FF] hover:underline">
                View All
              </Link>
            </div>

            {loading ? (
              <div className="text-xs text-slate-500 py-6 text-center">Loading activity...</div>
            ) : stats?.recent_activity?.length === 0 ? (
              <div className="text-xs text-slate-500 py-8 text-center">
                No recent events recorded.
              </div>
            ) : (
              <div className="space-y-3.5">
                {stats?.recent_activity?.slice(0, 4).map((ev: any) => (
                  <div key={ev.id} className="text-xs p-3 rounded-lg bg-[#111827] border border-[#1F293D]/60 space-y-1">
                    <div className="font-medium text-slate-200 line-clamp-2">{ev.message}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {new Date(ev.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Division Directory */}
          <div className="bg-[#0B0F17] border border-[#1F293D] rounded-xl p-6">
            <h2 className="text-sm font-bold text-white mb-3">Core Business Divisions</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded bg-[#111827]">
                <span className="text-slate-300 font-medium">IBS Executive Management</span>
                <span className="text-blue-400 font-mono">4 Agents</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[#111827]">
                <span className="text-slate-300 font-medium">IBS Technology</span>
                <span className="text-cyan-400 font-mono">12 Agents</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[#111827]">
                <span className="text-slate-300 font-medium">IBS Digital Marketing</span>
                <span className="text-emerald-400 font-mono">7 Agents</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[#111827]">
                <span className="text-slate-300 font-medium">IBS Creative Studio</span>
                <span className="text-amber-400 font-mono">3 Agents</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[#111827]">
                <span className="text-slate-300 font-medium">IBS Sales & Client Services</span>
                <span className="text-purple-400 font-mono">4 Agents</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
