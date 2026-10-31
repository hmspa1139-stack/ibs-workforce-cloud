from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.client import Client
from app.models.project import Project
from app.models.workspace import Workspace
from app.schemas.common import ClientCreate, ClientUpdate, ClientResponse

router = APIRouter(prefix="/clients", tags=["Clients CRM"])

@router.get("", response_model=List[ClientResponse])
async def list_clients(status_filter: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    """Lists agency clients with active project counts."""
    query = select(Client).where(Client.is_deleted == False)
    if status_filter:
        query = query.where(Client.status == status_filter)

    query = query.order_by(desc(Client.created_at))
    clients = (await db.execute(query)).scalars().all()

    results = []
    for c in clients:
        proj_cnt = (await db.execute(select(func.count(Project.id)).where(Project.client_id == c.id))).scalar() or 0
        results.append(ClientResponse(
            id=c.id,
            company_name=c.company_name,
            contact_name=c.contact_name,
            email=c.email,
            phone=c.phone,
            website=c.website,
            industry=c.industry,
            address=c.address,
            status=c.status,
            total_spend_usd=c.total_spend_usd,
            notes=c.notes,
            created_at=c.created_at,
            projects_count=proj_cnt
        ))
    return results

@router.post("", response_model=ClientResponse)
async def create_client(
    req: ClientCreate,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    """Registers a new client with isolated memory profile."""
    ws_res = await db.execute(select(Workspace).limit(1))
    ws = ws_res.scalar_one_or_none()
    ws_id = ws.id if ws else "default_workspace"

    client = Client(
        workspace_id=ws_id,
        company_name=req.company_name.strip(),
        contact_name=req.contact_name.strip(),
        email=req.email.lower().strip(),
        phone=req.phone,
        website=req.website,
        industry=req.industry,
        address=req.address,
        notes=req.notes
    )
    db.add(client)
    await db.commit()
    await db.refresh(client)

    return ClientResponse(
        id=client.id,
        company_name=client.company_name,
        contact_name=client.contact_name,
        email=client.email,
        phone=client.phone,
        website=client.website,
        industry=client.industry,
        address=client.address,
        status=client.status,
        total_spend_usd=client.total_spend_usd,
        notes=client.notes,
        created_at=client.created_at,
        projects_count=0
    )
