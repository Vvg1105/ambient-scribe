from fastapi import APIRouter, HTTPException
import logging
from backend.schemas.soap import SOAPExtractReq, SOAPNote
from backend.services.soap_extractor import (
    extract_soap_note,
    LLMTimeoutError,
    LLMRateLimitError,
    LLMOverloadedError,
)
import os

router = APIRouter()

@router.post("/extract", response_model=SOAPNote, tags=["soap"], summary="Extract SOAP note from transcript")
async def extract(req: SOAPExtractReq) -> SOAPNote:
    """
    Extracts the SOAP note from the transcript
    """

    if not req.transcript:
        raise HTTPException(status_code=400, detail="Transcript is required")
    
    if len(req.transcript) < 20:
        raise HTTPException(status_code=400, detail="Transcript must be at least 20 characters")

    # Privacy-aware logging: log only length and a short hash (no content)
    length = len(req.transcript)
    short_hash = hex(abs(hash(req.transcript)) % (1 << 32))
    logging.info("SOAP extract request received length=%d hash=%s", length, short_hash)
    
    # Missing API key check
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=401, detail="OpenAI API key is not set")

    try:
        return extract_soap_note(req.transcript)
    except LLMTimeoutError as e:
        logging.warning("SOAP extraction timeout length=%d hash=%s", length, short_hash)
        raise HTTPException(status_code=504, detail="LLM timeout") from e
    except LLMRateLimitError as e:
        logging.warning("SOAP extraction rate-limited length=%d hash=%s", length, short_hash)
        raise HTTPException(status_code=429, detail="LLM rate limit exceeded") from e
    except LLMOverloadedError as e:
        logging.warning("SOAP extraction overloaded length=%d hash=%s", length, short_hash)
        raise HTTPException(status_code=502, detail="LLM service overloaded") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
