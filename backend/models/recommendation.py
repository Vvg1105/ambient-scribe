from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    encounter_id = Column(Integer, ForeignKey("encounters.id"), nullable = False)
    safety_finding_id = Column(Integer, ForeignKey("safety_findings.id"), nullable = False)
    finding_id = Column(String(100), nullable = False)
    reason = Column(Text, nullable = False)
    alternatives = Column(JSON, nullable = True) # List of alternative medications
    model_used = Column(String(50), nullable = True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    encounter = relationship("Encounter", back_populates="recommendations")
    safety_finding = relationship("SafetyFinding", back_populates="recommendations")