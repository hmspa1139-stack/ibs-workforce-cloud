import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.models.deliverable import Deliverable
from app.models.agent import AgentProfile
from app.schemas.common import DeliverableResponse
from app.services.file_workspace import WorkspaceFileSystem

router = APIRouter(prefix="/files", tags=["Files & Deliverables"])

@router.get("", response_model=List[DeliverableResponse])
async def list_deliverables(
    project_id: Optional[str] = None,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Lists agency deliverables and generated files across projects."""
    query = select(Deliverable).where(Deliverable.is_deleted == False)
    if project_id:
        query = query.where(Deliverable.project_id == project_id)
    if category:
        query = query.where(Deliverable.file_category == category)

    query = query.order_by(desc(Deliverable.created_at))
    records = (await db.execute(query)).scalars().all()

    results = []
    for d in records:
        a_res = await db.execute(select(AgentProfile).where(AgentProfile.agent_id == d.created_by_agent_id))
        agent = a_res.scalar_one_or_none()

        results.append(DeliverableResponse(
            id=d.id,
            project_id=d.project_id,
            task_id=d.task_id,
            created_by_agent_id=d.created_by_agent_id,
            created_by_agent_name=agent.name if agent else None,
            file_name=d.file_name,
            file_path=d.file_path,
            file_size_bytes=d.file_size_bytes,
            mime_type=d.mime_type,
            file_category=d.file_category,
            version=d.version,
            download_url=f"/api/v1/files/{d.id}/download",
            created_at=d.created_at
        ))
    return results

@router.get("/{deliverable_id}/download")
async def download_deliverable(deliverable_id: str, db: AsyncSession = Depends(get_db)):
    """Downloads a single deliverable artifact from the project workspace."""
    res = await db.execute(select(Deliverable).where(Deliverable.id == deliverable_id))
    deliv = res.scalar_one_or_none()
    if not deliv:
        raise HTTPException(status_code=404, detail="Deliverable not found.")

    fs = WorkspaceFileSystem(deliv.project_id)
    abs_path = fs._resolve_safe_path(deliv.file_path)

    if not os.path.exists(abs_path):
        raise HTTPException(status_code=404, detail="File does not exist on disk.")

    return FileResponse(abs_path, filename=deliv.file_name, media_type=deliv.mime_type)

@router.get("/{deliverable_id}/content")
async def view_deliverable_content(deliverable_id: str, db: AsyncSession = Depends(get_db)):
    """Reads the raw text content of a deliverable file for live code preview."""
    res = await db.execute(select(Deliverable).where(Deliverable.id == deliverable_id))
    deliv = res.scalar_one_or_none()
    if not deliv:
        raise HTTPException(status_code=404, detail="Deliverable not found.")

    fs = WorkspaceFileSystem(deliv.project_id)
    content = fs.read_file(deliv.file_path)
    return {"id": deliv.id, "file_name": deliv.file_name, "content": content}
