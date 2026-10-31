import { NextRequest, NextResponse } from "next/server";
import { cloudStore } from "@/lib/data-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status_filter");

  let approvals = [...cloudStore.approvals];

  if (statusFilter && statusFilter !== "all") {
    approvals = approvals.filter((a) => a.status === statusFilter);
  }

  return NextResponse.json(approvals);
}
