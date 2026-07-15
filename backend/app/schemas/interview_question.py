from pydantic import BaseModel
from datetime import datetime
from typing import Optional,List

class GenerateQuestionsRequest(BaseModel):
    candidate_id:int
    job_description_id:int

class InterviewQuestionResponse(BaseModel):
    id:int
    candidate_id:int
    job_description_id:Optional[int]=None
    question_text:str
    question_type:Optional[str]=None
    created_at:datetime

    class Config:
        from_attributes=True

class InterviewQuestionsListResponse(BaseModel):
    candidate_id:int
    job_description_id:int
    questions:List[InterviewQuestionResponse]
