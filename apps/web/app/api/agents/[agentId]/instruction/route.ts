import { NextRequest, NextResponse } from "next/server";
import { AGENTS_REGISTRY } from "@/lib/agents-registry";
import { cloudStore } from "@/lib/data-store";

export async function GET(
  req: NextRequest,
  { params }: { params: { agentId: string } | Promise<{ agentId: string }> }
) {
  const { agentId } = await Promise.resolve(params);
  const agent = AGENTS_REGISTRY.find((a) => a.agent_id === agentId);

  if (!agent) {
    return NextResponse.json({ detail: "Agent not found" }, { status: 404 });
  }

  return NextResponse.json({
    agent_id: agent.agent_id,
    system_prompt: agent.system_prompt,
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { agentId: string } | Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await Promise.resolve(params);
    const agent = AGENTS_REGISTRY.find((a) => a.agent_id === agentId);

    if (!agent) {
      return NextResponse.json({ detail: "Agent not found" }, { status: 404 });
    }

    const body = await req.json();
    const { system_prompt } = body;

    if (!system_prompt) {
      return NextResponse.json({ detail: "system_prompt is required" }, { status: 400 });
    }

    agent.system_prompt = system_prompt;

    cloudStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: "agent_instruction_updated",
      entity_type: "agent",
      entity_id: agentId,
      user_id: "owner",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      agent_id: agent.agent_id,
      system_prompt: agent.system_prompt,
      message: "System instructions updated successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to update instruction" }, { status: 500 });
  }
}
