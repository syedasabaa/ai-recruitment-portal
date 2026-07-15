from pydantic import BaseModel
from typing import List


class DashboardSummary(BaseModel):
    total_candidates: int
    shortlisted: int
    rejected: int
    pending: int


class SkillCount(BaseModel):
    skill: str
    count: int


class SkillsDistributionResponse(BaseModel):
    skills: List[SkillCount]


class ExperienceBucket(BaseModel):
    range_label: str
    count: int


class ExperienceDistributionResponse(BaseModel):
    buckets: List[ExperienceBucket]


class UploadDateCount(BaseModel):
    date: str
    count: int


class UploadStatsResponse(BaseModel):
    uploads_by_date: List[UploadDateCount]