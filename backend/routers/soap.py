from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import logging
import time
from datetime import datetime

from core.database import get_db
from schemas.soap import (
    SOAPExtractReq,
    SOAPNote,
    SOAPExtractAndSaveReq,
    SOAPNoteRecord,
    EncounterWithSOAP,
)
from services.soap_extractor import (
    extract_soap_note,
    LLMTimeoutError,
    LLMRateLimitError,
    LLMOverloadedError,
)
from services.soap_service import SOAPService
from services.encounter_service import EncounterService
from services.transcript_service import TranscriptService
from services.patient_service import PatientService
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

@router.post("/extract-and-save", response_model=EncounterWithSOAP, tags=["soap"], summary="Extract SOAP note and save to database")
async def extract_and_save(
    req: SOAPExtractAndSaveReq,
    db: AsyncSession = Depends(get_db)
) -> EncounterWithSOAP:
    """
    Extract SOAP note from transcript and save everything to database:
    1. Create encounter for patient
    2. Save transcript
    3. Extract SOAP note
    4. Save SOAP note to database
    """
    start_time = time.time()
    
    # Validate patient exists
    patient_service = PatientService()
    patient = await patient_service.get(db, req.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Validate transcript
    if not req.transcript or len(req.transcript) < 20:
        raise HTTPException(status_code=400, detail="Transcript must be at least 20 characters")
    
    # Check API key
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=401, detail="OpenAI API key is not set")
    
    try:
        # 1. Create encounter
        encounter_service = EncounterService()
        encounter = await encounter_service.create(
            db,
            patient_id=req.patient_id,
            encounter_type=req.encounter_type,
            chief_complaint=req.chief_complaint,
            encounter_date=req.encounter_date or datetime.now(),
            status="active"
        )
        
        # 2. Save transcript
        transcript_service = TranscriptService()
        transcript = await transcript_service.create(
            db,
            encounter_id=encounter.id,
            content=req.transcript,
            language="en"
        )
        
        # 3. Extract SOAP note
        soap_note = extract_soap_note(req.transcript)
        
        # 4. Save SOAP note to database
        soap_service = SOAPService()
        soap_record = await soap_service.extract_and_save_soap(
            db,
            encounter.id,
            req.transcript
        )
        
        processing_time = int((time.time() - start_time) * 1000)
        
        # Return complete encounter with related data
        return EncounterWithSOAP(
            id=encounter.id,
            patient_id=encounter.patient_id,
            encounter_type=encounter.encounter_type,
            chief_complaint=encounter.chief_complaint,
            status=encounter.status,
            encounter_date=encounter.encounter_date,
            created_at=encounter.created_at,
            transcript_content=transcript.content,
            soap_note=SOAPNoteRecord(
                id=soap_record.id,
                encounter_id=soap_record.encounter_id,
                soap_note=soap_record.soap_note,
                subjective=soap_record.subjective,
                objective=soap_record.objective,
                assessment=soap_record.assessment,
                plan=soap_record.plan,
                model_used=soap_record.model_used,
                processing_time_ms=processing_time,
                confidence_score=soap_record.confidence_score,
                created_at=soap_record.created_at
            )
        )
        
    except (LLMTimeoutError, LLMRateLimitError, LLMOverloadedError) as e:
        # If SOAP extraction fails, we still have the encounter and transcript
        logging.error(f"SOAP extraction failed for encounter {encounter.id}: {e}")
        raise HTTPException(status_code=500, detail=f"SOAP extraction failed: {str(e)}")
    except Exception as e:
        logging.error(f"Error in extract_and_save: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/encounter/{encounter_id}/soap", response_model=SOAPNoteRecord, tags=["soap"])
async def get_soap_note(
    encounter_id: int,
    db: AsyncSession = Depends(get_db)
) -> SOAPNoteRecord:
    """Get SOAP note for a specific encounter"""
    soap_service = SOAPService()
    soap_record = await soap_service.get_by_encounter(db, encounter_id)
    
    if not soap_record:
        raise HTTPException(status_code=404, detail="SOAP note not found for this encounter")
    
    return SOAPNoteRecord(
        id=soap_record.id,
        encounter_id=soap_record.encounter_id,
        soap_note=soap_record.soap_note,
        subjective=soap_record.subjective,
        objective=soap_record.objective,
        assessment=soap_record.assessment,
        plan=soap_record.plan,
        model_used=soap_record.model_used,
        processing_time_ms=soap_record.processing_time_ms,
        confidence_score=soap_record.confidence_score,
        created_at=soap_record.created_at
    )