from sqlalchemy import Column, String, Float, DateTime, Text
from app.models.base import TimeStampedModel

class Project(TimeStampedModel):
    __tablename__ = "projects"

    workspace_id = Column(String(36), nullable=False, index=True)
    client_id = Column(String(36), nullable=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="planning", nullable=False, index=True) # planning, active, paused, completed, archived
    priority = Column(String(50), default="medium", nullable=False) # low, medium, high, urgent
    budget_limit_usd = Column(Float, default=50.0, nullable=False)
    total_spend_usd = Column(Float, default=0.0, nullable=False)
    deadline = Column(DateTime(timezone=True), nullable=True)
    workspace_path = Column(String(512), nullable=True) # sandboxed folder path
    metadata_json = Column(Text, default="{}", nullable=False)

class ProjectMember(TimeStampedModel):
    __tablename__ = "project_members"

    project_id = Column(String(36), nullable=False, index=True)
    member_type = Column(String(20), default="agent", nullable=False) # 'user' or 'agent'
    member_id = Column(String(100), nullable=False, index=True)
    role = Column(String(50), default="contributor", nullable=False)
