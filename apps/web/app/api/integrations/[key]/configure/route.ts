import { NextRequest, NextResponse } from "next/server";
import { cloudStore } from "@/lib/data-store";

export async function POST(
  req: NextRequest,
  { params }: { params: { key: string } | Promise<{ key: string }> }
) {
  try {
    const { key } = await Promise.resolve(params);
    const integration = cloudStore.integrations.find((i) => i.provider_key === key);

    if (!integration) {
      return NextResponse.json({ detail: "Integration not found" }, { status: 404 });
    }

    const body = await req.json();
    if (typeof body.is_enabled === "boolean") integration.is_enabled = body.is_enabled;
    if (body.credentials) {
      integration.is_connected = true;
      integration.status_message = "Connected and active";
    }

    cloudStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: "integration_configured",
      entity_type: "integration",
      entity_id: key,
      user_id: "owner",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(integration);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to configure integration" }, { status: 500 });
  }
}
