from sqlachemy import Column, Integer, String, DateTime, Text, ForeignKey, Float
from sqlachemy.orm import relationship
from sqlachemy.sql import func
from backend.core.database import Base

class SOAPNoteRecord(Base):
    __tablename__ = "soap_note_records"

    id = Column(Integer, primary_key=True, index=True)
    encounter_id = Column(Integer, ForeignKey("encounters.id"), nullable = False)
    soap_note = Column(Text, nullable = False)
    subjective = Column(Text, nullable = False)
    objective = Column(Text, nullable = False)
    assessment = Column(Text, nullable = False)
    plan = Column(Text, nullable = False)

    # AI Processing Metadata
    model_used = Column(String(50), nullable = True)
    procesisng_time_ms = Column(Integer, nullable = True)
    confidence_score = Column(Float, nullable = True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    encounter = relationship("Encounter", back_populates="soap_note_records")