import { NextRequest, NextResponse } from "next/server";
import { cloudStore } from "@/lib/data-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status_filter");

  let projects = [...cloudStore.projects];

  if (statusFilter) {
    projects = projects.filter((p) => p.status === statusFilter);
  }

  // Update dynamic counts from tasks
  projects = projects.map((p) => {
    const pTasks = cloudStore.tasks.filter((t) => t.project_id === p.id);
    return {
      ...p,
      total_tasks: pTasks.length || p.total_tasks,
      completed_tasks: pTasks.filter((t) => t.status === "completed").length,
    };
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, priority, budget_limit_usd } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ detail: "Project name is required" }, { status: 400 });
    }

    const newProject = {
      id: `proj_${Date.now().toString(36)}`,
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/[^a-z0-9]/g, "-"),
      description: description || "",
      status: "active",
      priority: priority || "high",
      budget_limit_usd: Number(budget_limit_usd) || 500,
      total_spend_usd: 0,
      completed_tasks: 0,
      total_tasks: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    cloudStore.projects.unshift(newProject);

    cloudStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: "project_created",
      entity_type: "project",
      entity_id: newProject.id,
      user_id: "owner",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(newProject);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to create project" }, { status: 500 });
  }
}
