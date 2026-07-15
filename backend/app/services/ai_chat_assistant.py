from anthropic import Anthropic
from dotenv import load_dotenv
import os

load_dotenv()

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SEARCH_TOOL = {
    "name": "search_candidates",
    "description": "Search the candidate database using filters extracted from the recruiter's natural language question.",
    "input_schema": {
        "type": "object",
        "properties": {
            "skill": {
                "type": ["string", "null"],
                "description": "A specific skill or technology mentioned, e.g. 'Python' or 'Flask'. Null if none mentioned."
            },
            "min_experience": {
                "type": ["number", "null"],
                "description": "Minimum years of experience mentioned. Null if not mentioned."
            },
            "status": {
                "type": ["string", "null"],
                "description": "One of 'pending', 'shortlisted', or 'rejected' if mentioned. Null otherwise."
            }
        },
        "required": ["skill", "min_experience", "status"]
    }
}


def interpret_query(user_message: str) -> dict:
    system_prompt = (
        "You translate a recruiter's natural language question into structured "
        "search filters for a candidate database. Extract only what is explicitly "
        "mentioned or clearly implied. Do not guess values that were not stated."
    )

    response = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=500,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
        tools=[SEARCH_TOOL],
        tool_choice={"type": "tool", "name": "search_candidates"}
    )

    tool_use_block = next(
        block for block in response.content if block.type == "tool_use"
    )

    return tool_use_block.input


def summarize_results(user_message: str, candidates: list) -> str:
    system_prompt = (
        "You are a helpful recruiter assistant. Given the recruiter's question and "
        "a list of matching candidates, write a brief, natural, conversational "
        "summary of the results. Mention the count and any notable details. "
        "Do not invent candidates that are not in the provided list."
    )

    candidates_description = "\n".join(
        f"- {c['name']} ({c['experience_years']} years, status: {c['status']})"
        for c in candidates
    ) or "No candidates matched this search."

    user_content = (
        f"Recruiter's question: {user_message}\n\n"
        f"Matching candidates:\n{candidates_description}"
    )

    response = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=500,
        system=system_prompt,
        messages=[{"role": "user", "content": user_content}]
    )

    text_block = next(
        block for block in response.content if block.type == "text"
    )

    return text_block.text