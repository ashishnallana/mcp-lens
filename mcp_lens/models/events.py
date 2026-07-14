from pydantic import BaseModel, Field
from typing import Any, Dict, Optional
from datetime import datetime

class BaseEvent(BaseModel):
    event_type: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ToolStartedEvent(BaseEvent):
    event_type: str = "ToolStarted"
    tool_name: str
    arguments: Dict[str, Any]
    client_id: Optional[str] = None

class ToolCompletedEvent(BaseEvent):
    event_type: str = "ToolCompleted"
    tool_name: str
    result: Any
    duration_ms: float

class ToolFailedEvent(BaseEvent):
    event_type: str = "ToolFailed"
    tool_name: str
    error: str
    duration_ms: float

class ServerStartedEvent(BaseEvent):
    event_type: str = "ServerStarted"
    server_name: str
    version: str
