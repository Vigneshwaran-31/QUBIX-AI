from typing import List, Dict, Any, Tuple

def calculate_risk_score(issues: List[Any], has_duplicate: bool = False, duplicate_score: float = 0.0) -> Tuple[float, str, List[Dict[str, Any]]]:
    """
    Calculate explainable AI-assisted verification risk score (0 - 100).
    Returns: (final_score, category, breakdown_items)
    """
    raw_points = 0
    breakdown: List[Dict[str, Any]] = []

    for issue in issues:
        pts = getattr(issue, "risk_points", 0) if hasattr(issue, "risk_points") else issue.get("risk_points", 0)
        field = getattr(issue, "field_name", "Field") if hasattr(issue, "field_name") else issue.get("field_name", "Field")
        sev = getattr(issue, "severity", "INFO") if hasattr(issue, "severity") else issue.get("severity", "INFO")
        
        raw_points += pts
        breakdown.append({
            "field": field,
            "severity": sev,
            "points": pts,
            "reason": f"+{pts} {sev} risk: {field} inconsistency detected"
        })

    if has_duplicate:
        dup_pts = 25 if duplicate_score < 90 else 35
        raw_points += dup_pts
        breakdown.append({
            "field": "Duplicate Application",
            "severity": "CRITICAL" if duplicate_score >= 90 else "HIGH",
            "points": dup_pts,
            "reason": f"+{dup_pts} Potential duplicate record detected ({duplicate_score:.1f}% similarity)"
        })

    final_score = min(100.0, float(raw_points))

    if final_score <= 20:
        category = "LOW"
    elif final_score <= 50:
        category = "MEDIUM"
    elif final_score <= 75:
        category = "HIGH"
    else:
        category = "CRITICAL"

    return round(final_score, 1), category, breakdown
