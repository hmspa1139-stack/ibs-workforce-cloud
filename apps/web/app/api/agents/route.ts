import { NextRequest, NextResponse } from "next/server";
import { AGENTS_REGISTRY } from "@/lib/agents-registry";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const departmentId = searchParams.get("department_id");
  const statusFilter = searchParams.get("status_filter");

  let agents = [...AGENTS_REGISTRY];

  if (departmentId) {
    agents = agents.filter((a) => a.department === departmentId);
  }

  if (statusFilter === "active" || statusFilter === "enabled") {
    agents = agents.filter((a) => a.is_enabled);
  } else if (statusFilter === "disabled") {
    agents = agents.filter((a) => !a.is_enabled);
  }

  return NextResponse.json(agents);
}
