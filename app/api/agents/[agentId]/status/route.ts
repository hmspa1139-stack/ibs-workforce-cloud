import { NextRequest, NextResponse } from "next/server";
import { AGENTS_REGISTRY } from "@/lib/agents-registry";
import { cloudStore } from "@/lib/data-store";

export async function PATCH(
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
    if (typeof body.is_enabled === "boolean") {
      agent.is_enabled = body.is_enabled;
      agent.status = body.is_enabled ? "idle" : "disabled";
    }
    if (body.status) {
      agent.status = body.status;
    }

    cloudStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: "agent_status_toggled",
      entity_type: "agent",
      entity_id: agentId,
      user_id: "owner",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(agent);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to update agent status" }, { status: 500 });
  }
}
