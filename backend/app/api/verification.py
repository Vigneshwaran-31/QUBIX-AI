from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.application import Application
from app.models.verification import VerificationResult, VerificationIssue
from app.schemas.verification import CrossDocComparisonRow, CrossDocComparisonMatrix
from app.schemas.application import VerificationResultResponse, VerificationIssueResponse

router = APIRouter()

@router.get("/{app_id}/verification", response_model=VerificationResultResponse)
def get_verification_result(app_id: str, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if not app.verification_result:
        raise HTTPException(status_code=404, detail="Verification has not been executed yet for this application.")
    
    return app.verification_result

@router.get("/{app_id}/comparison-matrix", response_model=CrossDocComparisonMatrix)
def get_comparison_matrix(app_id: str, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Map document extractions by type
    docs_by_type = {}
    for doc in app.documents:
        if doc.extraction:
            docs_by_type[doc.document_type] = doc.extraction

    fields_to_compare = [
        ("survey_number", "Survey Number"),
        ("subdivision_number", "Sub-Division Number"),
        ("owner_name", "Owner / Buyer Name"),
        ("property_extent", "Property Extent / Area"),
        ("village", "Village"),
        ("taluk", "Taluk"),
        ("district", "District"),
        ("document_number", "Document / Registration No"),
        ("registration_date", "Registration Date")
    ]

    issues = app.verification_result.issues if app.verification_result else []
    issue_fields = {iss.field_name.lower(): iss for iss in issues}

    matrix_rows = []
    total_conflicts = 0

    for field_key, field_label in fields_to_compare:
        patta_val = getattr(docs_by_type.get("PATTA"), field_key, None)
        chitta_val = getattr(docs_by_type.get("CHITTA"), field_key, None)
        ec_val = getattr(docs_by_type.get("EC"), field_key, None)
        sale_val = getattr(docs_by_type.get("SALE_DEED"), field_key, None)

        # Collect present non-empty values
        present_vals = [v for v in [patta_val, chitta_val, ec_val, sale_val] if v]

        if not present_vals:
            status_val = "NOT_AVAILABLE"
            explanation = "Field not extracted or not applicable across submitted documents."
            sev = None
        else:
            # Check if this field has a flagged issue
            matching_iss = None
            for ifield, iss in issue_fields.items():
                if field_label.lower() in ifield or ifield in field_label.lower():
                    matching_iss = iss
                    break

            if matching_iss:
                status_val = "CONFLICT"
                total_conflicts += 1
                sev = matching_iss.severity
                explanation = matching_iss.explanation
            elif len(set([v.strip().lower() for v in present_vals])) == 1:
                status_val = "MATCH"
                sev = None
                explanation = f"Consistent match across all available documents: '{present_vals[0]}'"
            else:
                # Partial variation
                status_val = "PARTIAL"
                sev = "LOW"
                explanation = f"Minor textual or formatting variation across documents: {', '.join(present_vals)}"

        matrix_rows.append(CrossDocComparisonRow(
            field_key=field_key,
            field_label=field_label,
            patta=patta_val or "—",
            chitta=chitta_val or "—",
            ec=ec_val or "—",
            sale_deed=sale_val or "—",
            status=status_val,
            severity=sev,
            explanation=explanation
        ))

    overall = "CLEAN" if total_conflicts == 0 else ("CRITICAL_DISCREPANCY" if total_conflicts >= 2 else "FLAGGED_REVIEW")

    return CrossDocComparisonMatrix(
        application_id=app.id,
        application_number=app.application_number,
        rows=matrix_rows,
        overall_status=overall,
        total_conflicts=total_conflicts
    )

@router.get("/{app_id}/issues", response_model=List[VerificationIssueResponse])
def get_verification_issues(app_id: str, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app or not app.verification_result:
        return []
    return app.verification_result.issues
