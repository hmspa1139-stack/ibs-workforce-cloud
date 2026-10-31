from sqlalchemy import Column, String, Integer, Float, Text
from app.models.base import TimeStampedModel

class UsageRecord(TimeStampedModel):
    __tablename__ = "usage_records"

    workspace_id = Column(String(36), nullable=False, index=True)
    project_id = Column(String(36), nullable=True, index=True)
    task_id = Column(String(36), nullable=True, index=True)
    agent_id = Column(String(100), nullable=True, index=True)
    provider = Column(String(50), nullable=False) # gemini, openai, etc.
    model_name = Column(String(100), nullable=False)
    input_tokens = Column(Integer, default=0, nullable=False)
    output_tokens = Column(Integer, default=0, nullable=False)
    total_tokens = Column(Integer, default=0, nullable=False)
    estimated_cost_usd = Column(Float, default=0.0, nullable=False)

class SystemSetting(TimeStampedModel):
    __tablename__ = "system_settings"

    workspace_id = Column(String(36), nullable=False, index=True)
    setting_key = Column(String(100), nullable=False, index=True)
    setting_value = Column(Text, nullable=False)
