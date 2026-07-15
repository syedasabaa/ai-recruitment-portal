from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.candidate import Candidate
from app.models.resume import Resume
from app.models.chat_log import ChatLog
from app.schemas.chat import ChatRequest, ChatResponse
from app.utils.dependencies import get_current_user
from app.services.ai_chat_assistant import interpret_query, summarize_results

router = APIRouter(prefix="/chat", tags=["Chat Assistant"])


@router.post("/", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        filters = interpret_query(request.message)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI chat assistant is temporarily unavailable. Please try again shortly."
        )

    query = db.query(Candidate)

    skill = filters.get("skill")
    min_experience = filters.get("min_experience")
    status_filter = filters.get("status")

    if skill:
        query = query.join(Resume, Resume.candidate_id == Candidate.id).filter(
            Resume.skills.ilike(f"%{skill}%")
        )

    if min_experience is not None:
        query = query.filter(Candidate.experience_years >= min_experience)

    if status_filter:
        query = query.filter(Candidate.status == status_filter)

    matched = query.all()

    candidates_data = [
        {
            "id": c.id,
            "name": c.name,
            "status": c.status,
            "experience_years": c.experience_years
        }
        for c in matched
    ]

    try:
        ai_response_text = summarize_results(request.message, candidates_data)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI chat assistant is temporarily unavailable. Please try again shortly."
        )

    log_entry = ChatLog(
        user_id=current_user.id,
        user_message=request.message,
        ai_response=ai_response_text
    )
    db.add(log_entry)
    db.commit()

    return {
        "response": ai_response_text,
        "matched_candidates": candidates_data
    }