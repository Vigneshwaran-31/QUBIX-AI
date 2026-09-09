import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class VerificationResult(Base):
    __tablename__ = "verification_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String(36), ForeignKey("applications.id"), unique=True, nullable=False, index=True)
    
    overall_risk_score = Column(Float, default=0.0)  # 0 to 100
    risk_category = Column(String(50), default="LOW")  # LOW (0-20), MEDIUM (21-50), HIGH (51-75), CRITICAL (76-100)
    total_checks = Column(Integer, default=0)
    total_conflicts = Column(Integer, default=0)
    
    ai_explanation_summary = Column(Text, nullable=True)
    verified_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    application = relationship("Application", back_populates="verification_result")
    issues = relationship("VerificationIssue", back_populates="verification_result", cascade="all, delete-orphan")


class VerificationIssue(Base):
    __tablename__ = "verification_issues"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    verification_result_id = Column(String(36), ForeignKey("verification_results.id"), nullable=False, index=True)
    
    field_name = Column(String(100), nullable=False)  # e.g., "Survey Number", "Owner Name", "Property Extent"
    severity = Column(String(50), nullable=False)    # CRITICAL, HIGH, MEDIUM, LOW
    document_a_type = Column(String(50), nullable=True)
    document_b_type = Column(String(50), nullable=True)
    value_a = Column(String(255), nullable=True)
    value_b = Column(String(255), nullable=True)
    explanation = Column(Text, nullable=False)
    confidence = Column(Float, default=1.0)
    risk_points = Column(Integer, default=0)
    status = Column(String(50), default="OPEN")  # OPEN, RESOLVED, DISMISSED

    # Relationships
    verification_result = relationship("VerificationResult", back_populates="issues")
