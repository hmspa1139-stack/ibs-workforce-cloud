import { NextResponse } from "next/server";
import { cloudStore } from "@/lib/data-store";
import { VercelWorkflowEngine } from "@/lib/workflow-engine";
import { VercelAIEngine } from "@/lib/ai-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, project_id, plan_only, cost_limit_usd } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ detail: "Message is required" }, { status: 400 });
    }

    const userMsgId = `msg_user_${Date.now()}`;
    cloudStore.ceoMessages.push({
      id: userMsgId,
      sender_type: "user",
      sender_id: "owner",
      content: message,
      created_at: new Date().toISOString(),
      metadata: { project_id, plan_only, cost_limit_usd },
    });

    // 1. Synthesize multi-agent plan
    const plan = VercelWorkflowEngine.createPlan(message);

    // 2. Either find existing project or provision new initiative
    let targetProjectId = project_id;
    if (!targetProjectId) {
      targetProjectId = `proj_${Date.now().toString(36)}`;
      cloudStore.projects.unshift({
        id: targetProjectId,
        name: plan.projectName,
        slug: plan.projectName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        description: plan.summary,
        status: "active",
        priority: "high",
        budget_limit_usd: costLimitToNumber(cost_limit_usd) || 500,
        total_spend_usd: 0,
        completed_tasks: 0,
        total_tasks: plan.tasks.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // 3. Register tasks in cloudStore if not already there
    for (const t of plan.tasks) {
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      cloudStore.tasks.unshift({
        id: taskId,
        project_id: targetProjectId,
        project_name: plan.projectName,
        assigned_agent_id: t.agentId,
        title: t.title,
        description: t.description,
        status: "planning",
        priority: t.priority,
        expected_output: t.expectedOutput,
        execution_cost_usd: 0,
        tokens_used: 0,
        duration_seconds: 0,
        dependencies: t.dependencies,
        created_at: new Date().toISOString(),
      });
    }

    // 4. Generate AI CEO response using VercelAIEngine (Google Gemini primary)
    let ceoReplyText = "";
    try {
      const aiResponse = await VercelAIEngine.executeSpecialist({
        agentId: "agent_ceo",
        userPrompt: `Owner Directive: "${message}"\n\nProposed Plan:\n- Project: ${plan.projectName}\n- Summary: ${plan.summary}\n- Tasks count: ${plan.tasks.length} specialists queued.\n\nFormulate your executive response to the Owner. State clearly how you will orchestrate the team, which specialists are assigned, and request approval or confirm execution.`,
        projectContext: `Project: ${plan.projectName}`,
        provider: cloudStore.settings.default_ai_provider || process.env.ACTIVE_AI_PROVIDER || "gemini",
      });
      ceoReplyText = aiResponse.text;
    } catch (e) {
      ceoReplyText = `Acknowledged, Founder. I have analyzed your directive: "${message}".\n\n### Strategic Execution Blueprint:
- **Project Initiative**: ${plan.projectName}
- **Executive Summary**: ${plan.summary}
- **Specialists Mobilized**: ${plan.tasks.map((t) => t.agentId.replace("agent_", "").toUpperCase()).join(", ")}

The execution DAG has been generated with strict approval gates enabled for ad spend and external communications. Deliverables will stream into the Workspace and File Manager.`;
    }

    const ceoMsgId = `msg_ceo_${Date.now()}`;
    cloudStore.ceoMessages.push({
      id: ceoMsgId,
      sender_type: "agent",
      sender_id: "agent_ceo",
      content: ceoReplyText,
      created_at: new Date().toISOString(),
      metadata: { plan, project_id: targetProjectId },
    });

    cloudStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: "ceo_directive_orchestrated",
      entity_type: "directive",
      entity_id: targetProjectId,
      user_id: "owner",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      reply: ceoReplyText,
      plan: {
        projectName: plan.projectName,
        summary: plan.summary,
        tasks: plan.tasks,
      },
      project_id: targetProjectId,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to process CEO directive" }, { status: 500 });
  }
}

function costLimitToNumber(val: any): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") return parseFloat(val) || 500;
  return 500;
}
