# AI Recruitment Portal



An AI-powered recruitment platform that helps recruiters parse resumes, evaluate candidates against job descriptions, generate interview questions, and manage the hiring pipeline — all backed by Claude AI.



## Tech Stack



Backend: FastAPI, PostgreSQL, SQLAlchemy, Claude (Anthropic API)

Frontend: React (Vite), Tailwind CSS, React Router, Recharts

Testing: pytest



## Features



1) Recruiter authentication (register, login, session persistence, logout)

2) Dashboard with candidate statistics and charts (skills distribution, experience distribution, upload activity)

3) Resume upload (PDF/DOCX) with AI-powered parsing (name, email, phone, skills, experience, education, certifications, projects)

4) Candidate management (list, search, filter by skill/status, view, edit, delete)

5) Candidate comparison (side-by-side, highlighting shared skills, AI match scores)

6) AI resume analysis against job descriptions (match score, matching/missing skills, experience gap, recommendation)

7) AI-generated interview questions (technical, scenario-based, coding)

8) Candidate evaluation (recruiter/technical/HR ratings, final recommendation)

9) AI chat assistant for natural language candidate search

10) Activity logging (logins, resume uploads, resume analysis, status changes)



## Project Structure



ai-recruitment-portal/

├── backend/          FastAPI application

│   ├── app/

│   │   ├── models/       SQLAlchemy database models

│   │   ├── schemas/      Pydantic request/response schemas

│   │   ├── routers/      API endpoints

│   │   ├── services/     Business logic, AI integration, file handling

│   │   └── utils/        Auth/security helpers

│   ├── tests/          pytest test suite

│   └── requirements.txt

└── frontend/         React application

└── src/

├── api/          Backend API call functions

├── components/   Reusable UI (Layout, ProtectedRoute)

├── context/       Auth state management

└── pages/         Application screens





## Prerequisites



1) Python 3.11+

2) Node.js 18+

3) PostgreSQL 14+

4) An Anthropic API key (get one at console.anthropic.com)



## Backend Setup



```bash

cd backend

python -m venv venv

venv\\Scripts\\activate        # Windows

source venv/bin/activate     # macOS/Linux



pip install -r requirements.txt

```



Create a `.env` file inside `backend/` with:

DATABASE\_URL=postgresql://postgres:YOUR\_PASSWORD@localhost:5432/recruitment\_db

SECRET\_KEY=your-secret-key-here

ALGORITHM=HS256

ACCESS\_TOKEN\_EXPIRE\_MINUTES=30

UPLOAD\_DIR=uploads/resumes

ANTHROPIC\_API\_KEY=your-anthropic-api-key-here



Create the PostgreSQL database:



```sql

CREATE DATABASE recruitment\_db;

```



Run the server (tables are created automatically on startup):



```bash

python -m uvicorn app.main:app --reload

```



Backend runs at `http://127.0.0.1:8000`. Interactive API docs available at `http://127.0.0.1:8000/docs`.



## Frontend Setup



```bash

cd frontend

npm install

npm run dev

```



Frontend runs at `http://localhost:5173`.



## Running Tests



```bash

cd backend

venv\\Scripts\\activate

pytest -v

```



Tests use an isolated in-memory SQLite database and mock all AI calls — no API key or real database connection required to run them.



\## Notes



\- Both the backend and frontend servers must be running simultaneously for the application to work.

\- CORS is configured to allow requests from `http://localhost:5173`. If running the frontend on a different port, update the `allow\_origins` setting in `backend/app/main.py`.

\- Resume previews are shown natively for PDF files. DOCX files display extracted data immediately after upload instead, since browsers cannot natively render DOCX documents.

