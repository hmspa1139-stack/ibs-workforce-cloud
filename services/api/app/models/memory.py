from sqlalchemy import Column, String, Integer, Text, Boolean
from app.models.base import TimeStampedModel

class MemoryRecord(TimeStampedModel):
    __tablename__ = "memory_records"

    workspace_id = Column(String(36), nullable=False, index=True)
    # Scopes: 'company', 'department', 'project', 'client', 'agent'
    scope = Column(String(50), nullable=False, index=True)
    entity_id = Column(String(100), nullable=True, index=True) # project_id, client_id, department_id, or agent_id
    key = Column(String(255), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    tags = Column(Text, default="[]", nullable=False) # JSON list
    importance_score = Column(Integer, default=5, nullable=False) # 1-10
    is_active = Column(Boolean, default=True, nullable=False)
