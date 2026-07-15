import os
import shutil
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.database import get_db
from app.models.user import User
from app.models.candidate import Candidate
from app.models.resume import Resume
from app.schemas.resume import ResumeUploadResponse, ResumeResponse, ExtractedResumeData
from app.utils.dependencies import get_current_user
from app.services.text_extraction import extract_text
from app.services.ai_resume_parser import extract_resume_data
from app.services.activity_logger import log_activity

load_dotenv()

router = APIRouter(prefix="/resumes", tags=["Resumes"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads/resumes")
ALLOWED_EXTENSIONS = {".pdf", ".docx"}


@router.post("/upload", response_model=ResumeUploadResponse)
def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file_extension = os.path.splitext(file.filename)[1].lower()

    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{file_extension}'. Only PDF and DOCX are allowed."
        )

    existing_resume = db.query(Resume).filter(Resume.file_name == file.filename).first()
    if existing_resume:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A resume with the filename '{file.filename}' has already been uploaded."
        )

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    unique_filename = f"{uuid.uuid4()}{file_extension}"
    saved_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with open(saved_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save the uploaded file."
        )
    finally:
        file.file.close()

    try:
        raw_text = extract_text(saved_path)
    except Exception:
        os.remove(saved_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not read text from this file. It may be corrupted or unsupported."
        )

    try:
        extracted = extract_resume_data(raw_text)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI resume analysis is temporarily unavailable. Please try again shortly."
        )

    new_candidate = Candidate(
        name=extracted.get("name") or "Unknown",
        email=extracted.get("email"),
        phone=extracted.get("phone"),
        experience_years=extracted.get("experience_years") or 0,
        education=extracted.get("education"),
        status="pending"
    )
    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)

    new_resume = Resume(
        candidate_id=new_candidate.id,
        file_name=file.filename,
        file_path=saved_path,
        file_type=file_extension.replace(".", ""),
        raw_text=raw_text,
        skills=", ".join(extracted.get("skills") or []),
        certifications=", ".join(extracted.get("certifications") or []),
        projects=", ".join(extracted.get("projects") or [])
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    log_activity(
        db, current_user.id, "resume_upload",
        f"Uploaded resume '{file.filename}' for candidate {new_candidate.name}"
    )

    return {
        "message": "Resume uploaded and processed successfully",
        "candidate_id": new_candidate.id,
        "resume": new_resume,
        "extracted_data": extracted
    }