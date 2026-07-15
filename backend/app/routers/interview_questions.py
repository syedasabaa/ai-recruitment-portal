from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.candidate import Candidate
from app.models.resume import Resume
from app.models.job_description import JobDescription
from app.models.interview_questions import InterviewQuestion
from app.schemas.interview_question import (
    GenerateQuestionsRequest,
    InterviewQuestionsListResponse
)
from app.utils.dependencies import get_current_user
from app.services.ai_interview_generator import generate_interview_questions

router =APIRouter(prefix="/interview-questions",tags=["Interview Questions"])

@router.post("/generate",response_model=InterviewQuestionsListResponse)
def generate_questions(
    request:GenerateQuestionsRequest,
    current_user:User=Depends(get_current_user),
    db:Session=Depends(get_db)
):
    candidate=db.query(Candidate).filter(Candidate.id==request.candidate_id).first()
    if candidate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with id {request.candidate_id} not found"
        )

    resume=db.query(Resume).filter(Resume.candidate_id == request.candidate_id).first()
    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No resume found for candidate {request.candidate_id}"
        )

    job=db.query(JobDescription).filter(JobDescription.id==request.job_description_id).first()
    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"job description with id {request.job_description_id} not found"
        )

    try:
        generated_questions=generate_interview_questions(resume.raw_text,job.description)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI question generation is temporarily unavailable ,please try again shortly"
        )

    saved_questions=[]

    for q in generated_questions:
        new_question=InterviewQuestion(
            candidate_id=candidate.id,
            job_description_id=job.id,
            question_text=q["question_text"],
            question_type=q["question_type"]
        )

        db.add(new_question)
        saved_questions.append(new_question)
    db.commit()

    for question in saved_questions:
        db.refresh(question)

    return {
        "candidate_id":candidate.id,
         "job_description_id":job.id,
         "questions":saved_questions
    }

@router.get("/candidate/{candidate_id}",response_model=InterviewQuestionsListResponse)
def get_questions_for_candidate(
    candidate_id:int,
    current_user:User=Depends(get_current_user),
    db:Session=Depends(get_db)
):

    candidate=db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if candidate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with id {candidate_id} not found"
        )

    questions=db.query(InterviewQuestion).filter(
        InterviewQuestion.candidate_id==candidate_id
    ).all()

    job_description_id = questions[0].job_description_id if questions else None

    return {
        "candidate_id": candidate_id,
        "job_description_id": job_description_id,
        "questions": questions
    }

