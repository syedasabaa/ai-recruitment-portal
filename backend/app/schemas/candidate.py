from pydantic import BaseModel
from datetime import datetime
from typing import Optional,List

class CandidateUpdate(BaseModel):
    name:Optional[str]=None
    email:Optional[str]=None
    phone:Optional[str]=None
    experience_years:Optional[float]=None
    education:Optional[str]=None
    status:Optional[str]=None

class CandidateResponse(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    experience_years: float
    education: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes=True

class CandidateDetailResponse(CandidateResponse):
    skills: Optional[str] = None
    certifications: Optional[str] = None
    projects: Optional[str] = None

class CandidateListResponse(BaseModel):
    total:int
    page:int
    page_size:int
    candidates:List[CandidateResponse]

class CompareRequest(BaseModel):
    candidate_ids: List[int]

class CandidateComparisonItem(BaseModel):
    candidate_id: int
    name: str
    skills: List[str]
    experience_years: float
    status: str
    latest_match_score: Optional[float] = None

class CompareResponse(BaseModel):
    candidates: List[CandidateComparisonItem]
    common_skills: List[str]

    