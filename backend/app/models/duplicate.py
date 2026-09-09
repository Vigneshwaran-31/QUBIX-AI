import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class DuplicateMatch(Base):
    __tablename__ = "duplicate_matches"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=False, index=True)
    matching_application_id = Column(String(36), ForeignKey("applications.id"), nullable=False, index=True)
    
    similarity_score = Column(Float, nullable=False)  # 0 to 100
    matching_fields = Column(JSON, nullable=False)    # list of matched fields: survey, owner, extent, hash
    status = Column(String(50), default="POTENTIAL_DUPLICATE")  # POTENTIAL_DUPLICATE, REVIEWED_FALSE_POSITIVE, CONFIRMED_DUPLICATE
    detected_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    application = relationship("Application", foreign_keys=[application_id], back_populates="duplicate_matches")
    matching_application = relationship("Application", foreign_keys=[matching_application_id])
