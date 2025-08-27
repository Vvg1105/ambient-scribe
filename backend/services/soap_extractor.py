from backend.schemas.soap import SOAPNote
from openai import OpenAI
import openai
import httpx
from dotenv import load_dotenv
import os
import json
import logging

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class LLMTimeoutError(Exception):
    pass


class LLMRateLimitError(Exception):
    pass


class LLMOverloadedError(Exception):
    pass

def extract_soap_note(transcript: str) -> SOAPNote:
    """
    Extracts the SOAP note from the transcript
    """
    logging.info("Extracting SOAP note from transcript (length=%d)", len(transcript or ""))

    # Guard: empty/whitespace-only transcripts return a safe default
    if not transcript or not transcript.strip():
        return SOAPNote(
            subjective="No subjective details provided.",
            objective="No objective findings provided.",
            assessment="No assessment provided.",
            plan="No plan provided."
        )

    attempts = 1
    extractor = os.getenv("SOAP_EXTRACTOR_IMPL", "llm")

    while attempts <= 3:
        try:
            if extractor == "llm":
                return _extract_with_llm(transcript)
            elif extractor == "manual":
                return _extract_with_manual(transcript)
            else:
                raise ValueError(f"Invalid extractor: {extractor}")
        except (LLMTimeoutError, LLMRateLimitError, LLMOverloadedError) as e:
            # Re-raise known errors so router can map to proper status codes
            raise
        except Exception as e:
            logging.warning("SOAP extraction attempt %d failed: %s", attempts, e)
            attempts += 1
            logging.info("Retrying SOAP extraction (attempt %d of 3)", attempts)
            continue
    
    raise Exception("Failed to extract SOAP note after 3 attempts")


def _extract_with_llm(transcript: str) -> SOAPNote:
    """
    Extracts the SOAP note from the transcript using the LLM
    """
    prompt = f"""
    You are a SOAP (subjective, objective, assessment, plan) note extractor. You will be given a transcript of a session that is between
    a patient and a doctor in Kenya. Your task is to extract the SOAP note from the transcript. Only 
    output JSON matching (subjective, objective, assessment, plan). No prose. Always populate all four fields with concise sentences. 
    If info is missing, write ‘Not explicitly stated in transcript.’ Never leave fields empty.
    """

    user_prompt = (
        "Transcript:\n"
        f"{transcript}\n\n"
        "Produce strictly this JSON object: {\"subjective\": \"...\", \"objective\": \"...\", \"assessment\": \"...\", \"plan\": \"...\"}"
    )

    # Build strict JSON schema and disallow additional properties
    schema = SOAPNote.model_json_schema()
    if isinstance(schema, dict):
        schema.setdefault("additionalProperties", False)

    try:
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "soap_note",
                    "strict": True,
                    "schema": schema,
                },
            },
            max_tokens=int(os.getenv("SOAP_EXTRACTOR_MAX_TOKENS", "300")),
            timeout=20,
        )
    except httpx.TimeoutException as e:
        raise LLMTimeoutError("LLM request timed out") from e
    except openai.RateLimitError as e:
        raise LLMRateLimitError("LLM rate limit exceeded") from e
    except openai.APIStatusError as e:
        # Map 5xx to overloaded
        status = getattr(e, "status_code", None)
        if status and 500 <= int(status) <= 599:
            raise LLMOverloadedError(f"LLM service overloaded (status {status})") from e
        raise

    content = response.choices[0].message.content
    try:
        # Validate strictly against the Pydantic model
        return SOAPNote.model_validate_json(content)
    except Exception:
        # Some models sometimes wrap JSON in code fences; attempt to strip
        cleaned = content.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`\n").strip()
            # If there's a language tag, remove the first line
            if "\n" in cleaned:
                cleaned = "\n".join(cleaned.splitlines()[1:])
        return SOAPNote.model_validate_json(cleaned)

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