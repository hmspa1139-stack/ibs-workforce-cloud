import { NextResponse } from "next/server";
import { DEPARTMENTS, AGENTS_REGISTRY } from "@/lib/agents-registry";

export async function GET() {
  const result = DEPARTMENTS.map((dept) => {
    const agents = AGENTS_REGISTRY.filter((a) => a.department === dept.id);
    return {
      ...dept,
      agent_count: agents.length,
      agents: agents.map((a) => ({
        agent_id: a.agent_id,
        name: a.name,
        designation: a.designation,
        color: a.color,
        is_enabled: a.is_enabled,
      })),
    };
  });

  return NextResponse.json(result);
}
