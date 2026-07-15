from fastapi import Depends,HTTPException,status
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.utils.security import decode_access_token

security=HTTPBearer()

def get_current_user(
    cred: HTTPAuthorizationCredentials= Depends(security), 
    db : Session=Depends(get_db)
):
    
    credentials_exception=HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate":"Bearer"},
    )

    token=cred.credentials


    payload = decode_access_token(token)

    if payload is None:
        raise credentials_exception

    username = payload.get("sub")

    if username is None:
        raise credentials_exception

    user = db.query(User).filter(User.username == username).first()

    if user is None:
        raise credentials_exception

    return user

