import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class OfficerReview(Base):
    __tablename__ = "officer_reviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=False, index=True)
    officer_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    
    decision = Column(String(50), nullable=False)  # VERIFIED, REQUEST_CORRECTION, ESCALATE
    comments = Column(Text, nullable=False)
    reviewed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    application = relationship("Application", back_populates="reviews")
    officer = relationship("User")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    
    action = Column(String(100), nullable=False)  # e.g., "UPLOAD_DOCUMENT", "RUN_VERIFICATION", "OFFICER_REVIEW"
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    application = relationship("Application", back_populates="audit_logs")
    user = relationship("User")
