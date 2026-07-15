from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.candidate import Candidate
from app.models.resume import Resume
from app.models.job_description import JobDescription
from app.models.evaluation import Evaluation
from app.schemas.evaluation import (
    AnalyzeRequest,
    EvaluationResponse,
    EvaluationRatingUpdate
)
from app.utils.dependencies import get_current_user
from app.services.ai_resume_analyzer import analyze_resume_match
from app.services.activity_logger import log_activity

router = APIRouter(prefix="/evaluations", tags=["Evaluations"])


@router.post("/analyze", response_model=EvaluationResponse)
def analyze_candidate(
    request: AnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    candidate = db.query(Candidate).filter(Candidate.id == request.candidate_id).first()
    if candidate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with id {request.candidate_id} not found"
        )

    resume = db.query(Resume).filter(Resume.candidate_id == request.candidate_id).first()
    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No resume found for candidate {request.candidate_id}"
        )

    job = db.query(JobDescription).filter(JobDescription.id == request.job_description_id).first()
    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job description with id {request.job_description_id} not found"
        )

    try:
        analysis = analyze_resume_match(resume.raw_text, job.description)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI analysis is temporarily unavailable. Please try again shortly."
        )

    new_evaluation = Evaluation(
        candidate_id=candidate.id,
        job_description_id=job.id,
        match_score=analysis.get("match_score"),
        matching_skills=", ".join(analysis.get("matching_skills") or []),
        missing_skills=", ".join(analysis.get("missing_skills") or []),
        experience_gap=analysis.get("experience_gap"),
        ai_recommendation=analysis.get("ai_recommendation")
    )

    db.add(new_evaluation)
    db.commit()
    db.refresh(new_evaluation)

    log_activity(
        db, current_user.id, "resume_analysis",
        f"Analyzed candidate {candidate.name} against job '{job.title}'"
    )

    return new_evaluation


@router.get("/{evaluation_id}", response_model=EvaluationResponse)
def get_evaluation(
    evaluation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()

    if evaluation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evaluation with id {evaluation_id} not found"
        )

    return evaluation


@router.patch("/{evaluation_id}/rating", response_model=EvaluationResponse)
def update_evaluation_rating(
    evaluation_id: int,
    rating_update: EvaluationRatingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()

    if evaluation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evaluation with id {evaluation_id} not found"
        )

    update_data = rating_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(evaluation, field, value)

    db.commit()
    db.refresh(evaluation)

    return evaluation