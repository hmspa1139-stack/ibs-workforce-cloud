import { NextResponse } from "next/server";
import { AGENTS_REGISTRY } from "@/lib/agents-registry";
import { cloudStore } from "@/lib/data-store";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    platform: "Vercel Cloud Native",
    agents_registered: AGENTS_REGISTRY.length,
    active_agents: AGENTS_REGISTRY.filter((a) => a.is_enabled).length,
    projects_count: cloudStore.projects.length,
    tasks_count: cloudStore.tasks.length,
    primary_ai_model: cloudStore.settings.default_model || "gemini-flash-lite-latest",
  });
}
