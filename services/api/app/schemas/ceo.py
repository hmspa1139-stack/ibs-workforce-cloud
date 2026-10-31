from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class TaskItemPlan(BaseModel):
    task_id: str
    agent_id: str
    title: str
    description: Optional[str] = None
    dependencies: List[str] = []
    priority: str = "medium"
    expected_output: str

class TaskPlanSchema(BaseModel):
    project_name: str
    objective: str
    executive_summary: str
    tasks: List[TaskItemPlan]
    estimated_cost_usd: float = 0.50
    estimated_duration_minutes: int = 5

class CEOChatRequest(BaseModel):
    message: str
    project_id: Optional[str] = None
    plan_only: bool = False
    cost_limit_usd: Optional[float] = 5.0

class CEOChatResponse(BaseModel):
    conversation_id: str
    reply: str
    plan: Optional[TaskPlanSchema] = None
    project_id: Optional[str] = None
    execution_started: bool = False
    tasks_created: int = 0
