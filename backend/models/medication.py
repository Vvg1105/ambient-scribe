from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    encounter_id = Column(Integer, ForeignKey("encounters.id"), nullable = False)
    generic_name = Column(String(100), nullable = False)
    brand_name = Column(String(100), nullable = True)
    dosage = Column(String(100), nullable = True)
    route = Column(String(50), nullable = True)
    frequency = Column(String(50), nullable = True)
    duration = Column(String(50), nullable = True)
    source = Column(String(20), nullable = True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    encounter = relationship("Encounter", back_populates="medications")