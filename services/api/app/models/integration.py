from sqlalchemy import Column, String, Boolean, DateTime, Text
from app.models.base import TimeStampedModel

class Integration(TimeStampedModel):
    __tablename__ = "integrations"

    workspace_id = Column(String(36), nullable=False, index=True)
    # Providers: gemini, openai, github, gdrive, gmail, meta_ads, google_ads, web_research, playwright, image_generation, hosting
    provider_key = Column(String(100), nullable=False, index=True)
    provider_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_enabled = Column(Boolean, default=False, nullable=False)
    is_connected = Column(Boolean, default=False, nullable=False)
    status_message = Column(String(255), default="Not Connected", nullable=False)
    last_connected_at = Column(DateTime(timezone=True), nullable=True)
    credentials_encrypted = Column(Text, default="", nullable=False) # Server-side encrypted secrets
    config_json = Column(Text, default="{}", nullable=False)
