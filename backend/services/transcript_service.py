from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from .base_service import BaseService
from models.transcript import Transcript

class TranscriptService(BaseService[Transcript]):
    def __init__(self):
        super().__init__(Transcript)
    
    async def get_by_encounter(self, db: AsyncSession, encounter_id: int) -> List[Transcript]:
        """Get all transcripts for an encounter"""
        result = await db.execute(
            select(Transcript).where(Transcript.encounter_id == encounter_id)
        )
        return result.scalars().all()