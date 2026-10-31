import { NextRequest, NextResponse } from "next/server";
import { cloudStore } from "@/lib/data-store";

export async function POST(
  req: NextRequest,
  { params }: { params: { approvalId: string } | Promise<{ approvalId: string }> }
) {
  try {
    const { approvalId } = await Promise.resolve(params);
    const approval = cloudStore.approvals.find((a) => a.id === approvalId);

    if (!approval) {
      return NextResponse.json({ detail: "Approval not found" }, { status: 404 });
    }

    const body = await req.json();
    const { decision, reason } = body;

    if (decision !== "approve" && decision !== "reject") {
      return NextResponse.json({ detail: "Decision must be 'approve' or 'reject'" }, { status: 400 });
    }

    approval.status = decision === "approve" ? "approved" : "rejected";
    approval.decided_at = new Date().toISOString();
    if (reason) approval.rejection_reason = reason;

    cloudStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: decision === "approve" ? "approval_granted" : "approval_rejected",
      entity_type: "approval",
      entity_id: approvalId,
      user_id: "owner",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(approval);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to submit approval decision" }, { status: 500 });
  }
}
