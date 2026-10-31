"use client";

import { useEffect, useState } from "react";
import {
  Coins,
  DollarSign,
  Cpu,
  Sliders,
  BarChart2,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Save
} from "lucide-react";
import { getOverviewStats, getPerformanceReports, getSettings, updateSettings } from "@/lib/api";

export default function UsageCostsPage() {
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<any>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  // Limit controls
  const [costPerTask, setCostPerTask] = useState("5.00");
  const [dailyBudget, setDailyBudget] = useState("100.00");
  const [monthlyBudget, setMonthlyBudget] = useState("2000.00");

  useEffect(() => {
    async function loadData() {
      try {
        const [st, rep, setts] = await Promise.all([
          getOverviewStats(),
          getPerformanceReports(),
          getSettings(),
        ]);
        setStats(st);
        setReports(rep);
        setSettings(setts.settings || {});
        if (setts.settings?.cost_limit_per_task) setCostPerTask(setts.settings.cost_limit_per_task);
        if (setts.settings?.daily_budget_limit_usd) setDailyBudget(setts.settings.daily_budget_limit_usd);
      } catch (err) {
        console.error("Failed to load usage data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await updateSettings({
        cost_limit_per_task: costPerTask,
        daily_budget_limit_usd: dailyBudget,
        monthly_budget_limit_usd: monthlyBudget,
      });
      alert("Spending limits successfully updated.");
    } catch (err: any) {
      alert(`Error saving limits: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Coins className="w-5 h-5 text-purple-400" />
          AI Token Usage & Cost Management
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time tracking of token consumption, estimated provider costs, and configurable execution safeguards.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#0B0F17] border border-[#1F293D] rounded-xl p-5 card-hover">
          <div className="text-xs text-slate-400 mb-1">Today's Token Volume</div>
          <div className="text-2xl font-bold text-white font-mono mb-1">
            {loading ? "..." : (stats?.daily_ai_usage_tokens || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-[#00D2FF]">Across Active Task DAGs</div>
        </div>

        <div className="bg-[#0B0F17] border border-[#1F293D] rounded-xl p-5 card-hover">
          <div className="text-xs text-slate-400 mb-1">Monthly AI Expenditure</div>
          <div className="text-2xl font-bold text-white font-mono mb-1">
            ${loading ? "..." : (stats?.monthly_ai_cost_usd || 0).toFixed(4)}
          </div>
          <div className="text-[11px] text-emerald-400">Within Configured Cap ($2000/mo)</div>
        </div>

        <div className="bg-[#0B0F17] border border-[#1F293D] rounded-xl p-5 card-hover">
          <div className="text-xs text-slate-400 mb-1">Cumulative Project Spend</div>
          <div className="text-2xl font-bold text-white font-mono mb-1">
            ${loading ? "..." : (stats?.total_spend_usd || 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400">Total Billed Client Operations</div>
        </div>
      </div>

      {/* Two Column Layout: Limits Form & Agent Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Limits Configuration */}
        <div className="bg-[#0B0F17] border border-[#1F293D] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#00D2FF]" />
            <h2 className="text-sm font-bold text-white">Configurable Spending Safeguards</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The execution engine halts autonomous runs when these budget limits are reached to prevent runaway costs.
          </p>

          <form onSubmit={handleSaveLimits} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Max Cost Per Task ($)</label>
              <input
                type="number"
                step="0.5"
                value={costPerTask}
                onChange={(e) => setCostPerTask(e.target.value)}
                className="w-full bg-[#111827] border border-[#1F293D] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#0066FF]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Max Daily Agency Budget ($)</label>
              <input
                type="number"
                step="5.0"
                value={dailyBudget}
                onChange={(e) => setDailyBudget(e.target.value)}
                className="w-full bg-[#111827] border border-[#1F293D] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#0066FF]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Max Monthly Budget ($)</label>
              <input
                type="number"
                step="50.0"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="w-full bg-[#111827] border border-[#1F293D] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#0066FF]"
              />
            </div>

            <button
              type="submit"
              disabled={saveLoading}
              className="px-4 py-2 rounded-lg bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold flex items-center gap-2 shadow-glow-blue transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saveLoading ? "Updating..." : "Save Safeguards"}</span>
            </button>
          </form>
        </div>

        {/* Top Consuming Agents */}
        <div className="bg-[#0B0F17] border border-[#1F293D] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Top Consuming Specialists</h2>
          </div>
          <p className="text-xs text-slate-400">
            Agents ranked by total tokens consumed and recorded execution cost.
          </p>

          <div className="space-y-3">
            {reports?.top_performing_agents?.map((ag: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#111827] border border-[#1F293D] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{ag.name}</div>
                  <div className="text-[11px] font-mono text-[#00D2FF]">{ag.agent_id}</div>
                </div>
                <div className="text-right font-mono text-[11px]">
                  <div className="text-white font-bold">${(ag.cost_usd || 0).toFixed(4)}</div>
                  <div className="text-slate-500">{(ag.tokens || 0).toLocaleString()} tok</div>
                </div>
              </div>
            ))}

            {(!reports?.top_performing_agents || reports.top_performing_agents.length === 0) && (
              <div className="text-xs text-slate-500 text-center py-8">
                Usage metrics populate after agent task runs.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
