from pydantic import BaseModel, Field
from typing import List

class MedExtractionResult(BaseModel):
    meds: List[str] = Field(default_factory=list, description="List of medications")

# Augmentation for findings: rationale + alternatives
class RuleRecommendation(BaseModel):
    findingId: str
    reason: str
    alternatives: List[str] = Field(default_factory=list, description="List of alternative medications")

class RuleRecommendationList(BaseModel):
    recommendations: List[RuleRecommendation] = Field(default_factory=list, description="List of rule recommendations")

