from anthropic import Anthropic
from dotenv import load_dotenv
import os

load_dotenv()

client=Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

QUESTION_GENERATION_TOOL={
    "name":"generate_interview_questions",
    "description":"Generate a fixed set of interview questions tailored to a candidate's resume and a specific job description.",
       "input_schema": {
        "type": "object",
        "properties": {
            "technical_questions": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Exactly 5 technical questions testing the candidate's knowledge of skills mentioned in the job description"
            },
            "scenario_questions": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Exactly 3 scenario-based questions presenting realistic on-the-job situations relevant to this role"
            },
            "coding_questions": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Exactly 2 coding problem questions relevant to the required technical skills"
            }
        },
        "required": ["technical_questions", "scenario_questions", "coding_questions"]
    }
}

def generate_interview_questions(resume_text:str,job_description_text:str)->list:
    system_prompt = (
        "You are an expert technical interviewer. Generate interview questions "
        "tailored to this specific candidate and job description. Technical questions "
        "should test knowledge of skills explicitly mentioned in the job description. "
        "Scenario questions should reflect realistic situations for this role. "
        "Coding questions should be solvable in an interview setting, not require "
        "external tools. Base all questions on the actual content provided, not "
        "generic templates."
    )

    user_message=(
        f"JOB DESCRIPTION:\n{job_description_text}\n\n"
        f"CANDIDATE RESUME:\n{resume_text}"
    )

    response=client.messages.create(
        model="claude-sonnet-5",
        max_tokens=2000,
        system=system_prompt,
        messages=[
            {"role":"user","content":user_message}
        ],
        tools=[QUESTION_GENERATION_TOOL],
        tool_choice={"type": "tool", "name": "generate_interview_questions"}
    )

    tool_use_block = next(
        block for block in response.content if block.type == "tool_use"
    )

    result = tool_use_block.input

    questions = []

    for question_text in result.get("technical_questions", []):
        questions.append({"question_text": question_text, "question_type": "technical"})

    for question_text in result.get("scenario_questions", []):
        questions.append({"question_text": question_text, "question_type": "scenario"})

    for question_text in result.get("coding_questions", []):
        questions.append({"question_text": question_text, "question_type": "coding"})

    return questions