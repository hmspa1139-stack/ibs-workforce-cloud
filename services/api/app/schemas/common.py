from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr

class ApprovalResponse(BaseModel):
    id: str
    workspace_id: str
    task_id: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    requesting_agent_id: str
    requesting_agent_name: Optional[str] = None
    action_type: str
    action_title: str
    action_details: Dict[str, Any]
    target_service: str
    financial_impact_usd: float
    risk_level: str
    status: str
    requested_at: datetime
    decided_at: Optional[datetime] = None
    decided_by_user_id: Optional[str] = None
    rejection_reason: Optional[str] = None
    expires_at: Optional[datetime] = None

class ApprovalDecisionRequest(BaseModel):
    decision: str # "approve" or "reject"
    reason: Optional[str] = None

class ClientCreate(BaseModel):
    company_name: str
    contact_name: str
    email: EmailStr
    phone: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None

class ClientUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class ClientResponse(BaseModel):
    id: str
    company_name: str
    contact_name: str
    email: str
    phone: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    address: Optional[str] = None
    status: str
    total_spend_usd: float
    notes: Optional[str] = None
    created_at: datetime
    projects_count: int = 0

class DeliverableResponse(BaseModel):
    id: str
    project_id: str
    task_id: Optional[str] = None
    created_by_agent_id: str
    created_by_agent_name: Optional[str] = None
    file_name: str
    file_path: str
    file_size_bytes: int
    mime_type: str
    file_category: str
    version: int
    download_url: Optional[str] = None
    created_at: datetime

class MemoryRecordCreate(BaseModel):
    scope: str # company, department, project, client, agent
    entity_id: Optional[str] = None
    key: str
    title: str
    content: str
    tags: Optional[List[str]] = []
    importance_score: int = 5

class MemoryRecordResponse(BaseModel):
    id: str
    scope: str
    entity_id: Optional[str] = None
    key: str
    title: str
    content: str
    tags: List[str]
    importance_score: int
    is_active: bool
    created_at: datetime

class IntegrationResponse(BaseModel):
    id: str
    provider_key: str
    provider_name: str
    description: Optional[str]
    is_enabled: bool
    is_connected: bool
    status_message: str
    last_connected_at: Optional[datetime] = None
    config: Dict[str, Any]

class IntegrationConfigureRequest(BaseModel):
    is_enabled: Optional[bool] = None
    credentials: Optional[Dict[str, str]] = None
    config: Optional[Dict[str, Any]] = None

class OverviewStatsResponse(BaseModel):
    total_agents: int
    active_agents: int
    disabled_agents: int
    active_projects: int
    completed_projects: int
    running_tasks: int
    pending_approvals: int
    failed_tasks: int
    daily_ai_usage_tokens: int
    monthly_ai_cost_usd: float
    total_spend_usd: float
    recent_tasks: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]

class SystemSettingsResponse(BaseModel):
    settings: Dict[str, str]

class SystemSettingsUpdate(BaseModel):
    settings: Dict[str, str]
