from sqlalchemy import Column, String, Boolean, DateTime
from app.models.base import TimeStampedModel

class User(TimeStampedModel):
    __tablename__ = "users"

    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="staff", nullable=False) # 'owner', 'admin', 'staff', 'viewer'
    is_active = Column(Boolean, default=True, nullable=False)
    workspace_id = Column(String(36), nullable=True, index=True)
    avatar_url = Column(String(512), nullable=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
