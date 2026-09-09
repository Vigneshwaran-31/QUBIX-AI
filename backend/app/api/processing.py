from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any

from app.database import get_db
from app.models.application import Application
from app.models.document import Document
from app.models.verification import VerificationResult, VerificationIssue
from app.models.duplicate import DuplicateMatch
from app.models.user import User
from app.models.audit import AuditLog
from app.api.deps import get_current_user
from app.verification.engine import verify_cross_documents
from app.verification.risk_scorer import calculate_risk_score
from app.verification.explainable_ai import generate_ai_explanation
from app.duplicate.detector import check_duplicate_application
from app.schemas.application import VerificationResultResponse

router = APIRouter()

@router.post("/{app_id}/verify", response_model=VerificationResultResponse)
def run_verification_pipeline(
    app_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if not app.documents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No documents uploaded. Please upload at least Patta, Chitta, EC, or Sale Deed."
        )

    # 1. Collate document extractions
    documents_data: Dict[str, Dict[str, Any]] = {}
    for doc in app.documents:
        if doc.extraction:
            ext = doc.extraction
            documents_data[doc.document_type] = {
                "survey_number": ext.survey_number or app.primary_survey_no,
                "subdivision_number": ext.subdivision_number or app.subdivision_number,
                "owner_name": ext.owner_name or app.applicant_name,
                "property_extent": ext.property_extent or app.property_extent,
                "village": ext.village or app.village,
                "taluk": ext.taluk or app.taluk,
                "district": ext.district or app.district,
                "document_number": ext.document_number,
                "registration_date": ext.registration_date
            }

    # 2. Run Cross-Document Consistency Engine (10 Rules)
    issues = verify_cross_documents(documents_data, {
        "primary_survey_no": app.primary_survey_no,
        "applicant_name": app.applicant_name,
        "district": app.district,
        "village": app.village
    })

    # 3. Run Duplicate Application Detection
    dup_matches = check_duplicate_application(db, app)
    has_dup = len(dup_matches) > 0
    top_dup_score = dup_matches[0]["similarity_score"] if has_dup else 0.0

    # Save Duplicate Matches
    # Clear old matches
    db.query(DuplicateMatch).filter(DuplicateMatch.application_id == app.id).delete()
    for dm in dup_matches:
        d_rec = DuplicateMatch(
            application_id=app.id,
            matching_application_id=dm["matching_application_id"],
            similarity_score=dm["similarity_score"],
            matching_fields=dm["matching_fields"],
            status="POTENTIAL_DUPLICATE"
        )
        db.add(d_rec)

    # 4. Compute Risk Score & Category
    risk_score, risk_cat, breakdown = calculate_risk_score(issues, has_dup, top_dup_score)

    # 5. Generate Explainable AI Explanation
    dup_info = {
        "has_duplicate": has_dup,
        "matching_app_number": dup_matches[0]["matching_application_number"] if has_dup else "",
        "similarity": top_dup_score
    }
    ai_summary = generate_ai_explanation(
        documents_count=len(app.documents),
        issues=issues,
        risk_score=risk_score,
        risk_category=risk_cat,
        duplicate_info=dup_info
    )

    # 6. Persist or Update VerificationResult
    if app.verification_result:
        vr = app.verification_result
        vr.overall_risk_score = risk_score
        vr.risk_category = risk_cat
        vr.total_checks = 10
        vr.total_conflicts = len(issues)
        vr.ai_explanation_summary = ai_summary
        vr.verified_at = datetime.utcnow()
        # Delete old issues
        db.query(VerificationIssue).filter(VerificationIssue.verification_result_id == vr.id).delete()
    else:
        vr = VerificationResult(
            application_id=app.id,
            overall_risk_score=risk_score,
            risk_category=risk_cat,
            total_checks=10,
            total_conflicts=len(issues),
            ai_explanation_summary=ai_summary
        )
        db.add(vr)
        db.commit()
        db.refresh(vr)

    # Add issues
    for iss in issues:
        v_iss = VerificationIssue(
            verification_result_id=vr.id,
            field_name=iss.field_name,
            severity=iss.severity,
            document_a_type=iss.document_a_type,
            document_b_type=iss.document_b_type,
            value_a=iss.value_a,
            value_b=iss.value_b,
            explanation=iss.explanation,
            confidence=iss.confidence,
            risk_points=iss.risk_points,
            status="OPEN"
        )
        db.add(v_iss)

    # Update application risk score and level
    app.risk_score = risk_score
    app.risk_level = risk_cat
    if risk_cat == "LOW" and app.status == "PROCESSING":
        app.status = "VERIFIED"
    elif risk_cat in ["HIGH", "CRITICAL"] and app.status == "PROCESSING":
        app.status = "ESCALATED"

    # Audit log
    audit = AuditLog(
        application_id=app.id,
        user_id=current_user.id,
        action="RUN_VERIFICATION",
        details=f"Verification executed. Risk Score: {risk_score} ({risk_cat}). Conflicts: {len(issues)}"
    )
    db.add(audit)
    db.commit()
    db.refresh(vr)

    return vr
