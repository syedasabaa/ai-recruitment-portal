from anthropic import Anthropic
from dotenv import load_dotenv
import os

load_dotenv()

client=Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

ANALYSIS_TOOL={
    "name":"analyze_resume_match",
    "description":"Compare a candidate's resume against a job description and produce a structured match analysis",
    "input_schema":{
        "type":"object",
        "properties":{
            "match_score":{
                "type":"number",
                "description":"Overall match percentage from 0 to 100"
            },
            "matching_skills":{
                "type":"array",
                "items":{"type":"string"},
                "description":"Skills present in both resume and job description"
            },
            "missing_skills":{
                "type":"array",
                "items":{"type":"string"},
                "description":"Skills required by job but not found in resume"
            },
            "experience_gap":{
                "type":"string",
                "description":"A short summary of whether the candidate meets, exceeds, or falls short of the required experience" 
            },
            "ai_recommendation": {
                "type": "string",
                "description": "A 2-3 sentence overall recommendation for the recruiter"
            }
        },
        "required":[
            "match_score","matching_skills","missing_skills",
            "experience_gap","ai_recommendation"
        ]
    }
}

def analyze_resume_match(resume_text:str,job_description_text:str)->dict:
    system_prompt = (
        "You are an expert technical recruiter assistant. Compare the candidate's "
        "resume against the job description objectively. Base your analysis only "
        "on what is explicitly stated in both texts. Do not assume skills or "
        "experience that are not mentioned."
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
        tools=[ANALYSIS_TOOL],
        tool_choice={"type":"tool","name":"analyze_resume_match"}
    )
    #extracting the result
    tool_use_block=next(
        block for block in response.content if block.type=="tool_use"
    )
    analysis_result=tool_use_block.input
    return analysis_result

