import { NextRequest, NextResponse } from "next/server";
import { AGENTS_REGISTRY } from "@/lib/agents-registry";

export async function GET(
  req: NextRequest,
  { params }: { params: { agentId: string } | Promise<{ agentId: string }> }
) {
  const { agentId } = await Promise.resolve(params);
  const agent = AGENTS_REGISTRY.find((a) => a.agent_id === agentId);

  if (!agent) {
    return NextResponse.json({ detail: "Agent not found" }, { status: 404 });
  }

  return NextResponse.json(agent);
}
