from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.config import hash_password, verify_password
from app.core.security import create_access_token, get_current_user
from app.models.user import User
from app.models.workspace import Workspace
from app.models.audit import AuditLog
from app.schemas.auth import (
    SetupOwnerRequest, LoginRequest, TokenResponse, 
    UserResponse, PasswordChangeRequest, SetupStatusResponse
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.get("/status", response_model=SetupStatusResponse)
async def check_setup_status(db: AsyncSession = Depends(get_db)):
    """Checks whether the initial Owner account has been created."""
    res = await db.execute(select(User).where(User.role == "owner", User.is_active == True))
    owner = res.scalar_one_or_none()
    return SetupStatusResponse(
        is_initialized=(owner is not None),
        owner_exists=(owner is not None)
    )

@router.post("/setup", response_model=TokenResponse)
async def setup_owner(req: SetupOwnerRequest, db: AsyncSession = Depends(get_db)):
    """Creates the initial Founder & Owner account. Only permitted if no owner exists."""
    res = await db.execute(select(User).where(User.role == "owner"))
    existing_owner = res.scalar_one_or_none()
    if existing_owner:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Owner account is already configured. Please log in."
        )

    # Get or default workspace
    ws_res = await db.execute(select(Workspace).limit(1))
    ws = ws_res.scalar_one_or_none()
    ws_id = ws.id if ws else None

    hashed_pw = hash_password(req.password)
    user = User(
        email=req.email.lower().strip(),
        hashed_password=hashed_pw,
        full_name=req.full_name.strip(),
        role="owner",
        is_active=True,
        workspace_id=ws_id,
        last_login_at=datetime.now(timezone.utc)
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    if ws and ws.owner_id == "pending_owner_setup":
        ws.owner_id = user.id
        await db.commit()

    # Audit log
    audit = AuditLog(
        workspace_id=ws_id or "default",
        user_id=user.id,
        action="setup_owner",
        entity_type="user",
        entity_id=user.id,
        details_json="{}"
    )
    db.add(audit)
    await db.commit()

    token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            workspace_id=user.workspace_id
        )
    )

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticates the user and returns a signed JWT access token."""
    email_clean = req.email.lower().strip()
    res = await db.execute(select(User).where(User.email == email_clean, User.is_active == True))
    user = res.scalar_one_or_none()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user.last_login_at = datetime.now(timezone.utc)
    await db.commit()

    token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            workspace_id=user.workspace_id
        )
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user's profile details."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        workspace_id=current_user.workspace_id,
        avatar_url=current_user.avatar_url
    )
