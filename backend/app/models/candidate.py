from sqlalchemy import Column,Integer,String,Float,DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
class Candidate(Base):
    __tablename__="candidates"
    id=Column(Integer,primary_key=True,index=True)
    name=Column(String,nullable=False)
    email=Column(String,index=True)
    phone=Column(String)
    experience_years=Column(Float,default=0)
    education=Column(String)
    status=Column(String,default="pending")
    created_at=Column(DateTime(timezone=True),server_default=func.now())
    updated_at=Column(DateTime(timezone=True), onupdate=func.now())
    resume=relationship("Resume",back_populates="candidate",uselist=False)
    evaluations=relationship("Evaluation",back_populates="candidate")
    interview_questions=relationship("InterviewQuestion",back_populates="candidate")