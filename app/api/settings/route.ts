import { NextRequest, NextResponse } from "next/server";
import { cloudStore } from "@/lib/data-store";

export async function GET() {
  return NextResponse.json({ settings: cloudStore.settings });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const newSettings = body.settings || {};

    cloudStore.settings = {
      ...cloudStore.settings,
      ...newSettings,
    };

    cloudStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: "settings_updated",
      entity_type: "settings",
      entity_id: "global",
      user_id: "owner",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ settings: cloudStore.settings });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to update settings" }, { status: 500 });
  }
}
