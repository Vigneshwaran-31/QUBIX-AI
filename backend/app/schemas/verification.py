from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class CrossDocFieldEntry(BaseModel):
    value: Optional[str] = None
    document_type: str
    is_conflicting: bool = False

class CrossDocComparisonRow(BaseModel):
    field_key: str
    field_label: str
    patta: Optional[str] = "—"
    chitta: Optional[str] = "—"
    ec: Optional[str] = "—"
    sale_deed: Optional[str] = "—"
    status: str  # MATCH, PARTIAL, CONFLICT, NOT_AVAILABLE
    severity: Optional[str] = None
    explanation: Optional[str] = None

class CrossDocComparisonMatrix(BaseModel):
    application_id: str
    application_number: str
    rows: List[CrossDocComparisonRow]
    overall_status: str
    total_conflicts: int

class OfficerReviewCreate(BaseModel):
    decision: str  # VERIFIED, REQUEST_CORRECTION, ESCALATE
    comments: str

class DashboardStats(BaseModel):
    total_applications: int
    pending_verification: int
    verified: int
    needs_correction: int
    high_risk: int
    critical_risk: int
    status_distribution: Dict[str, int]
    risk_distribution: Dict[str, int]
    mismatch_type_counts: Dict[str, int]
    recent_activity: List[Dict[str, Any]]
