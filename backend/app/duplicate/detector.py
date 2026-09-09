from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from rapidfuzz import fuzz
from app.models.application import Application
from app.models.document import Document
from app.verification.normalizer import normalize_name, normalize_survey_number

def check_duplicate_application(
    db: Session,
    target_app: Application
) -> List[Dict[str, Any]]:
    """
    Search historical applications for property entity overlaps or identical file hashes.
    Returns list of match candidates with similarity score and matching fields.
    """
    matches = []
    
    # Fetch all other applications
    other_apps = db.query(Application).filter(Application.id != target_app.id).all()
    if not other_apps:
        return matches

    target_survey = normalize_survey_number(target_app.primary_survey_no, target_app.subdivision_number)
    target_owner = normalize_name(target_app.applicant_name)
    target_dist = (target_app.district or "").lower().strip()
    target_taluk = (target_app.taluk or "").lower().strip()
    target_vil = (target_app.village or "").lower().strip()

    # Get target document hashes
    target_hashes = {d.file_hash for d in target_app.documents if d.file_hash}

    for app in other_apps:
        match_points = 0
        total_possible = 100
        matching_fields = []

        # 1. District & Village matching (Prerequisite for same parcel)
        app_dist = (app.district or "").lower().strip()
        app_vil = (app.village or "").lower().strip()

        if target_dist and target_dist == app_dist:
            match_points += 15
            matching_fields.append("District")

        if target_vil and target_vil == app_vil:
            match_points += 15
            matching_fields.append("Village")

        # 2. Survey & Subdivision match
        app_survey = normalize_survey_number(app.primary_survey_no, app.subdivision_number)
        if target_survey and app_survey:
            if target_survey == app_survey:
                match_points += 35
                matching_fields.append("Survey & Sub-division Number")
            elif target_survey.split('/')[0] == app_survey.split('/')[0]:
                match_points += 15
                matching_fields.append("Parent Survey Number")

        # 3. Applicant / Owner Name match
        app_owner = normalize_name(app.applicant_name)
        if target_owner and app_owner:
            sim = fuzz.token_sort_ratio(target_owner, app_owner)
            if sim >= 85:
                match_points += 20
                matching_fields.append(f"Applicant Name ({sim:.0f}% similarity)")
            elif sim >= 65:
                match_points += 10
                matching_fields.append(f"Applicant Name partial ({sim:.0f}%)")

        # 4. Document SHA-256 Hash Overlap
        other_hashes = {d.file_hash for d in app.documents if d.file_hash}
        common_hashes = target_hashes.intersection(other_hashes)
        if common_hashes:
            match_points += 30
            matching_fields.append(f"Identical Document File Hashes ({len(common_hashes)} file(s))")

        score = min(100.0, float(match_points))

        if score >= 60.0:
            matches.append({
                "matching_application_id": app.id,
                "matching_application_number": app.application_number,
                "matching_applicant_name": app.applicant_name,
                "similarity_score": round(score, 1),
                "matching_fields": matching_fields,
                "status": "POTENTIAL_DUPLICATE"
            })

    # Sort matches by similarity score descending
    matches.sort(key=lambda x: x["similarity_score"], reverse=True)
    return matches
