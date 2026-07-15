from sqlalchemy import Column,Integer,String,Text,ForeignKey,DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class ChatLog(Base):
    __tablename__="chat_logs"
    
    id=Column(Integer,primary_key=True,index=True)
    user_id=Column(Integer,ForeignKey("users.id"))
    user_message=Column(Text,nullable=False)
    ai_response=Column(Text)
    created_at=Column(DateTime(timezone=True),server_default=func.now())
    user=relationship("User",back_populates="chat_logs")