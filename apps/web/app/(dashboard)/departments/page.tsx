"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Code2,
  TrendingUp,
  Palette,
  Users,
  Bot,
  ArrowRight,
  Kanban,
  CheckCircle2,
  Crown
} from "lucide-react";
import { listDepartments, listAgents } from "@/lib/api";

const DEPT_ICONS: Record<string, any> = {
  executive: Crown,
  tech: Code2,
  marketing: TrendingUp,
  creative: Palette,
  sales: Users,
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dList, aList] = await Promise.all([listDepartments(), listAgents()]);
        setDepartments(dList);
        setAgents(aList);
      } catch (err) {
        console.error("Failed to load departments:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-[#00D2FF]" />
          Corporate Divisions (5 Core Departments)
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Organizational structure of IBS Digital staffing 30 specialized AI agents.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-slate-500">Loading department structures...</div>
      ) : (
        <div className="space-y-6">
          {departments.map((dept) => {
            const Icon = DEPT_ICONS[dept.code] || Briefcase;
            const deptAgents = agents.filter((a) => a.department_id === dept.id || a.department_id === dept.code);

            return (
              <div
                key={dept.id}
                className="bg-[#0B0F17] border border-[#1F293D] rounded-xl p-6 shadow-xl"
              >
                {/* Department Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#1F293D]">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-glow-blue"
                      style={{ backgroundColor: dept.color }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-white">{dept.name}</h2>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-[#111827] text-slate-400 border border-[#1F293D]">
                          {dept.code.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 max-w-2xl">{dept.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                    <div className="bg-[#111827] px-3 py-1.5 rounded-lg border border-[#1F293D]">
                      <span className="text-slate-400">Roster: </span>
                      <span className="font-bold text-white">{deptAgents.length} Agents</span>
                    </div>
                    <div className="bg-[#111827] px-3 py-1.5 rounded-lg border border-[#1F293D]">
                      <span className="text-slate-400">Active Tasks: </span>
                      <span className="font-bold text-[#00D2FF]">{dept.active_tasks_count}</span>
                    </div>
                  </div>
                </div>

                {/* Agent Roster Grid */}
                <div className="pt-5">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Assigned AI Specialists
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {deptAgents.map((ag) => (
                      <div
                        key={ag.agent_id}
                        className="p-3 rounded-lg bg-[#111827] border border-[#1F293D] flex items-center gap-2.5 hover:border-[#0066FF]/40 transition-colors"
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 text-xs font-bold"
                          style={{ backgroundColor: ag.color || dept.color }}
                        >
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white truncate">{ag.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{ag.designation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
