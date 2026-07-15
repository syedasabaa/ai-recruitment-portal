from sqlalchemy.orm import Session
from app.models.activity_log import ActivityLog


def log_activity(db: Session, user_id: int, action_type: str, description: str = None):
    entry = ActivityLog(
        user_id=user_id,
        action_type=action_type,
        description=description
    )
    db.add(entry)
    db.commit()