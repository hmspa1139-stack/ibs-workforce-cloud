import json
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.approval import Approval
from app.models.task import Task
from app.models.project import Project
from app.models.agent import AgentProfile
from app.schemas.common import ApprovalResponse, ApprovalDecisionRequest

router = APIRouter(prefix="/approvals", tags=["Human Approval Center"])

@router.get("", response_model=List[ApprovalResponse])
async def list_approvals(
    status_filter: Optional[str] = None,
    risk_level: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Lists human approval requests with agent, risk, and financial impact metrics."""
    query = select(Approval).where(Approval.is_deleted == False)
    if status_filter:
        query = query.where(Approval.status == status_filter)
    if risk_level:
        query = query.where(Approval.risk_level == risk_level)

    query = query.order_by(desc(Approval.requested_at))
    approvals = (await db.execute(query)).scalars().all()

    results = []
    for a in approvals:
        proj_name = None
        if a.project_id:
            p_res = await db.execute(select(Project).where(Project.id == a.project_id))
            proj = p_res.scalar_one_or_none()
            if proj:
                proj_name = proj.name

        agent_name = None
        ag_res = await db.execute(select(AgentProfile).where(AgentProfile.agent_id == a.requesting_agent_id))
        ag = ag_res.scalar_one_or_none()
        if ag:
            agent_name = ag.name

        results.append(ApprovalResponse(
            id=a.id,
            workspace_id=a.workspace_id,
            task_id=a.task_id,
            project_id=a.project_id,
            project_name=proj_name,
            requesting_agent_id=a.requesting_agent_id,
            requesting_agent_name=agent_name,
            action_type=a.action_type,
            action_title=a.action_title,
            action_details=json.loads(a.action_details or "{}"),
            target_service=a.target_service,
            financial_impact_usd=a.financial_impact_usd,
            risk_level=a.risk_level,
            status=a.status,
            requested_at=a.requested_at,
            decided_at=a.decided_at,
            decided_by_user_id=a.decided_by_user_id,
            rejection_reason=a.rejection_reason,
            expires_at=a.expires_at
        ))
    return results

@router.post("/{approval_id}/decision", response_model=ApprovalResponse)
async def decide_approval(
    approval_id: str,
    req: ApprovalDecisionRequest,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    """Owner approves or rejects a gated action."""
    res = await db.execute(select(Approval).where(Approval.id == approval_id))
    approval = res.scalar_one_or_none()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found.")

    if approval.status != "pending":
        raise HTTPException(status_code=400, detail=f"Approval is already {approval.status}")

    approval.decided_at = datetime.now(timezone.utc)
    approval.decided_by_user_id = user.id

    if req.decision.lower() == "approve":
        approval.status = "approved"
        # Unblock task
        if approval.task_id:
            t_res = await db.execute(select(Task).where(Task.id == approval.task_id))
            task = t_res.scalar_one_or_none()
            if task:
                task.status = "completed"
                task.actual_output = f"[Action Verified and Approved by Founder]: {approval.action_title}"
                task.completed_at = datetime.now(timezone.utc)
    else:
        approval.status = "rejected"
        approval.rejection_reason = req.reason or "Rejected by Founder."
        if approval.task_id:
            t_res = await db.execute(select(Task).where(Task.id == approval.task_id))
            task = t_res.scalar_one_or_none()
            if task:
                task.status = "failed"
                task.error_message = f"Action rejected by owner: {approval.rejection_reason}"

    await db.commit()
    await db.refresh(approval)

    return ApprovalResponse(
        id=approval.id,
        workspace_id=approval.workspace_id,
        task_id=approval.task_id,
        project_id=approval.project_id,
        requesting_agent_id=approval.requesting_agent_id,
        action_type=approval.action_type,
        action_title=approval.action_title,
        action_details=json.loads(approval.action_details or "{}"),
        target_service=approval.target_service,
        financial_impact_usd=approval.financial_impact_usd,
        risk_level=approval.risk_level,
        status=approval.status,
        requested_at=approval.requested_at,
        decided_at=approval.decided_at,
        decided_by_user_id=approval.decided_by_user_id,
        rejection_reason=approval.rejection_reason,
        expires_at=approval.expires_at
    )
