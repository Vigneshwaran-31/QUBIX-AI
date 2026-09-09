from typing import List, Dict, Any, Optional
from app.verification.normalizer import (
    normalize_name, compare_names, normalize_survey_number, compare_extents
)

class ConsistencyIssue:
    def __init__(
        self,
        field_name: str,
        severity: str,
        document_a_type: str,
        document_b_type: str,
        value_a: str,
        value_b: str,
        explanation: str,
        risk_points: int,
        confidence: float = 1.0
    ):
        self.field_name = field_name
        self.severity = severity
        self.document_a_type = document_a_type
        self.document_b_type = document_b_type
        self.value_a = value_a
        self.value_b = value_b
        self.explanation = explanation
        self.risk_points = risk_points
        self.confidence = confidence

    def to_dict(self) -> Dict[str, Any]:
        return {
            "field_name": self.field_name,
            "severity": self.severity,
            "document_a_type": self.document_a_type,
            "document_b_type": self.document_b_type,
            "value_a": self.value_a,
            "value_b": self.value_b,
            "explanation": self.explanation,
            "risk_points": self.risk_points,
            "confidence": self.confidence,
            "status": "OPEN"
        }

def verify_cross_documents(
    documents_data: Dict[str, Dict[str, Any]],
    application_meta: Optional[Dict[str, Any]] = None
) -> List[ConsistencyIssue]:
    """
    Execute 10 cross-document consistency checks between Patta, Chitta, EC, and Sale Deed.
    documents_data format: {
        "PATTA": { "survey_number": ..., "owner_name": ..., "property_extent": ..., "village": ... },
        "CHITTA": { ... },
        "EC": { ... },
        "SALE_DEED": { ... }
    }
    """
    issues: List[ConsistencyIssue] = []
    
    doc_types = list(documents_data.keys())
    if len(doc_types) < 2:
        # Check if mandatory docs are missing
        for m_doc in ["PATTA", "SALE_DEED"]:
            if m_doc not in documents_data:
                issues.append(ConsistencyIssue(
                    field_name="Mandatory Document",
                    severity="MEDIUM",
                    document_a_type="APPLICATION",
                    document_b_type=m_doc,
                    value_a="Required",
                    value_b="Missing",
                    explanation=f"Mandatory document {m_doc} has not been uploaded for verification.",
                    risk_points=10
                ))
        return issues

    # 1. Survey Number & Sub-division Check
    survey_map = {}
    for dtype, data in documents_data.items():
        s_norm = normalize_survey_number(data.get("survey_number"), data.get("subdivision_number"))
        if s_norm:
            survey_map[dtype] = s_norm

    # Check pairwise or majority
    if len(survey_map) >= 2:
        base_type, base_survey = list(survey_map.items())[0]
        for dtype, survey_val in survey_map.items():
            if dtype != base_type:
                # Compare main survey parts
                p_base = base_survey.split('/')[0]
                p_curr = survey_val.split('/')[0]
                if p_base != p_curr:
                    issues.append(ConsistencyIssue(
                        field_name="Survey Number",
                        severity="CRITICAL",
                        document_a_type=base_type,
                        document_b_type=dtype,
                        value_a=base_survey,
                        value_b=survey_val,
                        explanation=f"Survey Number conflict: {base_type} specifies '{base_survey}', whereas {dtype} specifies '{survey_val}'.",
                        risk_points=35
                    ))
                elif base_survey != survey_val:
                    # Subdivision difference within survey number
                    issues.append(ConsistencyIssue(
                        field_name="Survey Number",
                        severity="CRITICAL",
                        document_a_type=base_type,
                        document_b_type=dtype,
                        value_a=base_survey,
                        value_b=survey_val,
                        explanation=f"Survey Number conflict: {base_type} specifies '{base_survey}', whereas {dtype} specifies '{survey_val}'.",
                        risk_points=35
                    ))

    # 2. Ownership / Party Name Check
    owner_map = {}
    for dtype, data in documents_data.items():
        name = data.get("owner_name")
        if name:
            owner_map[dtype] = name

    # Also compare with Sale Deed buyer if present
    if len(owner_map) >= 2:
        checked_pairs = set()
        for t1, n1 in owner_map.items():
            for t2, n2 in owner_map.items():
                if t1 != t2 and (t2, t1) not in checked_pairs:
                    checked_pairs.add((t1, t2))
                    is_match, score, desc = compare_names(n1, n2)
                    if not is_match:
                        issues.append(ConsistencyIssue(
                            field_name="Owner / Party Name",
                            severity="CRITICAL",
                            document_a_type=t1,
                            document_b_type=t2,
                            value_a=n1,
                            value_b=n2,
                            explanation=f"Ownership conflict: {t1} lists owner '{n1}', but {t2} lists '{n2}' (Similarity: {score}%). {desc}",
                            risk_points=30,
                            confidence=round(score / 100.0, 2)
                        ))

    # 3. Property Extent / Area Check
    extent_map = {dtype: data.get("property_extent") for dtype, data in documents_data.items() if data.get("property_extent")}
    if len(extent_map) >= 2:
        checked_ext = set()
        for t1, e1 in extent_map.items():
            for t2, e2 in extent_map.items():
                if t1 != t2 and (t2, t1) not in checked_ext:
                    checked_ext.add((t1, t2))
                    is_match, diff_pct, desc = compare_extents(e1, e2)
                    if not is_match:
                        issues.append(ConsistencyIssue(
                            field_name="Property Extent",
                            severity="HIGH",
                            document_a_type=t1,
                            document_b_type=t2,
                            value_a=e1,
                            value_b=e2,
                            explanation=f"Property extent mismatch between {t1} ({e1}) and {t2} ({e2}): {desc}",
                            risk_points=15
                        ))

    # 4. Administrative Boundaries & Location Check (Village, Taluk, District)
    for loc_field in ["village", "taluk", "district"]:
        loc_map = {dtype: data.get(loc_field) for dtype, data in documents_data.items() if data.get(loc_field)}
        if len(loc_map) >= 2:
            base_t, base_v = list(loc_map.items())[0]
            for t, v in loc_map.items():
                if t != base_t and base_v.lower().strip() != v.lower().strip():
                    issues.append(ConsistencyIssue(
                        field_name=f"Property {loc_field.capitalize()}",
                        severity="HIGH",
                        document_a_type=base_t,
                        document_b_type=t,
                        value_a=base_v,
                        value_b=v,
                        explanation=f"Jurisdiction discrepancy: {loc_field.capitalize()} in {base_t} is '{base_v}', but {t} states '{v}'.",
                        risk_points=15
                    ))

    # 5. Missing Mandatory Documents Check
    for req_doc in ["PATTA", "CHITTA", "EC", "SALE_DEED"]:
        if req_doc not in documents_data:
            issues.append(ConsistencyIssue(
                field_name="Missing Document",
                severity="MEDIUM",
                document_a_type="APPLICATION",
                document_b_type=req_doc,
                value_a="Required",
                value_b="Not Uploaded",
                explanation=f"{req_doc} document has not been uploaded for full cross-verification.",
                risk_points=10
            ))

    return issues
