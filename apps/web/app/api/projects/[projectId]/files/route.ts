import { NextRequest, NextResponse } from "next/server";
import { cloudStore } from "@/lib/data-store";

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } | Promise<{ projectId: string }> }
) {
  const { projectId } = await Promise.resolve(params);
  const deliverables = cloudStore.deliverables.filter((d) => d.project_id === projectId);

  return NextResponse.json({
    project_id: projectId,
    files: deliverables.map((d) => ({
      name: d.file_name,
      path: d.file_path,
      size_bytes: d.file_size_bytes,
      mime_type: d.mime_type,
      category: d.file_category,
      created_at: d.created_at,
    })),
  });
}
