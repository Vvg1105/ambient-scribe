from backend.schemas.soap import SOAPExtractReq, SOAPNote
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def extract_soap_note(transcript: str) -> SOAPNote:
    """
    Extracts the SOAP note from the transcript
    """
    extractor = os.getenv("SOAP_EXTRACTOR_IMPL", "llm")
    if extractor == "llm":
        return _extract_with_llm(transcript)
    elif extractor == "manual":
        return _extract_with_manual(transcript)
    else:
        raise ValueError(f"Invalid extractor: {extractor}")


def _extract_with_llm(transcript: str) -> SOAPNote:
    """
    Extracts the SOAP note from the transcript using the LLM
    """
    prompt = f"""
    You are a SOAP (subjective, objective, assessment, plan) note extractor. You will be given a transcript of a session that is between
    a patient and a doctor in Kenya. Your task is to extract the SOAP note from the transcript. Only 
    output JSON matching (subjective, objective, assessment, plan). No prose.
    """

    user_prompt = f"""
    Transcript:
    {transcript}

    Produce strictly {{"subjective": "...", "objective": "...", "assessment": "...", "plan": "..."}}
    """

    response = client.chat.completions.create(
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature = 0.2,
        response_format = {"type":"json_schema","json_schema":{"name":"soap_note","schema": SOAPNote.model_json_schema()}},
        max_tokens = os.getenv("SOAP_EXTRACTOR_MAX_TOKENS", 1000),
    )

    return SOAPNote.model_validate_json(response.choices[0].message.content)

def _extract_with_manual(transcript: str) -> SOAPNote:
    """
    Extracts the SOAP note from the transcript using the manual method
    """
    return SOAPNote(
        subjective = "...",
        objective = "...",
        assessment = "...",
        plan = "..."
    )