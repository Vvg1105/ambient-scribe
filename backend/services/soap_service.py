from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from services.soap_extractor import _extract_with_llm
from models.soap_note_record import SOAPNoteRecord
from sqlalchemy import select

class SOAPService:
    async def extract_and_save_soap(
        self,
        db: AsyncSession,
        encounter_id: int, 
        transcript_content: str,
    ) -> SOAPNoteRecord:
        """Extract SOAP note and save to database"""

        # Extract SOAP note using existing service
        soap_note = _extract_with_llm(transcript_content)

        # Save to database
        soap_record = SOAPNoteRecord(
            encounter_id=encounter_id,
            soap_note=f"{soap_note.subjective}\n{soap_note.objective}\n{soap_note.assessment}\n{soap_note.plan}",
            subjective=soap_note.subjective,
            objective=soap_note.objective,
            assessment=soap_note.assessment,
            plan=soap_note.plan,
            model_used="gpt-4o-mini"
        )

        db.add(soap_record)
        await db.commit()
        await db.refresh(soap_record)
        
        return soap_record
    
    async def get_by_encounter(self, db: AsyncSession, encounter_id: int) -> SOAPNoteRecord:
        """Get SOAP note by encounter ID"""
        result = await db.execute(select(SOAPNoteRecord).where(SOAPNoteRecord.encounter_id == encounter_id))
        return result.scalar_one_or_none()