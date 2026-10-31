from sqlalchemy import Column, String, Integer, Text
from app.models.base import TimeStampedModel

class Deliverable(TimeStampedModel):
    __tablename__ = "deliverables"

    project_id = Column(String(36), nullable=False, index=True)
    task_id = Column(String(36), nullable=True, index=True)
    created_by_agent_id = Column(String(100), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_size_bytes = Column(Integer, default=0, nullable=False)
    mime_type = Column(String(100), default="text/plain", nullable=False)
    file_category = Column(String(50), default="document", nullable=False) # code, document, report, design, archive
    version = Column(Integer, default=1, nullable=False)
    download_url = Column(String(512), nullable=True)
    metadata_json = Column(Text, default="{}", nullable=False)
