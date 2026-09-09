from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.schemas.document import DocumentResponse

class ApplicationBase(BaseModel):
    applicant_name: str
    applicant_phone: Optional[str] = None
    applicant_email: Optional[str] = None
    district: str
    taluk: str
    village: str
    primary_survey_no: str
    subdivision_number: Optional[str] = None
    property_extent: Optional[str] = None
    notes: Optional[str] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    applicant_name: Optional[str] = None
    applicant_phone: Optional[str] = None
    applicant_email: Optional[str] = None
    district: Optional[str] = None
    taluk: Optional[str] = None
    village: Optional[str] = None
    primary_survey_no: Optional[str] = None
    subdivision_number: Optional[str] = None
    property_extent: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class VerificationIssueResponse(BaseModel):
    id: str
    field_name: str
    severity: str
    document_a_type: Optional[str] = None
    document_b_type: Optional[str] = None
    value_a: Optional[str] = None
    value_b: Optional[str] = None
    explanation: str
    confidence: float
    risk_points: int
    status: str

    model_config = ConfigDict(from_attributes=True)

class VerificationResultResponse(BaseModel):
    id: str
    application_id: str
    overall_risk_score: float
    risk_category: str
    total_checks: int
    total_conflicts: int
    ai_explanation_summary: Optional[str] = None
    verified_at: datetime
    issues: List[VerificationIssueResponse] = []

    model_config = ConfigDict(from_attributes=True)

class DuplicateMatchResponse(BaseModel):
    id: str
    application_id: str
    matching_application_id: str
    similarity_score: float
    matching_fields: List[str]
    status: str
    detected_at: datetime
    matching_application_number: Optional[str] = None
    matching_applicant_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class OfficerReviewResponse(BaseModel):
    id: str
    application_id: str
    officer_id: str
    officer_name: Optional[str] = None
    decision: str
    comments: str
    reviewed_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AuditLogResponse(BaseModel):
    id: str
    application_id: Optional[str] = None
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    action: str
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    details: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ApplicationResponse(ApplicationBase):
    id: str
    application_number: str
    applicant_id: Optional[str] = None
    status: str
    risk_score: float
    risk_level: str
    created_at: datetime
    updated_at: datetime
    documents: List[DocumentResponse] = []
    verification_result: Optional[VerificationResultResponse] = None
    duplicate_matches: List[DuplicateMatchResponse] = []
    reviews: List[OfficerReviewResponse] = []

    model_config = ConfigDict(from_attributes=True)

class ApplicationSummary(BaseModel):
    id: str
    application_number: str
    applicant_name: str
    district: str
    primary_survey_no: str
    documents_count: int
    risk_score: float
    risk_level: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
