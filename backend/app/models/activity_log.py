from sqlalchemy import Column,Integer,String,DateTime,ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class ActivityLog(Base):
    __tablename__="activity_logs"

    id=Column(Integer,primary_key=True,index=True)
    user_id=Column(Integer,ForeignKey("users.id"))
    action_type=Column(String,nullable=False)
    description=Column(String)
    created_at=Column(DateTime(timezone=True),server_default=func.now())
    user=relationship("User",back_populates="activity_logs")