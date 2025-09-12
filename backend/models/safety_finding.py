from sqlachemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlachemy.orm import relationship
from sqlachemy.sql import func
from backend.core.database import Base

class SafetyFinding(Base):
    __tablename__ = "safety_findings"

    id = Column(Integer, primary_key=True, index=True)
    encounter_id = Column(Integer, ForeignKey("encounters.id"), nullable = False)
    finding_id = Column(String(100), nullable = False)
    title = Column(String(100), nullable = False)
    severity = Column(String(20), nullable = False)
    details = Column(Text, nullable = False)
    rule_set_version = Column(String(50), nullable = True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    encounter = relationship("Encounter", back_populates="safety_findings")
    recommendations = relationship("Recommendation", back_populates="safety_findings")