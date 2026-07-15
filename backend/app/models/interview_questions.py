from sqlalchemy import Column,Integer,String,Text,ForeignKey,DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class InterviewQuestion(Base):
    __tablename__="interview_questions"

    id=Column(Integer,primary_key=True,index=True)
    candidate_id=Column(Integer,ForeignKey("candidates.id"))
    job_description_id=Column(Integer,ForeignKey("job_descriptions.id"))

    question_text=Column(Text,nullable=False)
    question_type=Column(String)
    created_at=Column(DateTime(timezone=True),server_default=func.now())

    candidate=relationship("Candidate",back_populates="interview_questions")
    job_description=relationship("JobDescription",back_populates="interview_questions")