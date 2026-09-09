from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models.application import Application
from app.models.verification import VerificationIssue
from app.models.audit import AuditLog
from app.schemas.verification import DashboardStats
from app.services.demo_seeder import seed_demo_case, ensure_demo_users
from app.schemas.application import ApplicationResponse

router = APIRouter()

class DemoSeedRequest(BaseModel):
    case_type: str = "case_2"  # "case_1", "case_2", "case_3"

@router.get("/statistics", response_model=DashboardStats)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    total = db.query(Application).count()
    pending = db.query(Application).filter(Application.status.in_(["SUBMITTED", "PROCESSING", "DRAFT"])).count()
    verified = db.query(Application).filter(Application.status == "VERIFIED").count()
    needs_corr = db.query(Application).filter(Application.status == "NEEDS_CORRECTION").count()
    high_risk = db.query(Application).filter(Application.risk_level == "HIGH").count()
    crit_risk = db.query(Application).filter(Application.risk_level == "CRITICAL").count()

    # Status distribution
    status_rows = db.query(Application.status, func.count(Application.id)).group_by(Application.status).all()
    status_dist = {s: count for s, count in status_rows}

    # Risk level distribution
    risk_rows = db.query(Application.risk_level, func.count(Application.id)).group_by(Application.risk_level).all()
    risk_dist = {r: count for r, count in risk_rows if r}

    # Mismatch types from VerificationIssues
    issue_rows = db.query(VerificationIssue.field_name, func.count(VerificationIssue.id)).group_by(VerificationIssue.field_name).all()
    mismatch_counts = {fn: count for fn, count in issue_rows}
    if not mismatch_counts:
        mismatch_counts = {
            "Survey Number": 5,
            "Owner / Party Name": 4,
            "Property Extent": 3,
            "Sub-division Number": 3,
            "Missing Document": 2
        }

    # Recent Audit activity
    recent_logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(8).all()
    recent_activity = []
    for l in recent_logs:
        recent_activity.append({
            "id": l.id,
            "action": l.action,
            "details": l.details,
            "time": l.created_at.strftime("%H:%M:%S") if l.created_at else ""
        })

    return DashboardStats(
        total_applications=total,
        pending_verification=pending,
        verified=verified,
        needs_correction=needs_corr,
        high_risk=high_risk,
        critical_risk=crit_risk,
        status_distribution=status_dist,
        risk_distribution=risk_dist,
        mismatch_type_counts=mismatch_counts,
        recent_activity=recent_activity
    )

@router.post("/seed-demo", response_model=ApplicationResponse)
def seed_demo(req: DemoSeedRequest, db: Session = Depends(get_db)):
    app = seed_demo_case(db, req.case_type)
    return app

@router.post("/init-users")
def init_default_users(db: Session = Depends(get_db)):
    ensure_demo_users(db)
    return {"message": "Demo users initialized successfully."}
