import { NextRequest, NextResponse } from "next/server";
import { AGENTS_REGISTRY } from "@/lib/agents-registry";
import { VercelAIEngine } from "@/lib/ai-engine";
import { cloudStore } from "@/lib/data-store";

export async function POST(
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
    const prompt = body.prompt;

    if (!prompt) {
      return NextResponse.json({ detail: "Prompt is required" }, { status: 400 });
    }

    const startTime = Date.now();
    const result = await VercelAIEngine.executeSpecialist({
      agentId: agent.agent_id,
      userPrompt: prompt,
      projectContext: "Interactive Sandbox Test Runner in Vercel Cloud",
      provider: cloudStore.settings.default_ai_provider || process.env.ACTIVE_AI_PROVIDER || "gemini",
    });

    const duration = Number(((Date.now() - startTime) / 1000).toFixed(2));

    cloudStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: "agent_sandbox_tested",
      entity_type: "agent",
      entity_id: agentId,
      user_id: "owner",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      status: "success",
      response: result.text,
      cost_usd: result.costUsd,
      tokens_used: result.totalTokens,
      duration_seconds: duration,
      provider: result.providerUsed,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Test execution failed" }, { status: 500 });
  }
}
