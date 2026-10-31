from sqlalchemy import Column, String, Text
from app.models.base import TimeStampedModel

class Conversation(TimeStampedModel):
    __tablename__ = "conversations"

    workspace_id = Column(String(36), nullable=False, index=True)
    user_id = Column(String(36), nullable=False, index=True)
    project_id = Column(String(36), nullable=True, index=True)
    title = Column(String(255), default="AI CEO Strategic Session", nullable=False)
    channel = Column(String(50), default="ceo_chat", nullable=False) # ceo_chat, agent_direct
    metadata_json = Column(Text, default="{}", nullable=False)

class ConversationMessage(TimeStampedModel):
    __tablename__ = "conversation_messages"

    conversation_id = Column(String(36), nullable=False, index=True)
    sender_type = Column(String(50), nullable=False) # user, agent, system
    sender_id = Column(String(100), nullable=False) # user id or agent_id (e.g. agent_ceo)
    content = Column(Text, nullable=False)
    message_metadata = Column(Text, default="{}", nullable=False)
