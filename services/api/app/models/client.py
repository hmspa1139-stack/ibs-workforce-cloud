from sqlalchemy import Column, String, Float, Text
from app.models.base import TimeStampedModel

class Client(TimeStampedModel):
    __tablename__ = "clients"

    workspace_id = Column(String(36), nullable=False, index=True)
    company_name = Column(String(255), nullable=False)
    contact_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    website = Column(String(255), nullable=True)
    industry = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    status = Column(String(50), default="active", nullable=False) # lead, active, inactive, churned
    total_spend_usd = Column(Float, default=0.0, nullable=False)
    notes = Column(Text, nullable=True)
    client_memory = Column(Text, default="{}", nullable=False) # Dedicated client memory JSON
