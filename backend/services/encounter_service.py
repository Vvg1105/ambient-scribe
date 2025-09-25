from tkinter import E
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime

from .base_service import BaseService
from models.encounter import Encounter
from models.transcript import Transcript
from models.soap_note_record import SOAPNoteRecord
from services.transcript_service import TranscriptService

class EncounterService(BaseService[Encounter]):
    def __init__(self):
        super().__init__(Encounter)
    
    async def get_by_patient_id(self, db: AsyncSession, patient_id: int) -> List[Encounter]:
        """Get all encounters for a patient"""
        result = await db.execute(
            select(Encounter)
            .where(Encounter.patient_id == patient_id)
            .order_by(Encounter.encounter_date.desc())
        )
        return result.scalars().all()
    
    async def get_with_transcript_and_soap_note(self, db: AsyncSession, id: int) -> Optional[Encounter]:
        """Get encounter with transcript and soap note"""
        result = await db.execute(
            select(Encounter)
            .options(selectinload(Encounter.transcripts), selectinload(Encounter.soap_notes))
            .where(Encounter.id == id)
        )
        return result.scalar_one_or_none()

    async def create_encounter_with_transcript(
        self, 
        db: AsyncSession,
        patient_id: int,
        encounter_type: str, 
        transcript_content: str,
        **encounter_kwargs
    ) -> Encounter:
        """Create encounter and transcript in one transaction"""
        # Create encounter
        encounter = await self.create(
                db,
                patient_id=patient_id,
                encounter_type=encounter_type,
                encounter_date=datetime.now(),
                **encounter_kwargs
            )

        # Create transcript
        transcript_service = TranscriptService()
        await transcript_service.create(
            db,
            encounter_id=encounter.id,
            content=transcript_content,
        )
        
        return encounter