from sqlalchemy import Column, String, Integer, Float, DateTime, Text
from app.models.base import TimeStampedModel

class Task(TimeStampedModel):
    __tablename__ = "tasks"

    project_id = Column(String(36), nullable=False, index=True)
    parent_task_id = Column(String(36), nullable=True, index=True)
    assigned_agent_id = Column(String(100), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="backlog", nullable=False, index=True)
    # Statuses: 'backlog', 'planning', 'assigned', 'in_progress', 'waiting_approval', 'quality_review', 'completed', 'failed', 'paused', 'cancelled'
    priority = Column(String(50), default="medium", nullable=False) # low, medium, high, urgent
    expected_output = Column(Text, nullable=True)
    actual_output = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0, nullable=False)
    max_retries = Column(Integer, default=3, nullable=False)
    execution_cost_usd = Column(Float, default=0.0, nullable=False)
    tokens_used = Column(Integer, default=0, nullable=False)
    duration_seconds = Column(Float, default=0.0, nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

class TaskDependency(TimeStampedModel):
    __tablename__ = "task_dependencies"

    task_id = Column(String(36), nullable=False, index=True)
    depends_on_task_id = Column(String(36), nullable=False, index=True)
    dependency_type = Column(String(50), default="finish_to_start", nullable=False)

class AgentRun(TimeStampedModel):
    __tablename__ = "agent_runs"

    task_id = Column(String(36), nullable=False, index=True)
    agent_id = Column(String(100), nullable=False, index=True)
    run_number = Column(Integer, default=1, nullable=False)
    status = Column(String(50), default="running", nullable=False) # running, completed, failed
    input_prompt = Column(Text, nullable=False)
    output_response = Column(Text, nullable=True)
    token_input = Column(Integer, default=0, nullable=False)
    token_output = Column(Integer, default=0, nullable=False)
    cost_usd = Column(Float, default=0.0, nullable=False)
    duration_seconds = Column(Float, default=0.0, nullable=False)
    error_trace = Column(Text, nullable=True)

class AgentRunEvent(TimeStampedModel):
    __tablename__ = "agent_run_events"

    run_id = Column(String(36), nullable=False, index=True)
    event_type = Column(String(50), nullable=False, index=True) # status_change, tool_call, tool_result, thought_summary, qa_check, approval_requested
    message = Column(Text, nullable=False)
    payload_json = Column(Text, default="{}", nullable=False)
