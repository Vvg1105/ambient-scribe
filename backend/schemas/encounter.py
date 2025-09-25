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