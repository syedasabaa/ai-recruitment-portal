from sqlalchemy import Column,Integer,String,DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__="users"
    id=Column(Integer,primary_key=True,index=True)
    username=Column(String,unique=True,index=True,nullable=False)
    email=Column(String,unique=True,index=True,nullable=False)
    hashed_password=Column(String,nullable=False)
    full_name=Column(String)
    role=Column(String,default="recruiter")
    created_at=Column(DateTime(timezone=True),server_default=func.now())

    activity_logs=relationship("ActivityLog",back_populates="user")
    chat_logs=relationship("ChatLog",back_populates="user")