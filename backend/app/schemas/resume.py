from pydantic import BaseModel
from datetime import datetime
from typing import Optional,List

class ExtractedResumeData(BaseModel):
    name:Optional[str]=None
    email:Optional[str]=None
    phone:Optional[str]=None
    skills:Optional[List[str]]=[]
    experience_years:Optional[float]=0
    education:Optional[str]=None
    certifications:Optional[List[str]]=[]
    projects:Optional[list[str]]=[]

class ResumeResponse(BaseModel):
    id:int
    candidate_id:int
    file_name:str
    file_type:Optional[str]=None
    uploaded_at:datetime

    class Config:
        from_attributes=True
  
class ResumeUploadResponse(BaseModel):
    message:str
    candidate_id:int
    resume:ResumeResponse
    extracted_data:ExtractedResumeData 



    

