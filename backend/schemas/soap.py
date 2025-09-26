from typing import List, Literal, Optional
from pydantic import BaseModel, field_validator, Field
from datetime import datetime

class SOAPExtractReq(BaseModel):
    transcript: str = Field(..., description = "Transcript of the session")

class SOAPNote(BaseModel):
    subjective: str
    objective: str
    assessment: str
    plan: str

# New schemas for database integration
class SOAPExtractAndSaveReq(BaseModel):
    patient_id: int = Field(..., description = "Patient ID")
    encounter_type: str = Field(..., description = "Type of encounter (e.g., 'consultation', 'follow-up')")
    transcript: str = Field(..., description = "Transcript of the session")
    chief_complaint: Optional[str] = Field(None, description = "Chief complaint")
    encounter_date: Optional[datetime] = Field(None, description = "Encounter date (defaults to now)")

class SOAPNoteRecord(BaseModel):
    id: int
    encounter_id: int
    soap_note: str
    subjective: str
    objective: str
    assessment: str
    plan: str
    model_used: Optional[str] = None
    processing_time_ms: Optional[int] = None
    confidence_score: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True

class EncounterWithSOAP(BaseModel):
    id: int
    patient_id: int
    encounter_type: str
    chief_complaint: Optional[str] = None
    status: str
    encounter_date: datetime
    created_at: datetime

    # Related data
    transcript_content: Optional[str] = None
    soap_note: Optional[SOAPNoteRecord] = None

    class Config:
        from_attributes = True
    