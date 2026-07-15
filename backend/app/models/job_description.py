from sqlalchemy import Column,Integer,String,Text,DateTime
from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy.orm import relationship

class JobDescription(Base):
    __tablename__="job_descriptions"
    
    id = Column(Integer,primary_key=True,index=True)
    title=Column(String,nullable=False)
    description=Column(Text,nullable=False) 
    required_skills=Column(Text)
    created_at=Column(DateTime(timezone=True),server_default=func.now())
    evaluations=relationship("Evaluation",back_populates="job_description")
    interview_questions=relationship("InterviewQuestion",back_populates="job_description")
