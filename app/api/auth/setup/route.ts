import { NextResponse } from "next/server";
import { cloudStore } from "@/lib/data-store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { full_name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ detail: "Email and password are required" }, { status: 400 });
    }

    cloudStore.ownerAccount = {
      id: "user_owner_001",
      email,
      full_name: full_name || "Alex Vance (Founder & Owner)",
      role: "owner",
      is_active: true,
    };

    cloudStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: "owner_setup_completed",
      entity_type: "user",
      entity_id: cloudStore.ownerAccount.id,
      user_id: cloudStore.ownerAccount.id,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      access_token: `ibs_token_${Date.now()}`,
      token_type: "bearer",
      user: cloudStore.ownerAccount,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to initialize owner account" }, { status: 500 });
  }
}
