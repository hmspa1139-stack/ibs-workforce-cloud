import json
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.config import encrypt_secret, decrypt_secret
from app.core.security import get_current_user
from app.models.integration import Integration
from app.schemas.common import IntegrationResponse, IntegrationConfigureRequest
from app.integrations.adapters import INTEGRATION_ADAPTERS
from app.integrations.gemini_provider import GeminiProviderAdapter
from app.integrations.openai_provider import OpenAIProviderAdapter

router = APIRouter(prefix="/integrations", tags=["Integrations"])

@router.get("", response_model=List[IntegrationResponse])
async def list_integrations(db: AsyncSession = Depends(get_db)):
    """Lists external integrations with authentic connection status."""
    res = await db.execute(select(Integration).order_by(Integration.provider_name))
    integrations = res.scalars().all()

    return [
        IntegrationResponse(
            id=i.id,
            provider_key=i.provider_key,
            provider_name=i.provider_name,
            description=i.description,
            is_enabled=i.is_enabled,
            is_connected=i.is_connected,
            status_message=i.status_message,
            last_connected_at=i.last_connected_at,
            config=json.loads(i.config_json or "{}")
        )
        for i in integrations
    ]

@router.post("/{provider_key}/test")
async def test_integration(provider_key: str, db: AsyncSession = Depends(get_db)):
    """Verifies live credentials against the integration's actual API."""
    res = await db.execute(select(Integration).where(Integration.provider_key == provider_key))
    integ = res.scalar_one_or_none()
    if not integ:
        raise HTTPException(status_code=404, detail="Integration not found.")

    decrypted_cred = decrypt_secret(integ.credentials_encrypted)
    cred_dict = json.loads(decrypted_cred) if decrypted_cred else {}
    cfg = json.loads(integ.config_json or "{}")

    # Select adapter
    if provider_key == "gemini":
        adapter = GeminiProviderAdapter()
    elif provider_key == "openai":
        adapter = OpenAIProviderAdapter()
    elif provider_key in INTEGRATION_ADAPTERS:
        adapter = INTEGRATION_ADAPTERS[provider_key]
    else:
        return {"success": False, "message": "Unknown provider"}

    success, message = await adapter.test_connection(cred_dict, cfg)
    integ.is_connected = success
    integ.status_message = message
    if success:
        integ.last_connected_at = datetime.now(timezone.utc)
    await db.commit()

    return {"success": success, "message": message, "is_connected": success}

@router.post("/{provider_key}/configure", response_model=IntegrationResponse)
async def configure_integration(
    provider_key: str,
    req: IntegrationConfigureRequest,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    """Saves encrypted credentials and toggles integration."""
    res = await db.execute(select(Integration).where(Integration.provider_key == provider_key))
    integ = res.scalar_one_or_none()
    if not integ:
        raise HTTPException(status_code=404, detail="Integration not found.")

    if req.is_enabled is not None:
        integ.is_enabled = req.is_enabled

    if req.credentials:
        integ.credentials_encrypted = encrypt_secret(json.dumps(req.credentials))

    if req.config:
        current_cfg = json.loads(integ.config_json or "{}")
        current_cfg.update(req.config)
        integ.config_json = json.dumps(current_cfg)

    await db.commit()
    await db.refresh(integ)

    return IntegrationResponse(
        id=integ.id,
        provider_key=integ.provider_key,
        provider_name=integ.provider_name,
        description=integ.description,
        is_enabled=integ.is_enabled,
        is_connected=integ.is_connected,
        status_message=integ.status_message,
        last_connected_at=integ.last_connected_at,
        config=json.loads(integ.config_json or "{}")
    )
