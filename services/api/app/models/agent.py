from sqlalchemy import Column, String, Boolean, Integer, Float, DateTime, Text, ForeignKey
from app.models.base import TimeStampedModel

class AgentProfile(TimeStampedModel):
    __tablename__ = "agent_profiles"

    # Agent ID is unique string identifier (e.g. agent_ceo, agent_frontend_developer)
    agent_id = Column(String(100), unique=True, nullable=False, index=True)
    department_id = Column(String(36), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    designation = Column(String(255), nullable=False)
    icon = Column(String(50), default="Bot", nullable=False)
    color = Column(String(50), default="#0066FF", nullable=False)
    mission = Column(Text, nullable=False)
    specialization = Column(Text, nullable=False)
    status = Column(String(50), default="idle", nullable=False) # idle, busy, offline, error
    is_enabled = Column(Boolean, default=True, nullable=False)

    # Structured configuration stored as JSON strings
    accepted_inputs = Column(Text, default="[]", nullable=False)
    expected_outputs = Column(Text, default="[]", nullable=False)
    tool_permissions = Column(Text, default="[]", nullable=False)
    quality_checklist = Column(Text, default="[]", nullable=False)
    execution_limits = Column(Text, default="{}", nullable=False)

    # Runtime and performance metrics
    total_runs = Column(Integer, default=0, nullable=False)
    successful_runs = Column(Integer, default=0, nullable=False)
    failed_runs = Column(Integer, default=0, nullable=False)
    total_tokens = Column(Integer, default=0, nullable=False)
    total_cost_usd = Column(Float, default=0.0, nullable=False)
    avg_duration_sec = Column(Float, default=0.0, nullable=False)
    last_active_at = Column(DateTime(timezone=True), nullable=True)

class AgentInstruction(TimeStampedModel):
    __tablename__ = "agent_instructions"

    agent_id = Column(String(100), nullable=False, index=True)
    version = Column(Integer, default=1, nullable=False)
    system_prompt = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_by = Column(String(36), nullable=True)
