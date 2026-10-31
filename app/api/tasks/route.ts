import { NextRequest, NextResponse } from "next/server";
import { cloudStore } from "@/lib/data-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("project_id");
  const agentId = searchParams.get("agent_id");
  const statusFilter = searchParams.get("status_filter");
  const priorityFilter = searchParams.get("priority_filter");

  let tasks = [...cloudStore.tasks];

  if (projectId) {
    tasks = tasks.filter((t) => t.project_id === projectId);
  }

  if (agentId) {
    tasks = tasks.filter((t) => t.assigned_agent_id === agentId);
  }

  if (statusFilter) {
    tasks = tasks.filter((t) => t.status === statusFilter);
  }

  if (priorityFilter && priorityFilter !== "all") {
    tasks = tasks.filter((t) => t.priority === priorityFilter);
  }

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { project_id, assigned_agent_id, title, description, priority, expected_output, dependencies } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ detail: "Task title is required" }, { status: 400 });
    }

    const newTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      project_id: project_id || "proj_001",
      assigned_agent_id: assigned_agent_id || "agent_ceo",
      title: title.trim(),
      description: description || "",
      status: "backlog",
      priority: priority || "medium",
      expected_output: expected_output || "",
      execution_cost_usd: 0,
      tokens_used: 0,
      duration_seconds: 0,
      dependencies: dependencies || [],
      created_at: new Date().toISOString(),
    };

    cloudStore.tasks.unshift(newTask);

    cloudStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: "task_created",
      entity_type: "task",
      entity_id: newTask.id,
      user_id: "owner",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(newTask);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to create task" }, { status: 500 });
  }
}
