from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import Counter

from app.database import get_db
from app.models.user import User
from app.models.candidate import Candidate
from app.models.resume import Resume
from app.schemas.dashboard import (
    DashboardSummary,
    SkillsDistributionResponse,
    SkillCount,
    ExperienceDistributionResponse,
    ExperienceBucket,
    UploadStatsResponse,
    UploadDateCount
)
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total = db.query(Candidate).count()
    shortlisted = db.query(Candidate).filter(Candidate.status == "shortlisted").count()
    rejected = db.query(Candidate).filter(Candidate.status == "rejected").count()
    pending = db.query(Candidate).filter(Candidate.status == "pending").count()

    return {
        "total_candidates": total,
        "shortlisted": shortlisted,
        "rejected": rejected,
        "pending": pending
    }


@router.get("/skills-distribution", response_model=SkillsDistributionResponse)
def get_skills_distribution(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resumes = db.query(Resume.skills).filter(Resume.skills.isnot(None)).all()

    skill_counter = Counter()

    for (skills_string,) in resumes:
        if not skills_string:
            continue
        skills_list = [s.strip() for s in skills_string.split(",") if s.strip()]
        skill_counter.update(skills_list)

    top_skills = skill_counter.most_common(15)

    skills_data = [SkillCount(skill=skill, count=count) for skill, count in top_skills]

    return {"skills": skills_data}


@router.get("/experience-distribution", response_model=ExperienceDistributionResponse)
def get_experience_distribution(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    buckets_definition = [
        ("0-2 years", 0, 2),
        ("2-5 years", 2, 5),
        ("5-10 years", 5, 10),
        ("10+ years", 10, 999)
    ]

    bucket_results = []

    for label, min_val, max_val in buckets_definition:
        count = db.query(Candidate).filter(
            Candidate.experience_years >= min_val,
            Candidate.experience_years < max_val
        ).count()
        bucket_results.append(ExperienceBucket(range_label=label, count=count))

    return {"buckets": bucket_results}


@router.get("/upload-stats", response_model=UploadStatsResponse)
def get_upload_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = (
        db.query(
            func.date(Resume.uploaded_at).label("upload_date"),
            func.count(Resume.id).label("upload_count")
        )
        .group_by(func.date(Resume.uploaded_at))
        .order_by(func.date(Resume.uploaded_at).desc())
        .limit(30)
        .all()
    )

    uploads_data = [
        UploadDateCount(date=str(row.upload_date), count=row.upload_count)
        for row in results
    ]

    return {"uploads_by_date": uploads_data}