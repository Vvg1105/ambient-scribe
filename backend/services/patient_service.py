from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from .base_service import BaseService
from models.patient import Patient
from models.encounter import Encounter

class PatientService(BaseService[Patient]):
    def __init__(self):
        super().__init__(Patient)
    
    async def get_by_medical_record_number(self, db: AsyncSession, medical_record_number: str) -> Optional[Patient]:
        """Get a patient by their medical record number"""
        result = await db.execute(select(Patient).where(Patient.medical_record_number == medical_record_number))
        return result.scalar_one_or_none()
    
    async def get_with_encounters(self, db: AsyncSession, id: int) -> Optional[Patient]:
        """Get patient with all encounters"""
        result = await db.execute(
            select(Patient)
            .options(selectinload(Patient.encounters))
            .where(Patient.id == id)
        )
        return result.scalar_one_or_none()

    async def search_patients(self, db: AsyncSession, query: str) -> List[Patient]:
        """Search patients by name"""
        result = await db.execute(
            select(Patient).where(
                Patient.first_name.ilike(f"%{query}%") | 
                Patient.last_name.ilike(f"%{query}%")
            )
        )
        return result.scalars().all()