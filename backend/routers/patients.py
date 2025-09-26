from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List


from core.database import get_db
from services.patient_service import PatientService
from schemas.patient import PatientCreate, PatientUpdate, Patient

router = APIRouter()

@router.post("/", response_model=Patient, tags=["patients"], summary="Create a new patient")
async def create_patient(
    patient: PatientCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new patient"""
    service = PatientService()

    # Check if MRN already exists
    if patient.medical_record_number:
        existing = await service.get_by_medical_record_number(db, patient.medical_record_number)
        if existing:
            raise HTTPException(status_code=400, detail="Medical record number already exists")

    # Create patient
    return await service.create(db, **patient.model_dump())

@router.get("/{patient_id}", response_model=Patient, tags=["patients"], summary="Get a patient by ID")
async def get_patient(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
) -> Patient:
    """Get a patient by ID"""
    service = PatientService()
    patient = await service.get(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return patient


@router.get("/", response_model=List[Patient], tags=["patients"], summary="Get all patients")
async def list_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: str = Query(None, description="Search by name"),
    db: AsyncSession = Depends(get_db),
):
    """List patients with optional search"""
    service = PatientService()

    if search:
        return await service.search_patients(db, search)
    else:
        return await service.get_all(db, skip, limit)

@router.put("/{patient_id}", response_model=Patient, tags=["patients"], summary="Update a patient by ID")
async def update_patient(
    patient_id: int,
    patient: PatientUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a patient by ID"""
    service = PatientService()

    # Check if patient exists
    existing = await service.get(db, patient_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Check if MRN already exists
    if patient.medical_record_number:
        existing = await service.get_by_medical_record_number(db, patient.medical_record_number)
        if existing and existing.id != patient_id:
            raise HTTPException(status_code=400, detail="Medical record number already exists")

    updated = await service.update(db, patient_id, **patient.model_dump())
    return updated