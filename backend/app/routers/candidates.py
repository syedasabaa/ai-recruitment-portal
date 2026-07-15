from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List

from app.database import get_db
from app.models.user import User
from app.models.candidate import Candidate
from app.models.resume import Resume
from app.models.evaluation import Evaluation
from app.models.interview_questions import InterviewQuestion
from app.schemas.candidate import (
    CandidateUpdate,
    CandidateResponse,
    CandidateDetailResponse,
    CandidateListResponse,
    CompareRequest,
    CompareResponse,
    CandidateComparisonItem
)
from app.utils.dependencies import get_current_user
from app.services.activity_logger import log_activity

router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.get("/", response_model=CandidateListResponse)
def list_candidates(
    search: Optional[str] = None,
    skill: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    min_experience: Optional[float] = None,
    max_experience: Optional[float] = None,
    page: int = 1,
    page_size: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Candidate)

    if search:
        query = query.filter(
            or_(
                Candidate.name.ilike(f"%{search}%"),
                Candidate.email.ilike(f"%{search}%")
            )
        )

    if status_filter:
        query = query.filter(Candidate.status == status_filter)

    if min_experience is not None:
        query = query.filter(Candidate.experience_years >= min_experience)

    if max_experience is not None:
        query = query.filter(Candidate.experience_years <= max_experience)

    if skill:
        query = query.join(Resume, Resume.candidate_id == Candidate.id).filter(
            Resume.skills.ilike(f"%{skill}%")
        )

    total = query.count()

    offset = (page - 1) * page_size
    candidates = query.order_by(Candidate.created_at.desc()).offset(offset).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "candidates": candidates
    }


@router.get("/{candidate_id}", response_model=CandidateDetailResponse)
def get_candidate(
    candidate_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()

    if candidate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with id {candidate_id} not found"
        )

    resume = db.query(Resume).filter(Resume.candidate_id == candidate_id).first()

    candidate_data = CandidateResponse.model_validate(candidate).model_dump()

    candidate_data["skills"] = resume.skills if resume else None
    candidate_data["certifications"] = resume.certifications if resume else None
    candidate_data["projects"] = resume.projects if resume else None

    return candidate_data


@router.put("/{candidate_id}", response_model=CandidateResponse)
def update_candidate(
    candidate_id: int,
    candidate_update: CandidateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()

    if candidate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with id {candidate_id} not found"
        )

    old_status = candidate.status
    update_data = candidate_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(candidate, field, value)

    db.commit()
    db.refresh(candidate)

    if "status" in update_data and update_data["status"] != old_status:
        log_activity(
            db, current_user.id, "candidate_status_update",
            f"Changed {candidate.name}'s status from {old_status} to {candidate.status}"
        )

    return candidate


@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_candidate(
    candidate_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()

    if candidate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with id {candidate_id} not found"
        )

    db.query(InterviewQuestion).filter(InterviewQuestion.candidate_id == candidate_id).delete()
    db.query(Evaluation).filter(Evaluation.candidate_id == candidate_id).delete()
    db.query(Resume).filter(Resume.candidate_id == candidate_id).delete()

    db.delete(candidate)
    db.commit()

    return None


@router.post("/compare", response_model=CompareResponse)
def compare_candidates(
    request: CompareRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if len(request.candidate_ids) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 2 candidate_ids are required for comparison"
        )

    comparison_items = []
    all_skill_sets = []

    for candidate_id in request.candidate_ids:
        candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()

        if candidate is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Candidate with id {candidate_id} not found"
            )

        resume = db.query(Resume).filter(Resume.candidate_id == candidate_id).first()
        skills_string = resume.skills if resume and resume.skills else ""
        skills_list = [s.strip() for s in skills_string.split(",") if s.strip()]

        latest_evaluation = db.query(Evaluation).filter(
            Evaluation.candidate_id == candidate_id
        ).order_by(Evaluation.created_at.desc()).first()

        latest_score = latest_evaluation.match_score if latest_evaluation else None

        comparison_items.append(
            CandidateComparisonItem(
                candidate_id=candidate.id,
                name=candidate.name,
                skills=skills_list,
                experience_years=candidate.experience_years,
                status=candidate.status,
                latest_match_score=latest_score
            )
        )

        all_skill_sets.append(set(skills_list))

    common_skills = set.intersection(*all_skill_sets) if all_skill_sets else set()

    return {
        "candidates": comparison_items,
        "common_skills": list(common_skills)
    }