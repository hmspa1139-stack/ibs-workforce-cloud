import { NextRequest, NextResponse } from "next/server";
import { cloudStore } from "@/lib/data-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  let files = [...cloudStore.deliverables];

  if (category && category !== "all") {
    files = files.filter((f) => f.file_category === category);
  }

  return NextResponse.json(files);
}
