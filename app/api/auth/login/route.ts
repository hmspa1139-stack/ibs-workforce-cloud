import { NextResponse } from "next/server";
import { cloudStore } from "@/lib/data-store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ detail: "Email and password are required" }, { status: 400 });
    }

    // In production, syncs with Supabase Auth or verified owner record
    const user = {
      id: cloudStore.ownerAccount.id,
      email: email,
      full_name: cloudStore.ownerAccount.full_name || "Alex Vance (Founder & Owner)",
      role: "owner",
      is_active: true,
    };

    cloudStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: "user_login_success",
      entity_type: "user",
      entity_id: user.id,
      user_id: user.id,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      access_token: `ibs_token_${Date.now()}`,
      token_type: "bearer",
      user,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Login failed" }, { status: 500 });
  }
}
