from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from app.database import get_db
from app.models.application import Application
from app.models.user import User
from app.models.audit import AuditLog
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse, ApplicationSummary
from app.api.deps import get_current_user

router = APIRouter()

@router.post("", response_model=ApplicationResponse)
def create_application(
    app_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app_num = f"APP-2026-{datetime.utcnow().strftime('%m%d%H%M')}-{str(uuid.uuid4())[:4].upper()}"
    app = Application(
        application_number=app_num,
        applicant_id=current_user.id,
        applicant_name=app_in.applicant_name,
        applicant_phone=app_in.applicant_phone,
        applicant_email=app_in.applicant_email or current_user.email,
        district=app_in.district,
        taluk=app_in.taluk,
        village=app_in.village,
        primary_survey_no=app_in.primary_survey_no,
        subdivision_number=app_in.subdivision_number,
        property_extent=app_in.property_extent,
        notes=app_in.notes,
        status="SUBMITTED",
        risk_score=0.0,
        risk_level="PENDING"
    )
    db.add(app)
    db.commit()
    db.refresh(app)

    # Log action
    log = AuditLog(
        application_id=app.id,
        user_id=current_user.id,
        action="CREATE_APPLICATION",
        new_status="SUBMITTED",
        details=f"New application created for Survey {app.primary_survey_no}, {app.village} village."
    )
    db.add(log)
    db.commit()

    return app

@router.get("", response_model=List[ApplicationSummary])
def list_applications(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    district: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Application)
    
    # If Citizen, only view own applications
    if current_user.role == "CITIZEN":
        query = query.filter(Application.applicant_id == current_user.id)

    if status_filter and status_filter != "ALL":
        query = query.filter(Application.status == status_filter)
    
    if district and district != "ALL":
        query = query.filter(Application.district.ilike(f"%{district}%"))

    if search:
        query = query.filter(
            (Application.application_number.ilike(f"%{search}%")) |
            (Application.applicant_name.ilike(f"%{search}%")) |
            (Application.primary_survey_no.ilike(f"%{search}%"))
        )

    apps = query.order_by(Application.created_at.desc()).all()
    
    results = []
    for a in apps:
        results.append(ApplicationSummary(
            id=a.id,
            application_number=a.application_number,
            applicant_name=a.applicant_name,
            district=a.district,
            primary_survey_no=a.primary_survey_no,
            documents_count=len(a.documents),
            risk_score=a.risk_score,
            risk_level=a.risk_level,
            status=a.status,
            created_at=a.created_at
        ))
    return results

@router.get("/{app_id}", response_model=ApplicationResponse)
def get_application(
    app_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check permissions
    if current_user.role == "CITIZEN" and app.applicant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return app

@router.put("/{app_id}", response_model=ApplicationResponse)
def update_application(
    app_id: str,
    app_update: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    old_status = app.status
    for field, val in app_update.model_dump(exclude_unset=True).items():
        setattr(app, field, val)

    if app.status != old_status:
        log = AuditLog(
            application_id=app.id,
            user_id=current_user.id,
            action="UPDATE_STATUS",
            previous_status=old_status,
            new_status=app.status,
            details=f"Status changed from {old_status} to {app.status}"
        )
        db.add(log)

    db.commit()
    db.refresh(app)
    return app

@router.delete("/{app_id}")
def delete_application(
    app_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db.delete(app)
    db.commit()
    return {"message": "Application deleted successfully"}
