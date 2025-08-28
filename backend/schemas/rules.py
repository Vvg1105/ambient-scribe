from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class AntibioticCheckRequest(BaseModel):
    meds: List[str] = Field(default_factory=list, description="Current or planned antibiotics", min_items=0)
    allergies: List[str] = Field(default_factory=list, description="Known allergies", min_items=0)
    planText: Optional[str] = Field(default=None, description="Optional plan text from SOAP for med extraction")


class RuleFinding(BaseModel):
    id: str
    title: str
    severity: Literal["low", "medium", "high"]
    details: str


class AntibioticFindings(BaseModel):
    findings: List[RuleFinding]


