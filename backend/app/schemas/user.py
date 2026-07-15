from pydantic import BaseModel,EmailStr
from datetime import datetime
from typing import Optional
#schema 1-UserCreate(For Registration for 1st time users)
class UserCreate(BaseModel):
    username:str
    email:EmailStr
    password:str
    full_name:Optional[str]=None

#schema 2-UserLogin(for login)
class UserLogin(BaseModel):
    username:str
    password:str

#schema 3=UserResponse(What we send back)
class UserResponse(BaseModel):
    id:int
    username:str
    email:EmailStr
    full_name:Optional[str]=None
    role:str
    created_at:datetime

    class Config:
        from_attributes=True

#schema 4=Token(for login response)
class Token(BaseModel):
    access_token:str
    token_type:str