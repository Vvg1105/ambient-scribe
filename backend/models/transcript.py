from sqlachemy import Column, Integer, String, DateTime, Text, ForeignKey, Float, JSON
from sqlachemy.orm import relationship
from sqlachemy.sql import func
from backend.core.database import Base

class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(Integer, primary_key=True, index=True)
    encounter_id = Column(Integer, ForeignKey("encounters.id"), nullable = False)
    content = Column(Text, nullable = False)
    language = Column(String(10), default = "en")
    duration_seconds = Column(Float, nullable = True)
    metadata = Column(JSON, nullable = True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    encounter = relationship("Encounter", back_populates="transcripts")