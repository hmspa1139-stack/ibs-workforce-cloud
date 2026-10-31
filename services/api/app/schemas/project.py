from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    client_id: Optional[str] = None
    priority: str = "medium"
    budget_limit_usd: float = 50.0
    deadline: Optional[datetime] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    budget_limit_usd: Optional[float] = None
    deadline: Optional[datetime] = None

class ProjectResponse(BaseModel):
    id: str
    workspace_id: str
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    name: str
    slug: str
    description: Optional[str] = None
    status: str
    priority: str
    budget_limit_usd: float
    total_spend_usd: float
    deadline: Optional[datetime] = None
    workspace_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    total_tasks: int = 0
    completed_tasks: int = 0

class TaskCreate(BaseModel):
    project_id: str
    assigned_agent_id: str
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    expected_output: Optional[str] = None
    depends_on: Optional[List[str]] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_agent_id: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    actual_output: Optional[str] = None

class TaskResponse(BaseModel):
    id: str
    project_id: str
    project_name: Optional[str] = None
    parent_task_id: Optional[str] = None
    assigned_agent_id: str
    assigned_agent_name: Optional[str] = None
    assigned_agent_icon: Optional[str] = None
    assigned_agent_color: Optional[str] = None
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    expected_output: Optional[str] = None
    actual_output: Optional[str] = None
    error_message: Optional[str] = None
    retry_count: int
    execution_cost_usd: float
    tokens_used: int
    duration_seconds: float
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    dependencies: List[str] = []
