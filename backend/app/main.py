from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app import models
from app.routers import auth, resumes, job_descriptions, evaluations, interview_questions, candidates, dashboard, chat, activity_logs

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Recruitment Portal API",
    description="Backend for AI-powered recruitment platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(resumes.router)
app.include_router(job_descriptions.router)
app.include_router(evaluations.router)
app.include_router(interview_questions.router)
app.include_router(candidates.router)
app.include_router(dashboard.router)
app.include_router(chat.router)
app.include_router(activity_logs.router)


@app.get("/")
def read_root():
    return {"message": "AI Recruitment Portal API is running"}