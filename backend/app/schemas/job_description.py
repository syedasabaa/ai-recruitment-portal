from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class JobDescriptionCreate(BaseModel):
    title:str
    description:str
    required_skills:Optional[str]=None

class JobDescriptionResponse(BaseModel):
    id:int
    title:str
    description:str
    required_skills:Optional[str]=None
    created_at:datetime

    class Config:
        from_attributes=True
