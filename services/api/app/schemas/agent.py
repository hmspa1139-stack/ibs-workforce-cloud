from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class AgentProfileResponse(BaseModel):
    id: str
    agent_id: str
    department_id: str
    name: str
    designation: str
    icon: str
    color: str
    mission: str
    specialization: str
    status: str
    is_enabled: bool
    accepted_inputs: List[str]
    expected_outputs: List[str]
    tool_permissions: List[str]
    quality_checklist: List[str]
    execution_limits: Dict[str, Any]
    total_runs: int
    successful_runs: int
    failed_runs: int
    total_tokens: int
    total_cost_usd: float
    avg_duration_sec: float
    last_active_at: Optional[datetime] = None

class AgentInstructionUpdate(BaseModel):
    system_prompt: str

class AgentStatusUpdate(BaseModel):
    is_enabled: Optional[bool] = None
    status: Optional[str] = None

class AgentTestRequest(BaseModel):
    prompt: str
    project_id: Optional[str] = None

class AgentTestResponse(BaseModel):
    agent_id: str
    status: str
    response: str
    tokens_used: int
    duration_seconds: float
    simulated: bool = False

class DepartmentResponse(BaseModel):
    id: str
    code: str
    name: str
    description: Optional[str]
    icon: str
    color: str
    display_order: int
    head_agent_id: Optional[str]
    agents_count: int = 0
    active_tasks_count: int = 0
