from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class ActivityLogResponse(BaseModel):
    id: int
    user_id: int
    action_type: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ActivityLogListResponse(BaseModel):
    logs: List[ActivityLogResponse]