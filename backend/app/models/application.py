import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_number = Column(String(100), unique=True, index=True, nullable=False)
    applicant_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    applicant_name = Column(String(255), nullable=False)
    applicant_phone = Column(String(50), nullable=True)
    applicant_email = Column(String(255), nullable=True)
    
    district = Column(String(100), nullable=False, index=True)
    taluk = Column(String(100), nullable=False)
    village = Column(String(100), nullable=False)
    primary_survey_no = Column(String(50), nullable=False, index=True)
    subdivision_number = Column(String(50), nullable=True)
    property_extent = Column(String(100), nullable=True)
    
    status = Column(String(50), default="SUBMITTED", index=True)  # DRAFT, SUBMITTED, PROCESSING, VERIFIED, NEEDS_CORRECTION, ESCALATED
    risk_score = Column(Float, default=0.0)
    risk_level = Column(String(50), default="PENDING")  # PENDING, LOW, MEDIUM, HIGH, CRITICAL
    
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    applicant = relationship("User", backref="applications")
    documents = relationship("Document", back_populates="application", cascade="all, delete-orphan")
    verification_result = relationship("VerificationResult", back_populates="application", uselist=False, cascade="all, delete-orphan")
    duplicate_matches = relationship("DuplicateMatch", foreign_keys="DuplicateMatch.application_id", back_populates="application", cascade="all, delete-orphan")
    reviews = relationship("OfficerReview", back_populates="application", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="application", cascade="all, delete-orphan")
