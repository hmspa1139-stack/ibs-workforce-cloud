import { NextResponse } from "next/server";
import { cloudStore } from "@/lib/data-store";

export async function GET() {
  return NextResponse.json({
    is_initialized: true,
    owner_exists: Boolean(cloudStore.ownerAccount?.email),
  });
}
