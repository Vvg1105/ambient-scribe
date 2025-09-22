from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class Encounter(Base):
    __tablename__ = "encounters"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable = False)
    encounter_type = Column(String(50), nullable = False)
    chief_complaint = Column(Text, nullable = True)
    status = Column(String(20), default = "active")

    # Timestamps
    encounter_date = Column(DateTime(timezone=True), nullable = False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    patient = relationship("Patient", back_populates="encounters")
    transcripts = relationship("Transcript", back_populates="encounter")
    soap_notes = relationship("SOAPNoteRecord", back_populates="encounter")
    medications = relationship("Medication", back_populates="encounter")
    safety_findings = relationship("SafetyFinding", back_populates="encounter")
    recommendations = relationship("Recommendation", back_populates="encounter")