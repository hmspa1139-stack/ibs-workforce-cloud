from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.department import Department
from app.models.agent import AgentProfile
from app.models.task import Task
from app.schemas.agent import DepartmentResponse

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.get("", response_model=List[DepartmentResponse])
async def list_departments(db: AsyncSession = Depends(get_db)):
    """Lists the 5 core business divisions of IBS Digital with active agent and task stats."""
    res = await db.execute(select(Department).order_by(Department.display_order))
    departments = res.scalars().all()

    results = []
    for d in departments:
        # Agent count in this department
        agents_cnt_res = await db.execute(
            select(func.count(AgentProfile.id)).where(AgentProfile.department_id == d.id)
        )
        agents_count = agents_cnt_res.scalar() or 0

        # Active tasks assigned to agents in this department
        active_tasks_res = await db.execute(
            select(func.count(Task.id)).join(
                AgentProfile, Task.assigned_agent_id == AgentProfile.agent_id
            ).where(
                AgentProfile.department_id == d.id,
                Task.status.in_(["assigned", "in_progress", "waiting_approval", "quality_review"])
            )
        )
        active_tasks_count = active_tasks_res.scalar() or 0

        results.append(DepartmentResponse(
            id=d.id,
            code=d.code,
            name=d.name,
            description=d.description,
            icon=d.icon,
            color=d.color,
            display_order=d.display_order,
            head_agent_id=d.head_agent_id,
            agents_count=agents_count,
            active_tasks_count=active_tasks_count
        ))
    return results
