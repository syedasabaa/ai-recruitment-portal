import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def client():
    return TestClient(app)


@pytest.fixture(scope="function")
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def registered_user(client):
    response = client.post("/auth/register", json={
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "testpass123",
        "full_name": "Test User"
    })
    return response.json()


@pytest.fixture(scope="function")
def auth_token(client, registered_user):
    response = client.post("/auth/login", json={
        "username": "testuser",
        "password": "testpass123"
    })
    return response.json()["access_token"]


@pytest.fixture(scope="function")
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture(scope="function")
def sample_candidate(db_session):
    from app.models.candidate import Candidate
    from app.models.resume import Resume

    candidate = Candidate(
        name="Ahmed Khalid",
        email="ahmed@example.com",
        phone="+971500000000",
        experience_years=4,
        education="B.Sc. Computer Science",
        status="pending"
    )
    db_session.add(candidate)
    db_session.commit()
    db_session.refresh(candidate)

    resume = Resume(
        candidate_id=candidate.id,
        file_name="ahmed.pdf",
        file_path="uploads/resumes/ahmed.pdf",
        file_type="pdf",
        raw_text="Ahmed Khalid. Backend Developer. Skills: Python, FastAPI, PostgreSQL.",
        skills="Python, FastAPI, PostgreSQL",
        certifications="AWS Certified Developer",
        projects="Expense Tracker API"
    )
    db_session.add(resume)
    db_session.commit()

    return candidate


@pytest.fixture(scope="function")
def sample_job(db_session):
    from app.models.job_description import JobDescription

    job = JobDescription(
        title="Backend Developer",
        description="We need a backend developer skilled in Python and FastAPI.",
        required_skills="Python, FastAPI, PostgreSQL"
    )
    db_session.add(job)
    db_session.commit()
    db_session.refresh(job)
    return job