from sqlalchemy import Column,Integer,String,Text,ForeignKey,DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
class Resume(Base):
    __tablename__="resumes"
    id = Column(Integer,primary_key=True,index=True)
    candidate_id = Column(Integer,ForeignKey("candidates.id"), unique=True)
    file_name=Column(String,nullable=False)
    file_path=Column(String,nullable=False)
    file_type=Column(String)
    raw_text=Column(Text)
    skills=Column(Text)
    certifications=Column(Text)
    projects=Column(Text)
    uploaded_at=Column(DateTime(timezone=True),server_default=func.now())
    candidate=relationship("Candidate",back_populates="resume")