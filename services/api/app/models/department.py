from sqlalchemy import Column, String, Integer, Text
from app.models.base import TimeStampedModel

class Department(TimeStampedModel):
    __tablename__ = "departments"

    code = Column(String(50), unique=True, nullable=False, index=True) # executive, tech, marketing, creative, sales
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    head_agent_id = Column(String(100), nullable=True)
    icon = Column(String(50), default="Briefcase", nullable=False)
    color = Column(String(50), default="#0066FF", nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
