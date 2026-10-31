import { NextRequest, NextResponse } from "next/server";
import { cloudStore } from "@/lib/data-store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { taskId: string } | Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await Promise.resolve(params);
    const taskIndex = cloudStore.tasks.findIndex((t) => t.id === taskId);

    if (taskIndex === -1) {
      return NextResponse.json({ detail: "Task not found" }, { status: 404 });
    }

    const body = await req.json();
    const task = cloudStore.tasks[taskIndex];

    if (body.status) task.status = body.status;
    if (body.priority) task.priority = body.priority;
    if (body.assigned_agent_id) task.assigned_agent_id = body.assigned_agent_id;
    if (body.actual_output) task.actual_output = body.actual_output;
    if (body.expected_output) task.expected_output = body.expected_output;
    if (typeof body.execution_cost_usd === "number") task.execution_cost_usd = body.execution_cost_usd;
    if (typeof body.tokens_used === "number") task.tokens_used = body.tokens_used;
    if (typeof body.duration_seconds === "number") task.duration_seconds = body.duration_seconds;

    if (task.status === "completed" && !task.completed_at) {
      task.completed_at = new Date().toISOString();
    }

    cloudStore.tasks[taskIndex] = task;

    cloudStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: "task_updated",
      entity_type: "task",
      entity_id: taskId,
      user_id: "owner",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(task);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to update task" }, { status: 500 });
  }
}
