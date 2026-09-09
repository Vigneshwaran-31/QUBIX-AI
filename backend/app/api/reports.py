from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models.application import Application
from app.schemas.report import ReportSummary
from app.services.pdf_report import generate_verification_pdf

router = APIRouter()

@router.get("/{app_id}/report", response_model=ReportSummary)
def get_report_json(app_id: str, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    docs_info = [{"document_type": d.document_type, "file_name": d.file_name, "status": d.ocr_status} for d in app.documents]
    findings = []
    if app.verification_result:
        for iss in app.verification_result.issues:
            findings.append({
                "field": iss.field_name,
                "severity": iss.severity,
                "explanation": iss.explanation,
                "risk_points": iss.risk_points
            })

    latest_review = None
    if app.reviews:
        r = app.reviews[-1]
        latest_review = {
            "decision": r.decision,
            "comments": r.comments,
            "reviewed_at": r.reviewed_at
        }

    return ReportSummary(
        application_number=app.application_number,
        applicant_name=app.applicant_name,
        district=app.district,
        taluk=app.taluk,
        village=app.village,
        primary_survey_no=app.primary_survey_no,
        risk_score=app.risk_score,
        risk_category=app.risk_level,
        status=app.status,
        generated_at=datetime.utcnow(),
        documents_reviewed=docs_info,
        key_findings=findings,
        officer_decision=latest_review,
        ai_explanation=app.verification_result.ai_explanation_summary if app.verification_result else None,
        disclaimer="This verification report provides AI-assisted pre-verification decision support and does not constitute statutory legal determination of land title."
    )

@router.get("/{app_id}/report/pdf")
def download_report_pdf(app_id: str, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    pdf_bytes = generate_verification_pdf(app, db)
    filename = f"QUBIX_Verification_Report_{app.application_number}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
