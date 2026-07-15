from sqlalchemy import Column,Integer,String,Float,Text,ForeignKey,DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Evaluation(Base):
    __tablename__="evaluations"

    id=Column(Integer,primary_key=True,index=True)
    candidate_id=Column(Integer,ForeignKey("candidates.id"))
    job_description_id=Column(Integer,ForeignKey("job_descriptions.id"))
    
    match_score=Column(Float)
    matching_skills=Column(Text)
    missing_skills=Column(Text)
    experience_gap=Column(String)
    ai_recommendation=Column(Text)

    recruiter_rating=Column(Float)
    technical_rating=Column(Float)
    hr_rating=Column(Float)
    final_recommendation=Column(String)
    created_at=Column(DateTime(timezone=True),server_default=func.now())
    candidate=relationship("Candidate",back_populates="evaluations")
    job_description=relationship("JobDescription",back_populates="evaluations")