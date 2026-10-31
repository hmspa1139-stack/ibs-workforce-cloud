import os
import re
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.project import Project
from app.models.task import Task
from app.models.client import Client
from app.models.workspace import Workspace
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.services.file_workspace import WorkspaceFileSystem

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
async def list_projects(
    status_filter: Optional[str] = None,
    client_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Lists projects with live counts of total and completed tasks."""
    query = select(Project).where(Project.is_deleted == False)
    if status_filter:
        query = query.where(Project.status == status_filter)
    if client_id:
        query = query.where(Project.client_id == client_id)

    query = query.order_by(desc(Project.created_at))
    projects = (await db.execute(query)).scalars().all()

    results = []
    for p in projects:
        # Task counts
        total_tasks = (await db.execute(select(func.count(Task.id)).where(Task.project_id == p.id))).scalar() or 0
        completed_tasks = (await db.execute(select(func.count(Task.id)).where(Task.project_id == p.id, Task.status == "completed"))).scalar() or 0

        client_name = None
        if p.client_id:
            c_res = await db.execute(select(Client).where(Client.id == p.client_id))
            c = c_res.scalar_one_or_none()
            if c:
                client_name = c.company_name

        results.append(ProjectResponse(
            id=p.id,
            workspace_id=p.workspace_id,
            client_id=p.client_id,
            client_name=client_name,
            name=p.name,
            slug=p.slug,
            description=p.description,
            status=p.status,
            priority=p.priority,
            budget_limit_usd=p.budget_limit_usd,
            total_spend_usd=p.total_spend_usd,
            deadline=p.deadline,
            workspace_path=p.workspace_path,
            created_at=p.created_at,
            updated_at=p.updated_at,
            total_tasks=total_tasks,
            completed_tasks=completed_tasks
        ))
    return results

@router.post("", response_model=ProjectResponse)
async def create_project(
    req: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    """Creates a project and provisions an isolated development workspace on disk."""
    ws_res = await db.execute(select(Workspace).limit(1))
    ws = ws_res.scalar_one_or_none()
    ws_id = ws.id if ws else "default_workspace"

    slug = re.sub(r"[^a-zA-Z0-9_-]", "-", req.name.lower()).strip("-")[:50]
    project = Project(
        workspace_id=ws_id,
        client_id=req.client_id,
        name=req.name.strip(),
        slug=slug,
        description=req.description,
        status="planning",
        priority=req.priority,
        budget_limit_usd=req.budget_limit_usd,
        deadline=req.deadline
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)

    # Provision isolated workspace directory
    fs = WorkspaceFileSystem(project.id)
    project.workspace_path = fs.root_path
    fs.write_file("README.md", f"# {project.name}\n\n{project.description or 'IBS AI Workforce Project Workspace'}\n")
    await db.commit()

    return ProjectResponse(
        id=project.id,
        workspace_id=project.workspace_id,
        client_id=project.client_id,
        name=project.name,
        slug=project.slug,
        description=project.description,
        status=project.status,
        priority=project.priority,
        budget_limit_usd=project.budget_limit_usd,
        total_spend_usd=project.total_spend_usd,
        deadline=project.deadline,
        workspace_path=project.workspace_path,
        created_at=project.created_at,
        updated_at=project.updated_at,
        total_tasks=0,
        completed_tasks=0
    )

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieves single project details."""
    res = await db.execute(select(Project).where(Project.id == project_id))
    p = res.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found.")

    total_tasks = (await db.execute(select(func.count(Task.id)).where(Task.project_id == p.id))).scalar() or 0
    completed_tasks = (await db.execute(select(func.count(Task.id)).where(Task.project_id == p.id, Task.status == "completed"))).scalar() or 0

    return ProjectResponse(
        id=p.id,
        workspace_id=p.workspace_id,
        client_id=p.client_id,
        name=p.name,
        slug=p.slug,
        description=p.description,
        status=p.status,
        priority=p.priority,
        budget_limit_usd=p.budget_limit_usd,
        total_spend_usd=p.total_spend_usd,
        deadline=p.deadline,
        workspace_path=p.workspace_path,
        created_at=p.created_at,
        updated_at=p.updated_at,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks
    )

@router.get("/{project_id}/files")
async def list_project_workspace_files(project_id: str, db: AsyncSession = Depends(get_db)):
    """Lists files inside the isolated project workspace."""
    res = await db.execute(select(Project).where(Project.id == project_id))
    if not res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found.")

    fs = WorkspaceFileSystem(project_id)
    return {"project_id": project_id, "files": fs.list_files()}

@router.get("/{project_id}/export")
async def export_project_zip(project_id: str, db: AsyncSession = Depends(get_db)):
    """Downloads the entire project software workspace as a ZIP file."""
    res = await db.execute(select(Project).where(Project.id == project_id))
    p = res.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found.")

    fs = WorkspaceFileSystem(project_id)
    zip_path = fs.create_zip_archive()
    return FileResponse(zip_path, filename=f"{p.slug}_workspace.zip", media_type="application/zip")
