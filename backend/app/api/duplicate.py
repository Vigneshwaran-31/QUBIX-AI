from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.application import Application
from app.models.duplicate import DuplicateMatch
from app.duplicate.detector import check_duplicate_application
from app.schemas.application import DuplicateMatchResponse
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/{app_id}/duplicate-check", response_model=List[DuplicateMatchResponse])
def trigger_duplicate_check(
    app_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    matches = check_duplicate_application(db, app)
    
    # Refresh stored matches
    db.query(DuplicateMatch).filter(DuplicateMatch.application_id == app.id).delete()
    saved = []
    for m in matches:
        dm = DuplicateMatch(
            application_id=app.id,
            matching_application_id=m["matching_application_id"],
            similarity_score=m["similarity_score"],
            matching_fields=m["matching_fields"],
            status=m["status"]
        )
        db.add(dm)
        saved.append(dm)
    db.commit()

    # Format response
    res = []
    for d in saved:
        matching_app = db.query(Application).filter(Application.id == d.matching_application_id).first()
        res.append(DuplicateMatchResponse(
            id=d.id,
            application_id=d.application_id,
            matching_application_id=d.matching_application_id,
            similarity_score=d.similarity_score,
            matching_fields=d.matching_fields if isinstance(d.matching_fields, list) else [],
            status=d.status,
            detected_at=d.detected_at,
            matching_application_number=matching_app.application_number if matching_app else "APP-HISTORIC",
            matching_applicant_name=matching_app.applicant_name if matching_app else "Unknown"
        ))
    return res

@router.get("/{app_id}/duplicates", response_model=List[DuplicateMatchResponse])
def get_duplicates(app_id: str, db: Session = Depends(get_db)):
    matches = db.query(DuplicateMatch).filter(DuplicateMatch.application_id == app_id).all()
    res = []
    for d in matches:
        matching_app = db.query(Application).filter(Application.id == d.matching_application_id).first()
        res.append(DuplicateMatchResponse(
            id=d.id,
            application_id=d.application_id,
            matching_application_id=d.matching_application_id,
            similarity_score=d.similarity_score,
            matching_fields=d.matching_fields if isinstance(d.matching_fields, list) else [],
            status=d.status,
            detected_at=d.detected_at,
            matching_application_number=matching_app.application_number if matching_app else "APP-HISTORIC",
            matching_applicant_name=matching_app.applicant_name if matching_app else "Unknown"
        ))
    return res
