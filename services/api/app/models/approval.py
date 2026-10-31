from sqlalchemy import Column, String, Float, DateTime, Text
from app.models.base import TimeStampedModel

class Approval(TimeStampedModel):
    __tablename__ = "approvals"

    workspace_id = Column(String(36), nullable=False, index=True)
    task_id = Column(String(36), nullable=True, index=True)
    project_id = Column(String(36), nullable=True, index=True)
    requesting_agent_id = Column(String(100), nullable=False, index=True)
    
    # Sensitive Action Types
    # 'ad_spend', 'publish_campaign', 'send_email', 'deploy_production', 'database_migration', 'delete_file', 'external_api_write'
    action_type = Column(String(100), nullable=False, index=True)
    action_title = Column(String(255), nullable=False)
    action_details = Column(Text, default="{}", nullable=False) # JSON details
    target_service = Column(String(100), nullable=False) # e.g. Meta Ads, Google Ads, Gmail, Vercel
    financial_impact_usd = Column(Float, default=0.0, nullable=False)
    risk_level = Column(String(50), default="medium", nullable=False) # low, medium, high, critical
    
    status = Column(String(50), default="pending", nullable=False, index=True) # pending, approved, rejected, expired
    requested_at = Column(DateTime(timezone=True), nullable=False)
    decided_at = Column(DateTime(timezone=True), nullable=True)
    decided_by_user_id = Column(String(36), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
