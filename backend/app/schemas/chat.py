from pydantic import BaseModel
from typing import List


class ChatRequest(BaseModel):
    message: str


class ChatCandidateSummary(BaseModel):
    id: int
    name: str
    status: str
    experience_years: float


class ChatResponse(BaseModel):
    response: str
    matched_candidates: List[ChatCandidateSummary]