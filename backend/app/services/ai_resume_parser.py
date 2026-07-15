#from openai import OpenAI
from anthropic import Anthropic
from dotenv import load_dotenv
import os
import json

load_dotenv()
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

EXTRACTION_TOOL={
  "name":"extract_resume_data",
  "description":"Extract structured candidate information from resume text",
  "input_schema":{
    "type":"object",
    "properties":{
        "name":{"type":["string","null"]},
        "email":{"type":["string","null"]},
        "phone":{"type":["string","null"]},
        "skills":{
            "type":"array",
            "items":{"type":"string"}
        },
        "experience_years":{"type":"number"},
        "education":{"type":["string","null"]},
        "certifications":{
            "type":"array",
            "items":{"type":"string"}
        },
        "projects":{
            "type":"array",
            "items":{"type":"string"}
        }
    },
    "required":[
        "name","email","phone","skills",
        "experience_years","education",
        "certifications","projects"
    ],
    "additionalProperties":False
}
}


def extract_resume_data(raw_text:str)->dict:
    system_prompt=(
        "You are a resume parsing assistant. Extract structured information "
        "from the resume text provided. If a field cannot be found, use null "
        "for text fields, 0 for experience_years, and an empty array for lists. "
        "Do not invent or guess information that isn't present in the text."
    )

    response=client.messages.create(
        model="claude-sonnet-5",
        max_tokens=2000,
        system=system_prompt,
        messages=[
            {"role":"user","content":raw_text}
        ],
        tools=[EXTRACTION_TOOL],
        tool_choice={"type":"tool","name":"extract_resume_data"}
    )
    tool_use_block = next(
        block for block in response.content if block.type == "tool_use"
    )

    extracted_data = tool_use_block.input

    return extracted_data