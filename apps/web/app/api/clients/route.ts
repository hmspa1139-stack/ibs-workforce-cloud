import { NextRequest, NextResponse } from "next/server";
import { cloudStore } from "@/lib/data-store";

export async function GET() {
  return NextResponse.json(cloudStore.clients);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company_name, contact_name, email, phone, website, industry, address, notes } = body;

    if (!company_name || !company_name.trim()) {
      return NextResponse.json({ detail: "Company name is required" }, { status: 400 });
    }

    const newClient = {
      id: `cli_${Date.now().toString(36)}`,
      company_name: company_name.trim(),
      contact_name: contact_name || "Primary Contact",
      email: email || "contact@client.com",
      phone: phone || "",
      website: website || "",
      industry: industry || "Technology",
      address: address || "",
      status: "active",
      total_spend_usd: 0,
      notes: notes || "",
      created_at: new Date().toISOString(),
      projects_count: 0,
    };

    cloudStore.clients.unshift(newClient);

    cloudStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: "client_onboarded",
      entity_type: "client",
      entity_id: newClient.id,
      user_id: "owner",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(newClient);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to create client" }, { status: 500 });
  }
}
