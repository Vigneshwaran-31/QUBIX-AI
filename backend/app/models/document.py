import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=False, index=True)
    
    document_type = Column(String(50), default="UNKNOWN")  # PATTA, CHITTA, EC, SALE_DEED, UNKNOWN
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_hash = Column(String(64), nullable=False, index=True)  # SHA-256
    file_size = Column(Integer, default=0)
    mime_type = Column(String(100), default="application/pdf")
    
    ocr_status = Column(String(50), default="PENDING")  # PENDING, PROCESSING, COMPLETED, FAILED
    ocr_text = Column(Text, nullable=True)
    classification_confidence = Column(Float, default=0.0)
    
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)

    # Relationships
    application = relationship("Application", back_populates="documents")
    extraction = relationship("DocumentExtraction", back_populates="document", uselist=False, cascade="all, delete-orphan")


class DocumentExtraction(Base):
    __tablename__ = "document_extractions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id"), unique=True, nullable=False, index=True)
    
    survey_number = Column(String(50), nullable=True, index=True)
    subdivision_number = Column(String(50), nullable=True)
    owner_name = Column(String(255), nullable=True, index=True)
    previous_owner_name = Column(String(255), nullable=True)
    property_extent = Column(String(100), nullable=True)
    
    village = Column(String(100), nullable=True)
    taluk = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    
    document_number = Column(String(100), nullable=True, index=True)
    registration_number = Column(String(100), nullable=True)
    registration_date = Column(String(50), nullable=True)
    transaction_details = Column(Text, nullable=True)
    property_address = Column(Text, nullable=True)
    boundaries = Column(Text, nullable=True)
    
    raw_extracted_fields = Column(JSON, nullable=True)
    extraction_confidence = Column(Float, default=0.0)
    extracted_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    document = relationship("Document", back_populates="extraction")
