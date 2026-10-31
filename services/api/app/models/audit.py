from sqlalchemy import Column, String, Text
from app.models.base import TimeStampedModel

class AuditLog(TimeStampedModel):
    __tablename__ = "audit_logs"

    workspace_id = Column(String(36), nullable=False, index=True)
    user_id = Column(String(36), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True) # e.g. login, setup, task_created, approval_decided
    entity_type = Column(String(100), nullable=True) # project, task, agent, setting
    entity_id = Column(String(100), nullable=True)
    ip_address = Column(String(100), nullable=True)
    user_agent = Column(String(255), nullable=True)
    details_json = Column(Text, default="{}", nullable=False)
