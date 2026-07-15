from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.job_description import JobDescription
from app.schemas.job_description import JobDescriptionCreate,JobDescriptionResponse
from app.utils.dependencies import get_current_user

router=APIRouter(prefix="/job-descriptions",tags=["Job Descriptions"])


#Endpoint 1:Create a Job Description
@router.post("/",response_model=JobDescriptionResponse)
def create_job_description(
    job:JobDescriptionCreate,
    current_user:User=Depends(get_current_user),
    db:Session=Depends(get_db)
):
    new_job=JobDescription(
        title=job.title,
        description=job.description,
        required_skills=job.required_skills
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return new_job

#Endpoint 2:list all job descriptions
@router.get("/",response_model=List[JobDescriptionResponse])
def list_job_descriptions(
    current_user:User=Depends(get_current_user),
    db:Session=Depends(get_db)
):
    jobs=db.query(JobDescription).order_by(JobDescription.created_at.desc()).all()
    return jobs

#Endpoint 3:Get one specific job description
@router.get("/{job_id}",response_model=JobDescriptionResponse)
def get_job_description(
    job_id:int,
    current_user:User=Depends(get_current_user),
    db:Session=Depends(get_db)
):
    job=db.query(JobDescription).filter(JobDescription.id==job_id).first()

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"job description with id {job_id} not found"
        )

    return job