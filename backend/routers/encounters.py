from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime

from core.database import get_db
from services.encounter_service import EncounterService
from services.patient_service import PatientService
from schemas.encounter import (
    Encounter,
    EncounterCreate,
    EncounterUpdate,
    EncounterDetail,
)

router = APIRouter()


@router.get("/", response_model=List[EncounterDetail], tags=["encounters"])
async def list_encounters(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    patient_id: Optional[int] = Query(None, description="Filter by patient ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    encounter_type: Optional[str] = Query(None, description="Filter by encounter type"),
    db: AsyncSession = Depends(get_db),
):
    """
    List all encounters with optional filters.
    Returns encounters with patient info, transcripts, and SOAP notes.
    """
    from models.encounter import Encounter as EncounterModel
    
    query = select(EncounterModel).options(
        selectinload(EncounterModel.patient),
        selectinload(EncounterModel.transcripts),
        selectinload(EncounterModel.soap_notes),
    )
    
    # Apply filters
    if patient_id:
        query = query.where(EncounterModel.patient_id == patient_id)
    if status:
        query = query.where(EncounterModel.status == status)
    if encounter_type:
        query = query.where(EncounterModel.encounter_type == encounter_type)
    
    # Order by most recent first
    query = query.order_by(EncounterModel.encounter_date.desc())
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    encounters = result.scalars().all()
    
    return encounters


@router.get("/{encounter_id}", response_model=EncounterDetail, tags=["encounters"])
async def get_encounter(
    encounter_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Get a single encounter by ID with all related data.
    """
    from models.encounter import Encounter as EncounterModel
    
    query = select(EncounterModel).options(
        selectinload(EncounterModel.patient),
        selectinload(EncounterModel.transcripts),
        selectinload(EncounterModel.soap_notes),
    ).where(EncounterModel.id == encounter_id)
    
    result = await db.execute(query)
    encounter = result.scalar_one_or_none()
    
    if not encounter:
        raise HTTPException(status_code=404, detail="Encounter not found")
    
    return encounter


@router.post("/", response_model=Encounter, tags=["encounters"])
async def create_encounter(
    encounter: EncounterCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new encounter.
    """
    # Verify patient exists
    patient_service = PatientService()
    patient = await patient_service.get(db, encounter.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Create encounter
    encounter_service = EncounterService()
    return await encounter_service.create(db, **encounter.model_dump())


@router.put("/{encounter_id}", response_model=Encounter, tags=["encounters"])
async def update_encounter(
    encounter_id: int,
    encounter_update: EncounterUpdate,
    db: AsyncSession = Depends(get_db),
):
    """
    Update an encounter.
    """
    encounter_service = EncounterService()
    
    # Check if encounter exists
    existing = await encounter_service.get(db, encounter_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Encounter not found")
    
    # Update only provided fields
    update_data = encounter_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    updated = await encounter_service.update(db, encounter_id, **update_data)
    return updated


@router.delete("/{encounter_id}", tags=["encounters"])
async def delete_encounter(
    encounter_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Delete an encounter (soft delete by setting status to 'deleted').
    """
    encounter_service = EncounterService()
    
    # Check if encounter exists
    existing = await encounter_service.get(db, encounter_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Encounter not found")
    
    # Soft delete
    await encounter_service.update(db, encounter_id, status="deleted")
    
    return {"message": "Encounter deleted successfully"}


@router.get("/patient/{patient_id}/encounters", response_model=List[EncounterDetail], tags=["encounters"])
async def get_patient_encounters(
    patient_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all encounters for a specific patient.
    """
    # Verify patient exists
    patient_service = PatientService()
    patient = await patient_service.get(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    from models.encounter import Encounter as EncounterModel
    
    query = select(EncounterModel).options(
        selectinload(EncounterModel.patient),
        selectinload(EncounterModel.transcripts),
        selectinload(EncounterModel.soap_notes),
    ).where(EncounterModel.patient_id == patient_id)
    
    query = query.order_by(EncounterModel.encounter_date.desc())
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    encounters = result.scalars().all()
    
    return encounters

