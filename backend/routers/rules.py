from fastapi import APIRouter, HTTPException
from schemas.rules import AntibioticCheckRequest, AntibioticFindings
from services.antibiotic_rules import check_antibiotics, analyze_antibiotics


router = APIRouter()


@router.post("/antibiotics/check", response_model=AntibioticFindings, tags=["rules"], summary="Check antibiotic rules against allergies")
async def antibiotics_check(req: AntibioticCheckRequest) -> AntibioticFindings:
    # Basic caps to avoid abuse
    if len(req.meds) > 50 or len(req.allergies) > 50:
        raise HTTPException(status_code=400, detail="Too many items in meds/allergies")

    # If only want findings, return deterministic rule results
    return check_antibiotics(req.meds, req.allergies)


@router.post("/antibiotics/analyze", tags=["rules"], summary="Extract meds (optional), run rules, and generate recommendations")
async def antibiotics_analyze(req: AntibioticCheckRequest) -> dict:
    # Basic caps to avoid abuse
    if len(req.meds) > 50 or len(req.allergies) > 50:
        raise HTTPException(status_code=400, detail="Too many items in meds/allergies")

    return analyze_antibiotics(req.meds, req.allergies, req.planText)


