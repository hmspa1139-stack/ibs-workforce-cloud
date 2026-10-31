import { NextRequest } from "next/server";
import { cloudStore } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial snapshot events
      const initialEvents = [
        {
          id: `evt_init_1`,
          event_type: "agent_activated",
          agent_id: "agent_ceo",
          message: "AI CEO Alex Vance initialized system orchestrator on Vercel Cloud runtime.",
          timestamp: new Date().toISOString(),
        },
        {
          id: `evt_init_2`,
          event_type: "security_verified",
          agent_id: "agent_cybersecurity",
          message: "Security gatekeeper active. External write operations and ad budgets strictly locked.",
          timestamp: new Date().toISOString(),
        },
        ...cloudStore.auditLogs.slice(0, 5).map((log, idx) => ({
          id: `evt_audit_${idx}`,
          event_type: log.action,
          agent_id: log.entity_type,
          message: `Audit Event: ${log.action} on entity ${log.entity_id}`,
          timestamp: log.created_at,
        })),
      ];

      for (const evt of initialEvents) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(evt)}\n\n`));
      }

      // Interval ping to keep connection alive
      const interval = setInterval(() => {
        try {
          const pingEvent = {
            id: `evt_heartbeat_${Date.now()}`,
            event_type: "heartbeat",
            agent_id: "agent_devops",
            message: "Cloud cluster health optimal. 30 AI specialists idle and ready.",
            timestamp: new Date().toISOString(),
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(pingEvent)}\n\n`));
        } catch (e) {
          clearInterval(interval);
        }
      }, 10000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
