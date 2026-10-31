import { NextResponse } from "next/server";
import { cloudStore } from "@/lib/data-store";
import { AGENTS_REGISTRY, DEPARTMENTS } from "@/lib/agents-registry";

export async function GET() {
  const activeAgents = AGENTS_REGISTRY.filter((a) => a.is_enabled);
  const runningProjects = cloudStore.projects.filter((p) => p.status === "active");
  const pendingApprovals = cloudStore.approvals.filter((a) => a.status === "pending");
  const completedTasks = cloudStore.tasks.filter((t) => t.status === "completed");
  const activeTasks = cloudStore.tasks.filter((t) => ["in_progress", "assigned", "planning"].includes(t.status));

  const totalSpend = cloudStore.projects.reduce((acc, p) => acc + p.total_spend_usd, 0);

  const divisionStats = DEPARTMENTS.map((dept) => {
    const agentsInDept = AGENTS_REGISTRY.filter((a) => a.department === dept.id);
    return {
      department_id: dept.id,
      name: dept.name,
      agent_count: agentsInDept.length,
      active_count: agentsInDept.filter((a) => a.is_enabled).length,
    };
  });

  return NextResponse.json({
    active_agents_count: activeAgents.length,
    total_agents_count: AGENTS_REGISTRY.length,
    running_projects_count: runningProjects.length,
    pending_approvals_count: pendingApprovals.length,
    completed_tasks_count: completedTasks.length,
    active_tasks_count: activeTasks.length,
    total_spend_usd: Number(totalSpend.toFixed(2)),
    budget_cap_usd: 2000.0,
    daily_budget_limit_usd: Number(cloudStore.settings.daily_budget_limit_usd || 100),
    active_model: cloudStore.settings.default_model || "gemini-flash-lite-latest",
    recent_tasks: cloudStore.tasks.slice(0, 6),
    recent_approvals: pendingApprovals.slice(0, 4),
    agent_division_stats: divisionStats,
  });
}
