from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class EncounterBase(BaseModel):
    encounter_type: str = Field(..., min_length=1, max_length=50)
    chief_complaint: Optional[str] = None
    status: str = Field(default="active", max_length = 20)
    encounter_date: datetime

class EncounterCreate(EncounterBase):
    patient_id: int

class EncounterUpdate(BaseModel):
    encounter_type: Optional[str] = Field(None, min_length=1, max_length=50)
    chief_complaint: Optional[str] = None
    status: Optional[str] = Field(None, max_length=20)
    encounter_date: Optional[datetime] = None

class Encounter(EncounterBase):
    id: int
    patient_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Transcript schema for nested data
class TranscriptInEncounter(BaseModel):
    id: int
    content: str
    language: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# SOAP Note schema for nested data
class SOAPNoteInEncounter(BaseModel):
    id: int
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

# Patient info for nested data
class PatientInEncounter(BaseModel):
    id: int
    first_name: str
    last_name: str
    date_of_birth: Optional[datetime] = None
    medical_record_number: Optional[str] = None

    class Config:
        from_attributes = True

# Detailed encounter with all related data
class EncounterDetail(Encounter):
    patient: Optional[PatientInEncounter] = None
    transcripts: List[TranscriptInEncounter] = []
    soap_notes: List[SOAPNoteInEncounter] = []

    class Config:
        from_attributes = True