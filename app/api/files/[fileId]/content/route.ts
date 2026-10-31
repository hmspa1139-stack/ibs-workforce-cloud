import { NextRequest, NextResponse } from "next/server";
import { cloudStore } from "@/lib/data-store";

export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } | Promise<{ fileId: string }> }
) {
  const { fileId } = await Promise.resolve(params);
  const file = cloudStore.deliverables.find((f) => f.id === fileId);

  if (!file) {
    return NextResponse.json({ detail: "File not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: file.id,
    file_name: file.file_name,
    content: file.raw_content,
  });
}
