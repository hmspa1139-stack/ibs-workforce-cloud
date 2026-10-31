from typing import Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.usage import SystemSetting
from app.models.audit import AuditLog
from app.schemas.common import SystemSettingsResponse, SystemSettingsUpdate

settings_router = APIRouter(prefix="/settings", tags=["Settings"])
audit_router = APIRouter(prefix="/audit", tags=["Audit Logs"])
system_router = APIRouter(prefix="/system", tags=["System & Health"])

@settings_router.get("", response_model=SystemSettingsResponse)
async def get_system_settings(db: AsyncSession = Depends(get_db)):
    """Retrieves all persisted agency configurations."""
    res = await db.execute(select(SystemSetting))
    rows = res.scalars().all()
    settings_dict = {r.setting_key: r.setting_value for r in rows}
    return SystemSettingsResponse(settings=settings_dict)

@settings_router.patch("", response_model=SystemSettingsResponse)
async def update_system_settings(
    req: SystemSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    """Updates system configurations (e.g., active model, timezone, budget limits)."""
    for k, v in req.settings.items():
        res = await db.execute(select(SystemSetting).where(SystemSetting.setting_key == k))
        row = res.scalar_one_or_none()
        if row:
            row.setting_value = str(v)
        else:
            new_row = SystemSetting(
                workspace_id=user.workspace_id or "default",
                setting_key=k,
                setting_value=str(v)
            )
            db.add(new_row)
    await db.commit()

    all_res = await db.execute(select(SystemSetting))
    settings_dict = {r.setting_key: r.setting_value for r in all_res.scalars().all()}
    return SystemSettingsResponse(settings=settings_dict)

@audit_router.get("")
async def list_audit_logs(limit: int = 50, db: AsyncSession = Depends(get_db)):
    """Retrieves immutable security and administrative audit logs."""
    res = await db.execute(select(AuditLog).order_by(desc(AuditLog.created_at)).limit(limit))
    rows = res.scalars().all()
    return [
        {
            "id": r.id,
            "action": r.action,
            "entity_type": r.entity_type,
            "entity_id": r.entity_id,
            "user_id": r.user_id,
            "created_at": r.created_at
        }
        for r in rows
    ]

@system_router.get("/health")
async def system_health():
    """System readiness and liveliness probe."""
    return {
        "status": "healthy",
        "service": "IBS AI Workforce API",
        "company": "IBS Digital",
        "tagline": "One Company. Thirty AI Specialists. Unlimited Possibilities.",
        "version": "1.0.0"
    }
