from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.schemas.activity_log import ActivityLogListResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/activity-logs", tags=["Activity Logs"])


@router.get("/", response_model=ActivityLogListResponse)
def list_activity_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(100).all()
    return {"logs": logs}