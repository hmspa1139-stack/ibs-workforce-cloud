import { NextRequest, NextResponse } from "next/server";
import { cloudStore } from "@/lib/data-store";

export async function GET(
  req: NextRequest,
  { params }: { params: { agentId: string } | Promise<{ agentId: string }> }
) {
  const { agentId } = await Promise.resolve(params);
  const runs = cloudStore.tasks.filter((t) => t.assigned_agent_id === agentId);
  return NextResponse.json(runs);
}
