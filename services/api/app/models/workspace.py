from sqlalchemy import Column, String, Text
from app.models.base import TimeStampedModel

class Workspace(TimeStampedModel):
    __tablename__ = "workspaces"

    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    owner_id = Column(String(36), nullable=False, index=True)
    plan = Column(String(50), default="enterprise", nullable=False)
    settings_json = Column(Text, default="{}", nullable=False)

class WorkspaceMember(TimeStampedModel):
    __tablename__ = "workspace_members"

    workspace_id = Column(String(36), nullable=False, index=True)
    user_id = Column(String(36), nullable=False, index=True)
    role = Column(String(50), default="staff", nullable=False)
