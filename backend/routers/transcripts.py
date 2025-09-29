from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, HTTPException
from pydantic import HttpUrl
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from typing import List, Optional
import os, tempfile

from core.database import get_db
from services.encounter_service import EncounterService
from services.transcript_service import TranscriptService
from services.soap_service import SOAPService

from dotenv import load_dotenv
load_dotenv()

router = APIRouter()

@router.post("/stt", summary="Batch STT: transcribe auido, save to database, and extract SOAP")
async def transcribe_and_extract_soap(
    patient_id: int = Form(...),
    encounter_type: str = Form(...),
    chief_complaint: Optional[str] = Form(None),
    language: Optional[str] = Form("en"),
    audio: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=401, detail="OpenAI API key is not set")
    
    try:
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        # Transcribe audio
        audio_bytes = await audio.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=audio.filename) as temp_file:
            temp_file.write(audio_bytes)
            temp_path = temp_file.name
        
        with open(temp_path, "rb") as audio_file:

            result = client.audio.transcriptions.create(
                model = os.getenv("STT_MODEL", "gpt-4o-mini-transcribe"),
                file = audio_file,
                response_format = "json",
            )
        
        os.unlink(temp_path)
        
        transcript_text = getattr(result, "text", None) or (result["text"] if isinstance(result, dict) else None)

        if not transcript_text:
            raise HTTPException(status_code=502, detail="Failed to transcribe audio")
        
        # Create encounter
        encounter_service = EncounterService()
        encounter = await encounter_service.create(
            db,
            patient_id=patient_id,
            encounter_type=encounter_type,
            chief_complaint=chief_complaint,
            encounter_date=datetime.now(),
            status="active"
        )

        # Save transcript
        transcript_service = TranscriptService()
        transcript = await transcript_service.create(
            db,
            encounter_id=encounter.id,
            content=transcript_text,
            language=language
        )

        # Extract SOAP note
        soap_service = SOAPService()
        soap_note = await soap_service.extract_and_save_soap(
            db,
            encounter.id,
            transcript_text
        )

        return {
            "encounter_id": encounter.id,
            "patient_id": patient_id,
            "transcript_preview": transcript_text[:200],
        }
    
    except HTTPException:
        raise
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize OpenAI client: {e}")
    
    