from typing import List, Literal, Optional
from pydantic import BaseModel, field_validator, Field

class SOAPExtractReq(BaseModel):
    transcript: str = Field(..., description = "Transcript of the session")

class SOAPNote(BaseModel):
    subjective: str
    objective: str
    assessment: str
    plan: str
