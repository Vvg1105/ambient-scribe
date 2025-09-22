from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class RuleSet(Base):
    __tablename__ = "rule_sets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable = False)
    version = Column(String(20), nullable = False)
    description = Column(Text, nullable = True)
    rules = Column(JSON, nullable = False) # The actual rule definitions
    sha256_hash = Column(String(64), nullable = False, unique = True)
    is_active = Column(Boolean, default = True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
