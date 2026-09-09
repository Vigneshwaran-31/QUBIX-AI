from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime

class DocumentExtractionResponse(BaseModel):
    id: str
    document_id: str
    survey_number: Optional[str] = None
    subdivision_number: Optional[str] = None
    owner_name: Optional[str] = None
    previous_owner_name: Optional[str] = None
    property_extent: Optional[str] = None
    village: Optional[str] = None
    taluk: Optional[str] = None
    district: Optional[str] = None
    document_number: Optional[str] = None
    registration_number: Optional[str] = None
    registration_date: Optional[str] = None
    property_address: Optional[str] = None
    boundaries: Optional[str] = None
    raw_extracted_fields: Optional[Dict[str, Any]] = None
    extraction_confidence: float
    extracted_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DocumentResponse(BaseModel):
    id: str
    application_id: str
    document_type: str
    file_name: str
    file_path: str
    file_hash: str
    file_size: int
    mime_type: str
    ocr_status: str
    classification_confidence: float
    uploaded_at: datetime
    processed_at: Optional[datetime] = None
    extraction: Optional[DocumentExtractionResponse] = None

    model_config = ConfigDict(from_attributes=True)

class DocumentClassificationResult(BaseModel):
    document_type: str
    confidence: float
    explanation: str
