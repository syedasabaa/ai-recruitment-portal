from pydantic import BaseModel
from datetime import datetime
from typing import Optional,List

#schema1--Analyze Request(What triggers the AI Analysis)
class AnalyzeRequest(BaseModel):
    candidate_id:int
    job_description_id:int


#schema2--AIAnalysisResult(claude's output shape)
class AIAnalysisResult(BaseModel):
    match_score:float
    matching_skills:List[str]
    missing_skills:List[str]
    experience_gap:str
    ai_recommendation:str

#schema 3--Evaluation response(what we send back to frontend)
class EvaluationResponse(BaseModel):
    id:int
    candidate_id:int
    job_description_id:int
    match_score:Optional[float]=None
    matching_skills:Optional[str]=None
    missing_skills:Optional[str]=None
    experience_gap:Optional[str]=None
    ai_recommendation:Optional[str]=None
    recruiter_rating:Optional[float]=None
    technical_rating:Optional[float]=None
    hr_rating:Optional[float]=None
    final_recommendation:Optional[str]=None
    created_at:datetime

    class Config:
        from_attributes=True


#schema 4---Evaluation Rating Update(Human Rating Inputs)
class EvaluationRatingUpdate(BaseModel):
    recruiter_rating:Optional[float]=None
    technical_rating:Optional[float]=None
    hr_rating:Optional[float]=None
    final_recommendation:Optional[str]=None






