import { NextRequest, NextResponse } from "next/server";
import { cloudStore } from "@/lib/data-store";

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } | Promise<{ projectId: string }> }
) {
  const { projectId } = await Promise.resolve(params);
  const project = cloudStore.projects.find((p) => p.id === projectId);

  if (!project) {
    return NextResponse.json({ detail: "Project not found" }, { status: 404 });
  }

  const pTasks = cloudStore.tasks.filter((t) => t.project_id === projectId);
  const enriched = {
    ...project,
    total_tasks: pTasks.length,
    completed_tasks: pTasks.filter((t) => t.status === "completed").length,
    tasks: pTasks,
  };

  return NextResponse.json(enriched);
}
