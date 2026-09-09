from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ReportSummary(BaseModel):
    application_number: str
    applicant_name: str
    district: str
    taluk: str
    village: str
    primary_survey_no: str
    risk_score: float
    risk_category: str
    status: str
    generated_at: datetime
    documents_reviewed: List[Dict[str, Any]]
    key_findings: List[Dict[str, Any]]
    officer_decision: Optional[Dict[str, Any]] = None
    ai_explanation: Optional[str] = None
    disclaimer: str
