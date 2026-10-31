import json
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.memory import MemoryRecord
from app.models.task import Task, AgentRun

class MemoryService:
    @staticmethod
    async def get_scoped_context(
        session: AsyncSession,
        workspace_id: str,
        project_id: Optional[str] = None,
        client_id: Optional[str] = None,
        department_id: Optional[str] = None,
        agent_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Retrieves prioritized, scoped memory for an agent run."""
        context = {
            "company_memory": [],
            "department_memory": [],
            "project_memory": [],
            "client_memory": [],
            "recent_tasks_history": []
        }

        # 1. Company Memory
        comp_stmt = select(MemoryRecord).where(
            MemoryRecord.workspace_id == workspace_id,
            MemoryRecord.scope == "company",
            MemoryRecord.is_active == True
        ).order_by(desc(MemoryRecord.importance_score)).limit(10)
        comp_records = (await session.execute(comp_stmt)).scalars().all()
        context["company_memory"] = [{"key": r.key, "title": r.title, "content": r.content} for r in comp_records]

        # 2. Department Memory
        if department_id:
            dept_stmt = select(MemoryRecord).where(
                MemoryRecord.workspace_id == workspace_id,
                MemoryRecord.scope == "department",
                MemoryRecord.entity_id == department_id,
                MemoryRecord.is_active == True
            ).order_by(desc(MemoryRecord.importance_score)).limit(10)
            dept_records = (await session.execute(dept_stmt)).scalars().all()
            context["department_memory"] = [{"key": r.key, "title": r.title, "content": r.content} for r in dept_records]

        # 3. Project Memory
        if project_id:
            proj_stmt = select(MemoryRecord).where(
                MemoryRecord.workspace_id == workspace_id,
                MemoryRecord.scope == "project",
                MemoryRecord.entity_id == project_id,
                MemoryRecord.is_active == True
            ).order_by(desc(MemoryRecord.importance_score)).limit(15)
            proj_records = (await session.execute(proj_stmt)).scalars().all()
            context["project_memory"] = [{"key": r.key, "title": r.title, "content": r.content} for r in proj_records]

            # 5. Recent Completed Tasks in this Project
            task_stmt = select(Task).where(
                Task.project_id == project_id,
                Task.status == "completed"
            ).order_by(desc(Task.completed_at)).limit(5)
            tasks = (await session.execute(task_stmt)).scalars().all()
            context["recent_tasks_history"] = [
                {"title": t.title, "agent": t.assigned_agent_id, "output": (t.actual_output or "")[:500]}
                for t in tasks
            ]

        # 4. Client Memory
        if client_id:
            client_stmt = select(MemoryRecord).where(
                MemoryRecord.workspace_id == workspace_id,
                MemoryRecord.scope == "client",
                MemoryRecord.entity_id == client_id,
                MemoryRecord.is_active == True
            ).order_by(desc(MemoryRecord.importance_score)).limit(10)
            client_records = (await session.execute(client_stmt)).scalars().all()
            context["client_memory"] = [{"key": r.key, "title": r.title, "content": r.content} for r in client_records]

        return context

    @staticmethod
    async def save_memory(
        session: AsyncSession,
        workspace_id: str,
        scope: str,
        key: str,
        title: str,
        content: str,
        entity_id: Optional[str] = None,
        tags: Optional[List[str]] = None,
        importance_score: int = 5
    ) -> MemoryRecord:
        record = MemoryRecord(
            workspace_id=workspace_id,
            scope=scope,
            entity_id=entity_id,
            key=key,
            title=title,
            content=content,
            tags=json.dumps(tags or []),
            importance_score=importance_score,
            is_active=True
        )
        session.add(record)
        await session.commit()
        await session.refresh(record)
        return record
