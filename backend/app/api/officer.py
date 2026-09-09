from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.application import Application
from app.models.user import User, UserRole
from app.models.audit import OfficerReview, AuditLog
from app.schemas.verification import OfficerReviewCreate
from app.schemas.application import OfficerReviewResponse, AuditLogResponse
from app.api.deps import get_current_user, get_current_officer

router = APIRouter()

@router.post("/{app_id}/review", response_model=OfficerReviewResponse)
def submit_officer_review(
    app_id: str,
    review_in: OfficerReviewCreate,
    db: Session = Depends(get_db),
    current_officer: User = Depends(get_current_officer)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if not review_in.comments or len(review_in.comments.strip()) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Officer review requires meaningful comments and justification (at least 5 characters)."
        )

    valid_decisions = ["VERIFIED", "REQUEST_CORRECTION", "ESCALATE"]
    if review_in.decision not in valid_decisions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid decision '{review_in.decision}'. Must be one of: {', '.join(valid_decisions)}"
        )

    old_status = app.status
    
    # Map decision to application status
    if review_in.decision == "VERIFIED":
        app.status = "VERIFIED"
    elif review_in.decision == "REQUEST_CORRECTION":
        app.status = "NEEDS_CORRECTION"
    elif review_in.decision == "ESCALATE":
        app.status = "ESCALATED"

    # Create OfficerReview
    rev = OfficerReview(
        application_id=app.id,
        officer_id=current_officer.id,
        decision=review_in.decision,
        comments=review_in.comments,
        reviewed_at=datetime.utcnow()
    )
    db.add(rev)

    # Immutable AuditLog entry
    audit = AuditLog(
        application_id=app.id,
        user_id=current_officer.id,
        action=f"OFFICER_DECISION_{review_in.decision}",
        previous_status=old_status,
        new_status=app.status,
        details=f"Officer {current_officer.full_name} submitted decision: {review_in.decision}. Remarks: {review_in.comments}"
    )
    db.add(audit)
    db.commit()
    db.refresh(rev)

    return OfficerReviewResponse(
        id=rev.id,
        application_id=rev.application_id,
        officer_id=rev.officer_id,
        officer_name=current_officer.full_name,
        decision=rev.decision,
        comments=rev.comments,
        reviewed_at=rev.reviewed_at
    )

@router.get("/{app_id}/audit", response_model=List[AuditLogResponse])
def get_audit_trail(app_id: str, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).filter(AuditLog.application_id == app_id).order_by(AuditLog.created_at.desc()).all()
    res = []
    for l in logs:
        u = db.query(User).filter(User.id == l.user_id).first() if l.user_id else None
        res.append(AuditLogResponse(
            id=l.id,
            application_id=l.application_id,
            user_id=l.user_id,
            user_name=u.full_name if u else "System",
            action=l.action,
            previous_status=l.previous_status,
            new_status=l.new_status,
            details=l.details,
            created_at=l.created_at
        ))
    return res
