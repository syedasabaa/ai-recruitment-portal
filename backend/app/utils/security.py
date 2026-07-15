from passlib.context import CryptContext
from jose import jwt,JWTError
from datetime import datetime,timedelta
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY=os.getenv("SECRET_KEY")
ALGORITHM=os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
#CryptConcept---pwd hashing tool uses bcrypt algorithm ,if ever hashing technique changes this auto handles the transition without automatically breaking existing hashed password
pwd_context=CryptContext(schemes=["bcrypt"],deprecated="auto")
#hash_password function
def hash_password(password:str)->str:
    return pwd_context.hash(password)

#the verify_password function--re-hashes the plain password using same algorithm,then checks if it matches the hashed password from database stored during user registered
def verify_password(plain_password:str,hashed_password:str)->bool:
    return pwd_context.verify(plain_password,hashed_password)

#creates access token function
def create_access_token(data:dict):
    to_encode=data.copy()
    expire=datetime.utcnow()+timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp":expire})
    encoded_jwt=jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)
    return encoded_jwt

#creates decode_access_token Function
def decode_access_token(token:str):
    try:
        payload=jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
    


