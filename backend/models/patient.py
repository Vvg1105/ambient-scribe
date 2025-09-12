from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from sqlachemy.sql import func
from backend.core.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable = False)
    last_name = Column(String(100), nullable = False)
    date_of_birth = Column(DateTime, nullable = True)
    medical_record_number = Column(String(50), unique = True, nullable = True)
    notes = Column(Text, nullable = True)

    # Timestamps
    created_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True))

    # Relationships
    encounters = relationship("Encounter", back_populates="patient")
    allergies = relationship("Allergy", back_populates="patient")
